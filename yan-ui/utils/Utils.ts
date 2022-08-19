import { Router } from 'vue-router'

export default class Utils {
    public static findNextIndex(
        arr: any[],
        index: number,
        condition: any = () => true,
    ): any {
        const oldIndex = index
        let nextIndex = index + 1
        if (nextIndex >= arr.length) {
            nextIndex = arr.length - 1
        }
        while (nextIndex < arr.length + 1 && !condition(arr[nextIndex])) {
            nextIndex++
        }
        if (nextIndex >= arr.length) {
            nextIndex = oldIndex
        }
        return nextIndex
    }

    public static findPreviousIndex(
        arr: any[],
        index: number,
        condition: any = () => true,
    ): any {
        const oldIndex = index
        let previousIndex = index - 1
        if (previousIndex < 0) {
            previousIndex = 0
        }
        while (previousIndex > -1 && !condition(arr[previousIndex])) {
            previousIndex--
        }
        if (previousIndex <= -1) {
            previousIndex = oldIndex
        }
        return previousIndex
    }

    public static to<T, U = Error>(
        promise: Promise<T>,
        errorExt?: any,
    ): Promise<[U, undefined] | [null, T]> {
        return promise
            .then<[null, T]>((data: T) => [null, data])
            .catch<[U, undefined]>((err: U) => {
                if (errorExt) {
                    Object.assign(err, errorExt)
                }
                return [err, undefined]
            })
    }

    public static filter_file_from_clipboard(event: any) {
        let items = []
        try {
            items = (event.clipboardData || event.originalEvent.clipboardData)
                .items
        } catch (e) {
            items = (event.dataTransfer || event.originalEvent.dataTransfer)
                .items
        }
        const files = []
        for (const index in items) {
            const item = items[index]
            if (item.kind === 'file') {
                files.push(item.getAsFile())
            }
        }
        return files
    }

    public static capitalize_first_letter_sentence(value: string) {
        const splitten = value.split('\n')
        for (let i = 0; i < splitten.length; i++) {
            if (!splitten[i][0]) continue
            splitten[i] =
                splitten[i][0].toUpperCase() +
                splitten[i].substring(1, splitten[i].length)
        }
        return splitten.join('\n')
    }
    public static string_to_html_entities(str: string) {
        return str.replace(/./gm, function (s: string) {
            // return "&#" + s.charCodeAt(0) + ";";
            return s.match(/[a-z0-9\s]+/i) ? s : '&#' + s.charCodeAt(0) + ';'
        })
    }

    public static get_position(event: MouseEvent | TouchEvent) {
        const position = {
            x: -1,
            y: -1,
        }
        if (event instanceof MouseEvent) {
            position.x = event.clientX
            position.y = event.clientY
        } else if (event instanceof TouchEvent) {
            position.x = event.touches[0].pageX || event.changedTouches[0].pageX
            position.y = event.touches[0].pageY || event.changedTouches[0].pageY
        }
        return position
    }

    public static diff(obj1: any, obj2: any) {
        const result: any = {}
        if (Object.is(obj1, obj2)) {
            return undefined
        }
        if (!obj2 || typeof obj2 !== 'object') {
            return obj2
        }
        Object.keys(obj1 || {})
            .concat(Object.keys(obj2 || {}))
            .forEach((key) => {
                if (
                    obj2[key] !== obj1[key] &&
                    !Object.is(obj1[key], obj2[key])
                ) {
                    result[key] = obj2[key]
                }
                if (
                    typeof obj2[key] === 'object' &&
                    typeof obj1[key] === 'object'
                ) {
                    const value = this.diff(obj1[key], obj2[key])
                    if (value !== undefined) {
                        result[key] = value
                    }
                }
            })
        return result
    }

    public static get_router($router: Router, to: string) {
        const routes = $router.getRoutes()
        for (let i = 0; i < routes.length; i++) {
            if (routes[i].path === to) {
                return routes[i]
            }
        }
    }

    public static get_back_router_path($router: Router): any {
        return $router.options.history.state.back
    }
    public static get_back_router($router: Router) {
        const back_router_path = this.get_back_router_path($router) as
            | string
            | undefined
            | null
        if (back_router_path) {
            return this.get_router($router, back_router_path)
        }
        return null
    }

    public static get_back_router_name($router: Router) {
        return this.get_back_router_path($router)
            ? 'Back to ' + this.get_back_router($router)?.meta.title
            : 'Back'
    }
}
