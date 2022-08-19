import { BreadcrumbItem, FileEntity } from '../type/types'

export default class FileUtils {
    public static path_to_breadcrumb_item(path: string): Array<BreadcrumbItem> {
        return [
            { icon: 'folder', text: 'Home', link: '/home' },
            { icon: 'folder', text: 'Pictures', link: '/pictures' },
            { icon: 'folder', text: 'Vacation', link: '/vacation' },
            { icon: 'folder', text: '2021', link: '/2021' },
            { icon: 'folder', text: 'Berlin', link: '/berlin' },
            {
                icon: 'folder',
                text: 'Representatives',
                link: '/house-of-representatives',
            },
        ]
    }

    public static byte_to_human_readable(
        bytes: number,
        decimal: number = 2,
    ): string {
        if (bytes < 1024) {
            return bytes + ' B'
        } else if (bytes < 1048576) {
            return (bytes / 1024).toFixed(decimal) + ' KB'
        } else if (bytes < 1073741824) {
            return (bytes / 1048576).toFixed(decimal) + ' MB'
        } else if (bytes < 1099511627776) {
            return (bytes / 1073741824).toFixed(decimal) + ' GB'
        } else if (bytes < 1125899906842624) {
            return (bytes / 1099511627776).toFixed(decimal) + ' TB'
        } else if (bytes < 1152921504606846976) {
            return (bytes / 1125899906842624).toFixed(decimal) + ' PB'
        } else if (bytes < 1180591620717411303424) {
            return (bytes / 1152921504606846976).toFixed(decimal) + ' EB'
        } else if (bytes < 1208925819614629174706176) {
            return (bytes / 1180591620717411303424).toFixed(decimal) + ' ZB'
        } else if (!bytes) {
            return '-'
        } else {
            return 'very big'
        }
    }

    public static bytes_analytics(bytes: number) {
        if (bytes < 1073741824) {
            const size = Math.ceil(bytes / 1048576 / 5) * 5
            if (size === 0) {
                return '< 1 MB'
            } else {
                return '~ ' + size + ' MB'
            }
        } else if (bytes < 1099511627776) {
            return '~ ' + bytes / 1073741824 + ' GB'
        } else if (bytes < 1125899906842624) {
            return '~ ' + bytes / 1099511627776 + ' TB'
        } else if (bytes < 1152921504606846976) {
            return '~ ' + bytes / 1125899906842624 + ' PB'
        } else if (bytes < 1180591620717411303424) {
            return '~ ' + bytes / 1152921504606846976 + ' EB'
        } else if (bytes < 1208925819614629174706176) {
            return '~ ' + bytes / 1180591620717411303424 + ' ZB'
        } else if (!bytes) {
            return 'unknown'
        } else {
            return 'very big'
        }
    }

    public static browse_files(
        accept: string = '*',
        type: 'folder' | 'file' = 'file',
        multiple: boolean = true,
    ): Promise<File[]> {
        return new Promise((resolve) => {
            const input = document.createElement('input') as HTMLInputElement
            input.type = 'file'
            input.accept = accept
            input.multiple = multiple
            if (type === 'folder') {
                //@ts-ignore
                input.webkitdirectory = true
                //@ts-ignore
                input.mozdirectory = true
                //@ts-ignore
                input.msdirectory = true
                //@ts-ignore
                input.odirectory = true
                //@ts-ignore
                input.directory = true
            }
            input.style.position = 'fixed'
            input.style.top = '-9999999px'
            input.style.width = '0px'
            input.style.height = '0px'

            document.body.appendChild(input)

            input.addEventListener('change', () => {
                if (!input.files) {
                    return resolve([])
                }
                console.log('DIALOG OPEN -----', input.files)
                const files: File[] = []
                for (let i = 0; i < input.files.length; i++) {
                    const file = input.files?.item(i)
                    if (file !== null) {
                        console.log('ADD FILE', file)
                        files.push(file)
                    }
                }
                document.body.removeChild(input)
                return resolve(files)
            })
            input.click()
        })
    }

    protected static DATA_URL_PATTERN =
        /^data:([^/]+\/[^,;]+(?:[^,]*?))(;base64)?,([\s\S]*)$/
    public static dataURItoBlob(
        dataURI: string,
        opts: any,
        toFile: boolean = false,
    ) {
        // get the base64 data
        const dataURIData = this.DATA_URL_PATTERN.exec(dataURI)
        if (!dataURIData) {
            return null
        }

        // user may provide mime type, if not get it from data URI
        const mimeType = opts.mimeType ?? dataURIData?.[1] ?? 'plain/text'

        let data
        if (dataURIData[2] != null) {
            const binary = atob(decodeURIComponent(dataURIData[3]))
            const bytes = new Uint8Array(binary.length)
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i)
            }
            data = [bytes]
        } else {
            data = [decodeURIComponent(dataURIData[3])]
        }

        // Convert to a File?
        if (toFile) {
            return new File(data, opts.name || '', { type: mimeType })
        }

        return new Blob(data, { type: mimeType })
    }

    public static isImagePreviewSupported(mime_type: string) {
        if (!mime_type) return false
        // list of images that browsers can preview
        return /^[^/]+\/(jpe?g|gif|png|svg|svg\+xml|bmp|webp|avif)$/.test(
            mime_type,
        )
    }

    public static isVideoPreviewSupported(mime_type: string) {
        if (!mime_type) return false
        // list of images that browsers can preview
        return mime_type.includes('video')
    }

    public static isObjectURL(url: string) {
        return url.startsWith('blob:')
    }

    public static get_eta(file_progress: any) {
        if (!file_progress.bytes_uploaded) return 0

        const time_elapsed = Date.now() - file_progress.upload_started
        const upload_speed =
            file_progress.bytes_uploaded / (time_elapsed / 1000)
        const bytes_remaining =
            file_progress.bytes_total - file_progress.bytes_uploaded
        let seconds_remaining =
            Math.round((bytes_remaining / upload_speed) * 10) / 10
        if (seconds_remaining < 0) {
            seconds_remaining = 0
        }
        return seconds_remaining
    }

    public static get_eta_pretty(file_progress: any) {
        const eta_seconds = this.get_eta(file_progress)
        const hours = Math.floor(eta_seconds / 3600) % 24
        const minutes = Math.floor(eta_seconds / 60) % 60
        const seconds = Math.floor(eta_seconds % 60)

        const hoursStr = hours === 0 ? '' : `${hours}h`
        const minutesStr =
            minutes === 0
                ? ''
                : `${
                      hours === 0
                          ? minutes
                          : ` ${minutes.toString(10).padStart(2, '0')}`
                  }m`
        const secondsStr =
            hours !== 0
                ? ''
                : `${
                      minutes === 0
                          ? seconds
                          : ` ${seconds.toString(10).padStart(2, '0')}`
                  }s`

        return `${hoursStr}${minutesStr}${secondsStr}`
    }
}
