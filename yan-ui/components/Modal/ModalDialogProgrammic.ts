import ModalProgrammatic from './ModalProgrammatic'
import DialogContent from './DialogContent.vue'

export default (options: any = {}) => {
    return {
        alert(alert_options: any = {}) {
            const default_alert_options = {
                title: '',
                type: 'is-success',
                message: '',
                buttons: [
                    {
                        text: 'OK',
                        type: alert_options.type || 'is-success',
                        action: (modal: any) => {
                            modal.close()
                        },
                    },
                ],
                components: null,
                maxWidth: '400px',
                width: '100%',
                canCancel: true,
                canCancelBackground: true,
                ...alert_options,
            }
            return ModalProgrammatic(options).open({
                component: DialogContent,
                hasCard: false,
                canCancel: default_alert_options.canCancel,
                canCancelBackground: default_alert_options.canCancelBackground,
                props: {
                    spacing: true,
                    title: default_alert_options.title,
                    content: default_alert_options.message,
                    type: default_alert_options.type,
                    buttons: default_alert_options.buttons,
                    components: default_alert_options.components,
                    icon: default_alert_options.icon,
                    maxWidth: default_alert_options.maxWidth,
                    width: default_alert_options.width,
                    overflow: default_alert_options.overflow,
                },
            })
        },
    }
}
