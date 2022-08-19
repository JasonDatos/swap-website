//@ts-nocheck
/* eslint-disable */

import mitt, { Emitter } from 'mitt'
import FileUtils from './FileUtils'

export default class VideoThumbnails {
    private videoElement: HTMLVideoElement | null = null
    private videoHeight: number | null = null
    private videoWidth: number | null = null
    private thumbWidth: number | null = null
    private thumbHeight: number | null = null
    private videoDuration: number | null = null
    private videoInterval: number | null = null
    private videoStart: number | null = null
    private completed = 0
    private captures: Array<any> = []
    private capturesDetailed: any = {}
    private events: any = {}
    private currentShot = 0
    private startTime: number | null = null
    private lastTime: number | null = null
    private defaults = {
        maxWidth: 1280,
        maxHeight: 1280,
        count: 1,
        thumbnailType: 'image/jpeg',
        thumbnailQuality: 80,
    }
    private opts: any = {}
    public event: Emitter<any> = mitt()

    constructor(opts = {}) {
        /**
         * Current options
         * @type {Object}
         */
        this.opts = { ...this.defaults, ...opts }
    }
    /**
     * Start capturing
     * @param  {file} file   The local filename to work with
     */
    public capture(file: File) {
        this.event.emit('beforeCapture')
        this.lastTime = this.startTime = new Date().getTime()
        const data = new FormData()
        data.append('file', file, file.name)
        const url = window.URL || window.webkitURL
        const fileURL = url.createObjectURL(file)
        const videoElement = document.createElement('video')
        videoElement.src = fileURL
        videoElement.preload = 'metadata'
        videoElement.id = 'videoHtmlCapture'
        videoElement.controls = true
        videoElement.width = 600
        videoElement.crossOrigin = '*'

        const sourceElement = document.createElement('source')
        sourceElement.src = fileURL
        sourceElement.type = file.type

        videoElement.appendChild(sourceElement)
        this.videoElement = videoElement

        //As soon as the meta is ready, trigger that capture is ready
        this.videoElement.onloadedmetadata = () => {
            this.event.emit('startCapture', this.captures)
            if (this.videoElement) {
                this.videoElement.play()
            }
        }
        //Trigger the capture here because the video is ready
        this.videoElement.onplay = () => {
            this.initScreenshot()
        }
        //Can't play this video
        this.videoElement.onerror = () => {
            this.event.emit('unsupported')
        }
        this.videoElement.addEventListener('seeked', () => {
            //Check we still have a video (might have been cancelled)
            if (this.videoElement) {
                this.videoElement.pause()
                this.captureScreenShot()
            }
        })
    }
    /**
     * Setup the screenshot
     */
    public initScreenshot() {
        if (!this.videoElement) {
            return
        }
        this.thumbWidth = this.videoElement.videoWidth
        this.thumbHeight = this.videoElement.videoHeight
        //Wide video
        if (this.thumbWidth > this.thumbHeight) {
            const ratio = this.opts.maxWidth / this.thumbWidth
            this.thumbWidth = this.opts.maxWidth
            this.thumbHeight = this.thumbHeight * ratio
            //square video
        } else if (this.thumbWidth === this.thumbHeight) {
            this.thumbWidth = this.opts.maxWidth
            this.thumbHeight = this.opts.maxHeight
            //tall video
        } else {
            const ratio = this.opts.maxHeight / this.thumbHeight
            this.thumbHeight = this.opts.maxHeight
            //@ts-ignore
            this.thumbWidth = this.thumbHeight * ratio
        }
        this.videoElement.style.width = this.thumbWidth + 'px'
        this.videoElement.style.height = this.thumbHeight + 'px'
        this.videoDuration = this.videoElement.duration
        this.videoInterval = this.videoDuration / (this.opts.count + 1) //this will ensure credits are ignored
        this.videoStart = this.videoInterval / 2
        //Prepare the next shot

        this.prepareScreenshot()
    }
    /**
     * This will work out what the next shot is, and move the video to that point (doesn't take the shot)
     * Doesn't return anything. The video seek will capture the shot
     */
    public prepareScreenshot() {
        if (!this.videoStart || !this.videoInterval || !this.videoElement) {
            return
        }

        this.currentShot++
        const newTime = Math.floor(
            this.videoStart +
                this.currentShot * this.videoInterval -
                this.videoInterval,
        )
        const statTime = this.getTime()
        this.capturesDetailed[this.currentShot] = {
            capture: this.currentShot,
            width: this.thumbWidth,
            height: this.thumbHeight,
            timeindex: newTime,
            startTime: statTime.fromStart,
            captureTime: null,
        }
        this.videoElement.currentTime = newTime
    }
    /**
     * Capture the shot by using a canvas element
     */
    public captureScreenShot() {
        if (!this.videoElement || !this.thumbWidth || !this.thumbHeight) {
            return
        }

        const canvas = document.createElement('canvas')
        canvas.width = this.thumbWidth
        canvas.height = this.thumbHeight

        const ctx = canvas.getContext('2d')
        if (ctx) {
            ctx.drawImage(
                this.videoElement,
                0,
                0,
                this.thumbWidth,
                this.thumbHeight,
            )
        }
        //and save
        this.save(canvas)
    }
    /**
     * Save the captire
     * @param  {canvas} canvas The captured thumb
     */
    public save(canvas: HTMLCanvasElement) {
        //Get the shot
        const theCapture = FileUtils.dataURItoBlob(
            canvas.toDataURL(
                this.opts.thumbnailType,
                this.opts.thumbnailQuality,
            ),
            {},
        )
        //done
        this.grabComplete(theCapture)
    }
    /**
     * Complete the
     * @param  {image} image   The image captured
     */
    public grabComplete(image: Blog) {
        const counter = this.currentShot
        this.completed += 1
        //Stats are nice
        const statTime = this.getTime()
        //Save it to the array
        const imageObject = URL.createObjectURL(image)
        this.captures.push(imageObject)
        this.capturesDetailed[counter].url = imageObject
        this.capturesDetailed[counter].captureTime = statTime.diff
        //Fire the event incase anyone is listening
        this.event.emit('capture', imageObject)
        //All done so remove the elements
        if (this.completed >= this.opts.count) {
            this.cleanUp()
            this.event.emit('complete', this.captures)
            const stats = this.getTime()
            this.event.emit('completeDetail', {
                thumbs: this.capturesDetailed,
                totalTime: stats.fromStart,
                details: {
                    thumbnailCount: this.opts.count,
                    videoDuration: this.videoDuration,
                    videoInterval: this.videoInterval,
                    thumbWidth: this.thumbWidth,
                    thumbHeight: this.thumbHeight,
                    videoStart: this.videoStart,
                },
            })
        } else {
            //Prepare the next shot
            this.prepareScreenshot()
        }
    }
    /**
     * Clean up our files etc. Gets expensive on the CPU if it's all still running
     */
    public cleanUp() {
        this.videoElement = null
    }

    public destroy() {
        this.event.all.clear()
        this.cleanUp()
    }
    /**
     * Force and abort of the capture
     */
    public abort() {
        //already finished
        if (this.completed >= this.opts.count) {
            return
        }
        //crude but effective
        this.completed = this.opts.count + 1
        //Do some tidying
        this.cleanUp()
        this.event.emit('aborted', this.captures)
    }
    /**
     * time tracking for our inner stats geek
     * @return {array} The stats
     */
    public getTime(): any {
        if (!this.startTime || !this.lastTime) {
            return
        }
        const thisTime = new Date().getTime()
        const diff = thisTime - this.lastTime
        const fromStart = thisTime - this.startTime
        this.lastTime = thisTime
        return {
            diff: diff,
            fromStart: fromStart,
        }
    }

    /**
     * If option is a function, evaluate it with given params
     * @param {*} data
     * @param {...} args arguments of a callback
     * @returns {*}
     */
    public evalOpts(data: any, args: any) {
        if (typeof data === 'function') {
            // `arguments` is an object, not array, in FF, so:
            args = Array.prototype.slice.call(arguments)
            data = data.apply(null, args.slice(1))
        }
        return data
    }

    /**
     * Iterate each element of an object
     * @function
     * @param {Array|Object} obj object or an array to iterate
     * @param {Function} callback first argument is a value and second is a key.
     * @param {Object=} context Object to become context (`this`) for the iterator function.
     */
    public each(obj: any, callback: any, context: any) {
        if (!obj) {
            return
        }
        let key
        // Is Array?
        if (typeof obj.length !== 'undefined') {
            for (key = 0; key < obj.length; key++) {
                if (callback.call(context, obj[key], key) === false) {
                    return
                }
            }
        } else {
            for (key in obj) {
                if (
                    Object.prototype.hasOwnProperty.call(obj, key) &&
                    callback.call(context, obj[key], key) === false
                ) {
                    return
                }
            }
        }
    }
    /**
     * Useful function for remove something from and array
     * @param  {array} array    array object to modify
     * @param  {string} value   value to find
     */
    private arrayRemove(array: Array<any>, value: any) {
        const index = array.indexOf(value)
        if (index > -1) {
            array.splice(index, 1)
        }
    }
}
