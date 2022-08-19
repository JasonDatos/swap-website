import Modal from './Modal.vue'
import { createApp, h } from 'vue'
import mitt from 'mitt'
import LongPress from '../../utils/LongPress.directive'

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $event: any
        $i: any
    }
}

export default (options: any = {}) => {
    return {
        open(params: any = {}) {
            if (typeof params === 'string') {
                params = {
                    content: params,
                }
            }
            const defaultParam = {
                programmatic: true,
                active: true,
            }

            const slots: any = {
                default: () => params.content,
            }

            let instance: any = null
            if (params.instance) {
                instance = params.instance
                delete params.instance
            }

            if (params.title) {
                slots.title = () => params.title
            }
            if (typeof params.footer === 'string') {
                slots.footer = () => params.footer
            } else if (params.footer && params.footer.buttons) {
                params.footer_buttons = params.footer.buttons
            }
            const close = params.close
            const warn_close = params.warn_close
            delete params.close
            delete params.warn_close

            const props = Object.assign(defaultParam, params)
            const div = document.createElement('div')
            div.classList.add('modal-programmatic')

            document.body.appendChild(div)

            const emitter = mitt()

            const modal_app = createApp({
                setup() {
                    return () => h(Modal, props, slots)
                },
                created() {
                    this.$event.on('open', () => {
                        //console.log('!!!')
                    })
                    this.$event.on('close', () => {
                        if (close) {
                            close()
                        }
                        this.$.appContext.app.unmount()
                        div.remove()
                    })
                    this.$event.on(
                        'warn-close',
                        (close_callback: CallableFunction) => {
                            console.log('ok')
                            if (warn_close) {
                                return warn_close(close_callback)
                            }
                            return close_callback(true)
                        },
                    )
                },
                beforeUnmount() {
                    this.$event.all.clear()
                },
            })

            modal_app.config.globalProperties.$i = instance
            modal_app.config.globalProperties.$event = emitter
            modal_app.component(
                options.icon_component.name,
                options.icon_component.component,
            )
            modal_app.directive('longclick', LongPress)
            const vm: any = modal_app.mount(div)
        },
    }
}
