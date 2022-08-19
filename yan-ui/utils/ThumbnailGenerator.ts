import { FileEntity } from '../type/types'
import mitt, { Emitter } from 'mitt'

import FileUtils from './FileUtils'
import exifr from 'exifr'
/**
 * The Thumbnail Generator plugin
 */
import VideoThumbnails from './VideoThumbnailGenerator'

export default class ThumbnailGenerator {
    private queue: FileEntity[] = []
    private queueProcessing = false
    private defaultThumbnailDimension: number = 0
    private thumbnailType: string
    private thumbnailQuality: number

    private opts = {
        thumbnailType: 'image/jpeg',
        quality: 80,
        thumbnailWidth: 200,
        thumbnailHeight: 200,
    }
    public event: Emitter<any> = mitt()

    constructor(opts: any = {}) {
        this.queue = []
        this.queueProcessing = false
        this.defaultThumbnailDimension = 200
        this.thumbnailType = this.opts.thumbnailType || 'image/jpeg'
        this.thumbnailQuality = this.opts.quality || 80

        this.opts = { ...this.opts, ...opts }
    }

    /**
     * Create a thumbnail for the given Uppy file object.
     *
     * @param {{data: Blob}} file
     * @param {number} targetWidth
     * @param {number} targetHeight
     * @returns {Promise}
     */
    createThumbnail(
        file: FileEntity,
        targetWidth: number,
        targetHeight: number,
    ) {
        const originalUrl = URL.createObjectURL(file.upload_object.source_file)

        const onload = new Promise((resolve, reject) => {
            const image = new Image()
            image.src = originalUrl
            image.addEventListener('load', () => {
                URL.revokeObjectURL(originalUrl)
                resolve(image)
            })
            image.addEventListener('error', (event) => {
                URL.revokeObjectURL(originalUrl)
                this.event.emit('unsupported', file)
                reject(event.error || new Error('Could not create thumbnail'))
            })
        })

        const orientationPromise = exifr
            .rotation(file.upload_object.source_file)
            .catch(() => 1)

        return Promise.all([onload, orientationPromise])
            .then(([image, orientation]: [any, any]) => {
                const dimensions = this.getProportionalDimensions(
                    image.width,
                    image.height,
                    targetWidth,
                    targetHeight,
                    orientation.deg,
                )
                const rotatedImage = this.rotateImage(image, orientation)
                const resizedImage = this.resizeImage(
                    rotatedImage,
                    dimensions.width,
                    dimensions.height,
                ) as HTMLCanvasElement
                return this.canvasToBlob(
                    resizedImage,
                    this.thumbnailType,
                    this.thumbnailQuality,
                )
            })
            .then((blob) => {
                return URL.createObjectURL(blob)
            })
    }

    /**
     * Get the new calculated dimensions for the given image and a target width
     * or height. If both width and height are given, only width is taken into
     * account. If neither width nor height are given, the default dimension
     * is used.
     */
    public getProportionalDimensions(
        source_width: number,
        source_height: number,
        width: number,
        height: number,
        rotation: number,
    ) {
        let aspect = 1
        if (rotation === 90 || rotation === 270) {
            aspect = source_height / source_width
        } else {
            aspect = source_width / source_height
        }

        if (width != null) {
            return {
                width,
                height: Math.round(width / aspect),
            }
        }

        if (height != null) {
            return {
                width: Math.round(height * aspect),
                height,
            }
        }

        return {
            width: this.defaultThumbnailDimension,
            height: Math.round(this.defaultThumbnailDimension / aspect),
        }
    }

    public protect(
        image: HTMLImageElement | HTMLCanvasElement,
    ): HTMLImageElement | HTMLCanvasElement {
        const ratio = image.width / image.height

        const maxSquare = 5000000 // ios max canvas square
        const maxSize = 4096 // ie max canvas dimensions

        let maxW = Math.floor(Math.sqrt(maxSquare * ratio))
        let maxH = Math.floor(maxSquare / Math.sqrt(maxSquare * ratio))

        if (maxW > maxSize) {
            maxW = maxSize
            maxH = Math.round(maxW / ratio)
        }
        if (maxH > maxSize) {
            maxH = maxSize
            maxW = Math.round(ratio * maxH)
        }
        if (image.width > maxW) {
            const canvas = document.createElement('canvas')
            canvas.width = maxW
            canvas.height = maxH
            const context = canvas.getContext('2d')
            if (context) {
                context.drawImage(image, 0, 0, maxW, maxH)
            }
            return canvas
        }
        return image
    }

    public resizeImage(
        image: HTMLImageElement | HTMLCanvasElement,
        targetWidth: number,
        targetHeight: number,
    ): HTMLImageElement | HTMLCanvasElement {
        image = this.protect(image)

        let steps = Math.ceil(Math.log2(image.width / targetWidth))
        if (steps < 1) {
            steps = 1
        }
        let sW = targetWidth * 2 ** (steps - 1)
        let sH = targetHeight * 2 ** (steps - 1)
        const x = 2

        while (steps--) {
            const canvas = document.createElement('canvas')
            canvas.width = sW
            canvas.height = sH
            const context = canvas.getContext('2d')
            if (context) {
                context.drawImage(image, 0, 0, sW, sH)
            }
            image = canvas

            sW = Math.round(sW / x)
            sH = Math.round(sH / x)
        }

        return image
    }

    public rotateImage(
        image: HTMLImageElement | HTMLCanvasElement,
        translate: any,
    ) {
        let w = image.width
        let h = image.height

        if (translate.deg === 90 || translate.deg === 270) {
            w = image.height
            h = image.width
        }

        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h

        const context = canvas.getContext('2d')
        if (context) {
            context.translate(w / 2, h / 2)
            if (translate.canvas) {
                context.rotate(translate.rad)
                context.scale(translate.scaleX, translate.scaleY)
            }
            context.drawImage(
                image,
                -image.width / 2,
                -image.height / 2,
                image.width,
                image.height,
            )
        }

        return canvas
    }

    public canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: any) {
        try {
            const context = canvas.getContext('2d')
            if (context) {
                context.getImageData(0, 0, 1, 1)
            } else {
                throw new Error()
            }
        } catch (err: any) {
            if (err.code === 18) {
                return Promise.reject(
                    new Error(
                        'cannot read image, probably an svg with external resources',
                    ),
                )
            }
        }

        if (canvas.toBlob) {
            return new Promise((resolve) => {
                canvas.toBlob(resolve, type, quality)
            }).then((blob) => {
                if (blob === null) {
                    throw new Error(
                        'cannot read image, probably an svg with external resources',
                    )
                }
                return blob
            })
        }
        return Promise.resolve()
            .then(() => {
                return FileUtils.dataURItoBlob(
                    canvas.toDataURL(type, quality),
                    {},
                )
            })
            .then((blob) => {
                if (blob === null) {
                    throw new Error(
                        'could not extract blob, probably an old browser',
                    )
                }
                return blob
            })
    }

    public setPreviewURL(file: FileEntity, thumbnail: string) {
        file.upload_object.thumbnail = thumbnail
        delete file.upload_object.thumbnail_generating
    }

    public setRunningUrl(file: FileEntity) {
        file.upload_object.thumbnail_generating = true
    }

    public addToQueue(file: FileEntity) {
        this.setRunningUrl(file)
        this.queue.push(file)
        if (this.queueProcessing === false) {
            this.processQueue()
        }
    }

    public async processQueue(): Promise<void> {
        this.queueProcessing = true
        if (this.queue.length > 0) {
            const current = this.queue.shift()
            if (!current) {
                console.error(
                    '[ThumbnailGenerator] file was removed before a thumbnail could be generated, but not removed from the queue. This is probably a bug',
                    'error',
                )
                return
            }
            return this.requestThumbnail(current)
                .catch(() => {
                    this.event.emit('unsupported', current)
                })
                .then(() => this.processQueue())
        }
        this.queueProcessing = false
        this.event.emit('all-generated')
    }

    requestThumbnail(file: FileEntity) {
        if (FileUtils.isImagePreviewSupported(file.mime_type)) {
            return this.createThumbnail(
                file,
                this.opts.thumbnailWidth,
                this.opts.thumbnailHeight,
            )
                .then((thumbnail) => {
                    this.setPreviewURL(file, thumbnail)
                    //console.log(
                    //    `[ThumbnailGenerator] Generated Thumbnail for ${file.id}`,
                    //)
                    this.event.emit('generated', { file, thumbnail })
                })
                .catch((err) => {
                    //console.log(
                    //    `[ThumbnailGenerator] Failed Image Thumbnail for ${file.id}:`,
                    //    'warning',
                    //)
                    //console.warn(err, 'warning')
                    this.event.emit('unsupported', file)
                    this.event.emit('error', { file, err })
                })
        } else if (FileUtils.isVideoPreviewSupported(file.mime_type)) {
            const thumbnails = new VideoThumbnails({
                count: 1,
                maxWidth: this.opts.thumbnailWidth,
                maxHeight: this.opts.thumbnailHeight,
                thumbnailType: this.thumbnailType,
                thumbnailQuality: this.thumbnailQuality,
            })

            const reset = () => {
                console.error('[THUMBNAIL BRR]', file)
                this.event.emit('unsupported', file)
                thumbnails.destroy()
            }

            //Captured a thumb
            thumbnails.event.on('capture', (thumbnail: any) => {
                this.setPreviewURL(file, thumbnail)
                //console.log(
                //    `[ThumbnailGenerator] Generated Video Thumbnail for ${file.id}`,
                //)
                this.event.emit('generated', { file, thumbnail })
                thumbnails.destroy()
            })

            thumbnails.event.on('unsupported', () => reset())
            thumbnails.event.on('aborted', () => reset())
            thumbnails.capture(file.upload_object.source_file)
        }
        return Promise.resolve()
    }

    onFileAdded = (files: FileEntity | FileEntity[]) => {
        if (!Array.isArray(files)) {
            files = [files]
        }
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (
                !file.thumbnail &&
                file.upload_object.source_file &&
                (FileUtils.isImagePreviewSupported(file.mime_type) ||
                    FileUtils.isVideoPreviewSupported(file.mime_type))
            ) {
                this.addToQueue(file)
            } else {
                if (file && file.upload_object) {
                    this.event.emit('unsupported', file)
                }
            }
        }
    }

    /**
     * Cancel a lazy request for a thumbnail if the thumbnail has not yet been generated.
     */
    onCancelRequest = (file: FileEntity) => {
        const index = this.queue.findIndex((f) => f.id == file.id)
        if (index !== -1) {
            this.queue.splice(index, 1)
        }
    }

    /**
     * Clean up the thumbnail for a file. Cancel lazy requests and free the thumbnail URL.
     */
    onFileRemoved = (file: FileEntity) => {
        const index = this.queue.findIndex((f) => f.id == file.id)
        if (index !== -1) {
            this.queue.splice(index, 1)
        }

        // Clean up object URLs.
        if (
            file.upload_object.thumbnail &&
            FileUtils.isObjectURL(file.upload_object.thumbnail)
        ) {
            URL.revokeObjectURL(file.upload_object.thumbnail)
        }
    }

    install() {
        this.event.on('file-removed', this.onFileRemoved)
        this.event.on('file-added', this.onFileAdded)
        this.event.on('cancel', this.onCancelRequest)
    }

    uninstall() {
        this.event.off('file-removed', this.onFileRemoved)
        this.event.off('file-added', this.onFileAdded)
        this.event.off('cancel', this.onCancelRequest)
    }
}
