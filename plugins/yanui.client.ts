import { defineNuxtPlugin } from '#app'
import {VuePlugin, yanUI} from './../yan-ui/yanUI'
import FontAwesomeIcon from "../importFontAwesome";
import {
    FontAwesomeLayers,
    FontAwesomeLayersText,
} from '@fortawesome/vue-fontawesome'

declare module '#app' {
    interface ComponentCustomProperties {
        $yanui: yanUI
    }
}

export default defineNuxtPlugin(nuxtApp => {
    nuxtApp.vueApp.component('fa-text', FontAwesomeLayersText)
    nuxtApp.vueApp.component('fa', FontAwesomeIcon)
    nuxtApp.vueApp.use(VuePlugin, {
        icon_component: {
            name: 'fa',
            pack: 'fal',
            component: FontAwesomeIcon,
        },
    })
    nuxtApp.provide('yanui', nuxtApp.vueApp.config.globalProperties.$yanui)

})