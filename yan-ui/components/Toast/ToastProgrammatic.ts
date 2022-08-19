import Toast from './Toast.vue'
import { createApp, h } from 'vue'
import mitt from 'mitt'

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $event: any
        $i: any
    }
}

export default (options: any = {}) => {
    return {
        show(text: string, opt: any = {}) {
            const defaultOptions = {
                active: true,
            }

            const slots: any = {
                default: () => text,
            }

            let instance: any = null
            if (opt.instance) {
                instance = opt.instance
                delete opt.instance
            }

            const close = opt.close
            delete opt.close

            const props = Object.assign(defaultOptions, opt)
            const div = document.createElement('div')
            div.classList.add('toast-programmatic')

            document.body.appendChild(div)

            const emitter = mitt()

            const modal_app = createApp({
                setup() {
                    return () => h(Toast, props, slots)
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
            const vm: any = modal_app.mount(div)
        },
    }
}
