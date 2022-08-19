const theme = localStorage.getItem('theme') || 'light'
if (theme === 'dark') {
    document.documentElement.classList.add('theme-dark');
} else {
    document.documentElement.classList.add('theme-light');
}

import { Plugin, reactive, ref } from 'vue'

import ModalProgrammatic from './components/Modal/ModalProgrammatic'
import ModalDialogProgrammic from './components/Modal/ModalDialogProgrammic'

import BackButton from './utils/BackButton'
import mitt from 'mitt'
import FileUtils from './utils/FileUtils'
import MathUtils from './utils/MathUtils'
import Utils from './utils/Utils'
import LongPress from './utils/LongPress.directive'
import ToastProgrammatic from './components/Toast/ToastProgrammatic'

export interface yanUI {
    modal: any
    dialog: any
    back: BackButton
    theme: any
    toast: any
    file_utils: any
    math_utils: any
    utils: any
    event: any
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $yanui: yanUI
    }
}

//@TODO revert this when settings calls for "AUTO" theme.
let preferredColorSchemeMatch = localStorage.getItem('theme')

if (!preferredColorSchemeMatch) {
    preferredColorSchemeMatch = 'light' /*
    preferredColorSchemeMatch = window.matchMedia(
        '(prefers-color-scheme: dark)',
    ).matches
        ? 'dark'
        : 'light'
        */
}

const VuePlugin = {
    install(app: any, options?: any) {
        const emitter = mitt()
        app.config.globalProperties.$yanui = {
            back: reactive(new BackButton()),
            theme: ref(preferredColorSchemeMatch),
            modal: ModalProgrammatic(options),
            toast: ToastProgrammatic(options),
            dialog: ModalDialogProgrammic(options),
            file_utils: FileUtils,
            math_utils: MathUtils,
            utils: Utils,
            event: emitter,
        }
        app.directive('longclick', LongPress)
        app.provide('$event', emitter)
        console.log("!!!!!!!!!", app.config.globalProperties)
    },
}

export {
    VuePlugin
}
