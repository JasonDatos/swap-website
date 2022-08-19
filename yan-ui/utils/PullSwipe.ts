import mitt from 'mitt'

export default class PullSwipe {
    private pStart = { x: 0, y: 0 }
    private pStop = { x: 0, y: 0 }
    private element: HTMLElement
    public event: any = mitt()
    private swipeThreshold: number = 100
    private pull_activate: boolean = false

    constructor(el: HTMLElement, swipeThreshold: number = 100) {
        this.element = el
        this.element.addEventListener(
            'touchstart',
            (e) => {
                this.swipeStart(e)
            },
            { passive: false },
        )
        this.element.addEventListener(
            'touchmove',
            (e) => {
                this.swipeEnd(e, false)
                this.swipeCheck(e, false)
            },
            { passive: false },
        )
        this.element.addEventListener(
            'touchend',
            (e) => {
                this.swipeEnd(e)
            },
            { passive: false },
        )
        this.swipeThreshold = swipeThreshold
    }

    public destroy() {
        this.element.removeEventListener(
            'touchstart',
            (e) => {
                this.swipeStart(e)
            },
            false,
        )
        this.element.removeEventListener(
            'touchmove',
            (e) => {
                this.swipeEnd(e, false)
                this.swipeCheck(e, false)
            },
            false,
        )
        this.element.removeEventListener(
            'touchend',
            (e) => {
                this.swipeEnd(e)
            },
            false,
        )
        this.event.all.clear()
    }

    private swipeStartReset() {
        this.pStart.x = this.pStop.x
        this.pStart.y = this.pStop.y
    }

    private swipeStart(e: TouchEvent | any) {
        if (this.pull_activate) {
            if (typeof e['targetTouches'] !== 'undefined') {
                const touch = e.targetTouches[0]
                this.pStart.x = touch.screenX
                this.pStart.y = touch.screenY
            } else {
                this.pStart.x = e.screenX
                this.pStart.y = e.screenY
            }
            this.event.emit('pull-start')
        }
    }

    private swipeEnd(e: TouchEvent | any, end: boolean = true) {
        if (this.pull_activate) {
            if (typeof e['changedTouches'] !== 'undefined') {
                const touch = e.changedTouches[0]
                this.pStop.x = touch.screenX
                this.pStop.y = touch.screenY
            } else {
                this.pStop.x = e.screenX
                this.pStop.y = e.screenY
            }

            if (end) {
                this.swipeCheck()
            }
            e.preventDefault()
        }
    }

    private swipeCheck(e: TouchEvent | any = null, check: boolean = true) {
        const changeY = this.pStart.y - this.pStop.y
        const changeX = this.pStart.x - this.pStop.x
        if (check) {
            if (this.isPullDown(changeY, changeX)) {
                this.event.emit('pull-down')
            } else {
                this.event.emit('pull-revert', this.pStop)
            }
        } else {
            this.event.emit('pull-update', { deltaY: changeY, deltaX: changeX })
        }
    }

    private isPullDown(dY: number, dX: number) {
        // methods of checking slope, length, direction of line created by swipe action
        return (
            dY < 0 &&
            ((Math.abs(dX) <= 100 && Math.abs(dY) >= this.swipeThreshold) ||
                (Math.abs(dX) / Math.abs(dY) <= 0.3 && dY >= 60))
        )
    }
}
