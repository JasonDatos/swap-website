import { defineNuxtConfig } from 'nuxt3'

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
    css: [
        '@/assets/scss/main.scss',
    ],
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@import "@/assets/scss/variables.scss";`,
                },
            },
        },
    },
    vue: {
        compilerOptions: {
           // isCustomElement: tag => ['fa'].includes(tag)
        }
    }
})
