import { defineNuxtPlugin } from '#app'
import {VuePlugin, yanUI} from './../yan-ui/yanUI'
import "../importFontAwesome";

import {
    FontAwesomeLayers,
    FontAwesomeLayersText,
    FontAwesomeIcon,
} from '@fortawesome/vue-fontawesome'

declare module '#app' {
    interface ComponentCustomProperties {
        $yanui: yanUI
    }
}

export default defineNuxtPlugin(nuxtApp => {
    nuxtApp.vueApp.component('fa-text', FontAwesomeLayersText)
    nuxtApp.vueApp.component('fa-icon', FontAwesomeIcon)
    nuxtApp.vueApp.use(VuePlugin, {
        icon_component: {
            name: 'fa-icon',
            pack: 'fal',
            component: FontAwesomeIcon,
        },
    })
    nuxtApp.provide('yanui', nuxtApp.vueApp.config.globalProperties.$yanui)

})