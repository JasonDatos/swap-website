import { VNode } from 'vue'
import Utils from './Utils'

interface LongPressHTMLElement extends HTMLElement {
    $_long_press_pointerdown_handler: () => void
    dataset: {
        longPressTimeoutId: string
    }
}

const longPressStop = new CustomEvent('long-press-stop')
const longPressStart = new CustomEvent('long-press-start')

const isTouch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0

const mouseDown = isTouch ? 'touchstart' : 'mousedown'
const mouseUp = isTouch ? 'touchend' : 'mouseup'
const mouseMove = isTouch ? 'touchmove' : 'mousemove'

export const directiveOption = {
    beforeMount(el: LongPressHTMLElement, binding: any, vnode: VNode) {
        el.dataset.longPressTimeoutId = '0'

        const onpointerup = (event: MouseEvent | PointerEvent | TouchEvent) => {
            clearTimeout(parseInt(el.dataset.longPressTimeoutId))

            if (vnode?.props?.onLongclickabort) {
                vnode.props.onLongclickabort()
            } else {
                el.dispatchEvent(longPressStop)
            }

            document.removeEventListener(mouseUp, onpointerup)
        }

        const onpointerdown = (
            event: MouseEvent | PointerEvent | TouchEvent,
        ) => {
            document.addEventListener(mouseUp, onpointerup)
            window.addEventListener('touchmove', onscroll)
            window.addEventListener('wheel', onscroll)
            const delay = binding.value || 300
            const timeout = setTimeout(() => {
                if (vnode?.props?.onLongclick) {
                    vnode.props.onLongclick(Utils.get_position(event))
                } else {
                    el.dispatchEvent(longPressStart)
                }
            }, delay)

            el.dataset.longPressTimeoutId = timeout.toString()
        }

        const onscroll = () => {
            clearTimeout(parseInt(el.dataset.longPressTimeoutId))
            document.removeEventListener('pointerup', onpointerup)
            window.removeEventListener('touchmove', onscroll)
            window.removeEventListener('wheel', onscroll)
        }

        el.addEventListener(mouseDown, onpointerdown)
    },
    unmounted(el: LongPressHTMLElement) {
        clearTimeout(parseInt(el.dataset.longPressTimeoutId))
        el.removeEventListener(mouseDown, el.$_long_press_pointerdown_handler)
    },
}

export default directiveOption
