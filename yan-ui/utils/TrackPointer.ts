const isTouch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0

const mouseDown = ['touchstart', 'mousedown']
const mouseUp = ['touchend', 'mouseup']
const mouseMove = ['touchmove', 'mousemove']

import mitt, { Emitter } from 'mitt'
import Utils from './Utils'

export default class TrackPointer {
    public events: Emitter<any>

    constructor() {
        this.events = mitt()
        mouseMove.forEach((move_event) => {
            document.addEventListener(
                move_event,
                (event: any) => this.on_pointer_move(event),
                { passive: true },
            )
        })
        mouseUp.forEach((up_event) => {
            document.addEventListener(up_event, () => this.on_pointer_up(), {
                passive: true,
            })
        })
        mouseDown.forEach((down_event) => {
            document.addEventListener(
                down_event,
                () => this.on_pointer_down(),
                { passive: true },
            )
        })
    }

    public on_pointer_move(event: MouseEvent | TouchEvent) {
        this.events.emit('position', Utils.get_position(event))
    }

    public on_pointer_up() {
        this.events.emit('up')
    }
    public on_pointer_down() {
        this.events.emit('down')
    }
    public destroy() {
        mouseMove.forEach((move_event) => {
            document.removeEventListener(move_event, (event: any) =>
                this.on_pointer_move(event),
            )
        })
        mouseUp.forEach((up_event) => {
            document.removeEventListener(up_event, () => this.on_pointer_up())
        })
        mouseDown.forEach((down_event) => {
            document.removeEventListener(down_event, () =>
                this.on_pointer_down(),
            )
        })
        this.events.all.clear()
    }
}
