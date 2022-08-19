import { defineNuxtConfig } from 'nuxt3'

const routerBase = process.env.DEPLOY_ENV === 'GEN'
    ?
    '/swap/'
    :
    '/';

// https://v3.nuxtjs.org/docs/directory-structure/nuxt.config
export default defineNuxtConfig({
    target: "static",
    ssr: false,
    router: {
        base: routerBase
    },
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
           //isCustomElement: tag => ['fa'].includes(tag)
        },
    },
    build: {
        transpile: [
            '@fortawesome/fontawesome-svg-core',
            '@fortawesome/pro-solid-svg-icons',
            '@fortawesome/pro-regular-svg-icons',
            '@fortawesome/pro-light-svg-icons',
            '@fortawesome/free-brands-svg-icons'
        ]
    }
})
