<template>
    <div class="video-load" v-if="!player_visible">
        <fa-icon :icon="['fal', 'spinner-third']" spin></fa-icon>
    </div>
    <video
        ref="video"
        class="yan-video yan-video-visible"
        playsinline
        controls
        crossorigin="use-credentials"
        preload="none"
        @keypress="keypress"
    ></video>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'
import Button from '@/yan-ui/components/Button.vue'
import videojs, { VideoJsPlayerOptions } from 'video.js'

class Props {
    options = prop({
        type: Object,
        required: false,
        default: {},
    })

    parent = prop({
        type: HTMLElement,
        required: false,
        default: null,
    })
}

@Options({
    components: {
        Button,
    },
})
export default class VideoPlayer extends Vue.with(Props) {
    private player: videojs.Player | null = null
    private video_size: any = {
        width: 400,
        height: 400,
    }
    private player_visible: boolean = true
    private time: number = 0

    created() {
        this.time = Date.now()
        for (let i = 0; i < this.options.sources.length; i++) {
            if (!this.options.sources[i].src.startsWith('blob:')) {
                let query_time = 't=' + this.time
                if (this.options.sources[i].src.includes('?')) {
                    query_time = '&' + query_time
                } else {
                    query_time = '?' + query_time
                }
                this.options.sources[i].src =
                    this.options.sources[i].src + query_time
            }
        }
    }

    mounted() {
        this.player = videojs(
            this.$refs.video as HTMLVideoElement,
            this.options as VideoJsPlayerOptions,
            () => {
                this.resize_video_player()
            },
        )
        this.resize_video_player()

        this.player?.on('canplaythrough', () => {
            //console.log('VIDEO.JS', 'canplaythrough')
        })
        this.player?.on('loadstart', () => {
            //console.log('VIDEO.JS', 'loadstart')
            this.resize_video_player()
        })
        this.player?.on('loadedmetadata', () => {
            //console.log('VIDEO.JS', 'loadedmetedata')
            this.resize_video_player()
        })
        this.player?.on('canplay', () => {
            //console.log('VIDEO.JS', 'canplay')
            this.player_visible = true
            this.player?.addClass('yan-video-visible')
        })
        this.player?.on('error', (event) => {
            console.error('VIDEO.JS', 'error', event)
        })
        window.addEventListener('resize', this.resize_video_player)
    }

    private resize_video_player() {
        //console.log('resize_video_player', this.parent, this.player)
        if (!this.parent) {
            return
        }
        let video_width = 0
        let video_height = 0
        if (this.player) {
            video_width = this.player?.videoWidth()
            video_height = this.player?.videoHeight()
        }

        if (video_width === 0 || video_height === 0) {
            video_width = this.options.width
            video_height = this.options.height
        }
        if (video_width === 0 || video_height === 0) {
            video_width = 400
            video_height = 400
        }

        let scale = 1
        const parent_rect = this.parent?.getBoundingClientRect()
        const parent_width = parent_rect.width
        const parent_height = parent_rect.height
        const scale_w = parent_width / video_width
        const scale_h = parent_height / video_height

        if (scale_w > scale_h) {
            scale = scale_h
        } else scale = scale_w

        const new_width = Math.round(video_width * scale)
        const new_height = Math.round(video_height * scale)
        if (this.player) {
            this.player.width(new_width)
            this.player.height(new_height)
            //@ts-ignore
            this.$refs.video.style.width = ''
            //@ts-ignore
            this.$refs.video.style.height = ''
        } else {
            //@ts-ignore
            this.$refs.video.style.width = new_width + 'px'
            //@ts-ignore
            this.$refs.video.style.height = new_height + 'px'
        }

        //console.log('NEW SIZE', new_width, new_height)
    }

    private play_or_pause() {
        if (this.player) {
            if (this.player.paused()) this.player.play()
            else this.player.pause()
        }
    }

    unmounted() {
        if (this.player) {
            this.player.dispose()
        }
        window.removeEventListener('resize', this.resize_video_player)
    }

    private keypress(e: any) {
        //console.log('KEYPRESS', e.which)
        if (e.which == 32) {
            this.play_or_pause()
        }
    }
}
</script>

<style lang="scss">
.video-load {
    color: var(--color-primary-black);
    font-size: 4em;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
.yan-video .vjs-big-play-button:before,
.yan-video .vjs-control:before,
.yan-video .vjs-modal-dialog,
.vjs-modal-dialog .vjs-modal-dialog-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.yan-video .vjs-big-play-button:before,
.yan-video .vjs-control:before {
    text-align: center;
}

.vjs-icon-play,
.yan-video .vjs-big-play-button,
.yan-video .vjs-play-control {
    font-weight: normal;
    font-style: normal;
}

.yan-video .vjs-big-play-button:before {
    content: '';
    position: absolute;
    transform: translate(4%, 0);
    background-image: url('~@/yan-ui/images/play-icon.svg');
    background-repeat: no-repeat;
    background-size: 1em 1em;
    background-position: center center;
}

.vjs-icon-play:before,
.yan-video .vjs-play-control:before {
    font-family: FontAwesome;
    content: '\f04b';
}

.vjs-icon-play-circle {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-play-circle:before {
    content: '\f102';
}

.vjs-icon-pause,
.yan-video .vjs-play-control.vjs-playing {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-pause:before,
.yan-video .vjs-play-control.vjs-playing:before {
    content: '\f04c';
}

.vjs-icon-volume-mute,
.yan-video .vjs-mute-control.vjs-vol-0,
.yan-video .vjs-volume-menu-button.vjs-vol-0 {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-volume-mute:before,
.yan-video .vjs-mute-control.vjs-vol-0:before,
.yan-video .vjs-volume-menu-button.vjs-vol-0:before {
    font-family: FontAwesome;
    content: '\f6a9';
}

.vjs-icon-volume-low,
.yan-video .vjs-mute-control.vjs-vol-1,
.yan-video .vjs-volume-menu-button.vjs-vol-1 {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-volume-low:before,
.yan-video .vjs-mute-control.vjs-vol-1:before,
.yan-video .vjs-volume-menu-button.vjs-vol-1:before {
    content: '\f027';
}

.vjs-icon-volume-mid,
.yan-video .vjs-mute-control.vjs-vol-2,
.yan-video .vjs-volume-menu-button.vjs-vol-2 {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-volume-mid:before,
.yan-video .vjs-mute-control.vjs-vol-2:before,
.yan-video .vjs-volume-menu-button.vjs-vol-2:before {
    content: '\f6a8';
}

.vjs-icon-volume-high,
.yan-video .vjs-mute-control,
.yan-video .vjs-volume-menu-button {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-volume-high:before,
.yan-video .vjs-mute-control:before,
.yan-video .vjs-volume-menu-button:before {
    font-family: FontAwesome;
    content: '\f028';
}

.vjs-icon-fullscreen-enter,
.yan-video .vjs-fullscreen-control {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-fullscreen-enter:before,
.yan-video .vjs-fullscreen-control:before {
    font-family: FontAwesome;
    content: '\f065';
}

.vjs-icon-fullscreen-exit,
.yan-video.vjs-fullscreen .vjs-fullscreen-control {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-fullscreen-exit:before,
.yan-video.vjs-fullscreen .vjs-fullscreen-control:before {
    content: '\f066';
}

.vjs-icon-square {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-square:before {
    content: '\f10a';
}

.vjs-icon-spinner {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-spinner:before {
    content: '\f10b';
}

.vjs-icon-subtitles,
.yan-video .vjs-subtitles-button {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-subtitles:before,
.yan-video .vjs-subtitles-button:before {
    content: '\f10c';
}

.vjs-icon-captions,
.yan-video .vjs-captions-button {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-captions:before,
.yan-video .vjs-captions-button:before {
    content: '\f10d';
}

.vjs-icon-chapters,
.yan-video .vjs-chapters-button {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-chapters:before,
.yan-video .vjs-chapters-button:before {
    content: '\f10e';
}

.vjs-icon-share {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-share:before {
    content: '\f10f';
}

.vjs-icon-cog {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-cog:before {
    content: '\f110';
}

.vjs-icon-circle,
.yan-video .vjs-mouse-display,
.yan-video .vjs-play-progress,
.yan-video .vjs-volume-level {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-circle:before,
.yan-video .vjs-mouse-display:before,
.yan-video .vjs-play-progress:before,
.yan-video .vjs-volume-level:before {
    content: '';
    background: var(--color-primary-black);
    width: 1em;
    height: 1em;
    border-radius: 50%;
    box-shadow: var(--box-shadow);
}

.vjs-icon-circle-outline {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-circle-outline:before {
    content: '\f112';
}

.vjs-icon-circle-inner-circle {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-circle-inner-circle:before {
    content: '\f113';
}

.vjs-icon-hd {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-hd:before {
    content: '\f114';
}

.vjs-icon-cancel,
.yan-video .vjs-control.vjs-close-button {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-cancel:before,
.yan-video .vjs-control.vjs-close-button:before {
    content: '\f115';
}

.vjs-icon-replay {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-replay:before {
    content: '\f116';
}

.vjs-icon-facebook {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-facebook:before {
    content: '\f117';
}

.vjs-icon-gplus {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-gplus:before {
    content: '\f118';
}

.vjs-icon-linkedin {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-linkedin:before {
    content: '\f119';
}

.vjs-icon-twitter {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-twitter:before {
    content: '\f11a';
}

.vjs-icon-tumblr {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-tumblr:before {
    content: '\f11b';
}

.vjs-icon-pinterest {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-pinterest:before {
    content: '\f11c';
}

.vjs-icon-audio-description,
.yan-video .vjs-descriptions-button {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-audio-description:before,
.yan-video .vjs-descriptions-button:before {
    content: '\f11d';
}

.vjs-icon-audio,
.yan-video .vjs-audio-button {
    font-weight: normal;
    font-style: normal;
}
.vjs-icon-audio:before,
.yan-video .vjs-audio-button:before {
    content: '\f11e';
}

.yan-video {
    display: flex;
    box-sizing: border-box;
    color: #fff;
    background-color: #000;
    position: relative;
    padding: 0;
    font-size: 15px;
    line-height: 1;
    font-weight: normal;
    font-style: normal;
    max-width: 100%;
    max-height: 100%;
    border-radius: var(--border-radius);
    overflow: hidden;
    opacity: 0;
    transition: width 0.5s ease-in-out, height 0.5s ease-in-out, opacity 0.2s;

    &.yan-video-visible {
        opacity: 1;
    }
}

.yan-video .vjs-tech {
    object-fit: contain;
    width: 100%;
    max-width: 100%;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: var(--border-radius);
}

.yan-video .vjs-volume-panel {
    .vjs-volume-control {
        display: flex;
        position: absolute;
        top: -65%;
        transform: scaleY(0);
        transform-origin: 50% 100%;
        transition: transform 0.2s;
        pointer-events: none;
    }
    &.vjs-hover {
        .vjs-volume-control {
            pointer-events: all;
            transform: scaleY(1);
        }
    }
}

.yan-video:-moz-full-screen {
    position: absolute;
    border-radius: 0;
}
.yan-video:-webkit-full-screen {
    width: 100% !important;
    height: 100% !important;
    border-radius: 0;
}

.yan-video *,
.yan-video *:before,
.yan-video *:after {
    box-sizing: inherit;
}

.yan-video ul {
    font-size: inherit;
    line-height: inherit;
    list-style-position: outside;
    margin-left: 0;
    margin-right: 0;
    margin-top: 0;
    margin-bottom: 0;
}

.video-js.vjs-fluid,
.video-js.vjs-16-9,
.video-js.vjs-4-3,
.video-js.vjs-9-16,
.video-js.vjs-1-1 {
    width: 100%;
    max-width: 100%;
    height: 0;
}

.yan-video.vjs-16-9 {
    padding-top: 56.25%;
}

.yan-video.vjs-4-3 {
    padding-top: 75%;
}

.yan-video.vjs-fill {
    width: 100%;
    height: 100%;
}

body.vjs-full-window {
    padding: 0;
    margin: 0;
    height: 100%;
    overflow-y: auto;
}

.vjs-full-window .yan-video.vjs-fullscreen {
    position: fixed;
    overflow: hidden;
    z-index: 1000;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
}

.yan-video.vjs-fullscreen {
    width: 100% !important;
    height: 100% !important;
    padding-top: 0 !important;
}

.yan-video.vjs-fullscreen.vjs-user-inactive {
    cursor: none;
}

.vjs-hidden {
    display: none !important;
}

.vjs-disabled {
    opacity: 0.5;
    cursor: default;
}

.yan-video .vjs-offscreen {
    height: 1px;
    left: -9999px;
    position: absolute;
    top: 0;
    width: 1px;
}

.vjs-lock-showing {
    display: block !important;
    opacity: 1;
    visibility: visible;
}

.vjs-no-js {
    padding: 20px;
    color: #fff;
    background-color: #000;
    font-size: 18px;
    text-align: center;
    width: 300px;
    height: 150px;
    margin: 0px auto;
}

.vjs-no-js a,
.vjs-no-js a:visited {
    color: #66a8cc;
}

.yan-video .vjs-big-play-button {
    position: absolute;
    font-size: 3em;
    height: 2em;
    width: 2em;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 0;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--color-primary-light-gray);
    color: var(--color-secondary-lime);
    border-radius: 50%;
    transition: all 0.2s;
    box-shadow: var(--box-shadow);
    opacity: 1;
}

.yan-video .vjs-big-play-button:hover {
    transform: translate(-50%, -50%) scale(1.25);
}

.vjs-controls-disabled .vjs-big-play-button,
.vjs-playing .vjs-big-play-button,
.vjs-using-native-controls .vjs-big-play-button,
.vjs-error .vjs-big-play-button {
    opacity: 0;
    pointer-events: none;
    cursor: default;
}

.vjs-has-started.vjs-paused.vjs-show-big-play-button-on-pause
    .vjs-big-play-button {
    display: block;
}

.yan-video button {
    background: none;
    border: none;
    color: inherit;
    display: inline-block;
    overflow: visible;
    font-size: inherit;
    line-height: inherit;
    text-transform: none;
    text-decoration: none;
    transition: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}

.yan-video .vjs-control.vjs-close-button {
    cursor: pointer;
    height: 3em;
    position: absolute;
    right: 0;
    top: 0.5em;
    z-index: 2;
}

.vjs-menu-button {
    cursor: pointer;
}

.vjs-menu-button.vjs-disabled {
    cursor: default;
}

.vjs-workinghover .vjs-menu-button.vjs-disabled:hover .vjs-menu {
    display: none;
}

.vjs-menu .vjs-menu-content {
    display: block;
    padding: 0;
    margin: 0;
    overflow: auto;
}

.vjs-scrubbing .vjs-menu-button:hover .vjs-menu {
    display: none;
}

.vjs-menu li {
    list-style: none;
    margin: 0;
    padding: 0.2em 0;
    line-height: 1.4em;
    font-size: 1.2em;
    text-align: center;
    text-transform: lowercase;
}

.vjs-menu li.vjs-menu-item:focus,
.vjs-menu li.vjs-menu-item:hover {
    outline: 0;
    background-color: #73859f;
    background-color: rgba(115, 133, 159, 0.5);
}

.vjs-menu li.vjs-selected,
.vjs-menu li.vjs-selected:focus,
.vjs-menu li.vjs-selected:hover {
    background-color: #fff;
    color: #2b333f;
}

.vjs-menu li.vjs-menu-title {
    text-align: center;
    text-transform: uppercase;
    font-size: 1em;
    line-height: 2em;
    padding: 0;
    margin: 0 0 0.3em 0;
    font-weight: bold;
    cursor: default;
}

.vjs-menu-button-popup .vjs-menu {
    display: none;
    position: absolute;
    bottom: 0;
    width: 10em;
    left: -3em;
    height: 0em;
    margin-bottom: 1.5em;
    border-top-color: rgba(43, 51, 63, 0.7);
}

.vjs-menu-button-popup .vjs-menu .vjs-menu-content {
    background-color: #2b333f;
    background-color: rgba(43, 51, 63, 0.7);
    position: absolute;
    width: 100%;
    bottom: 1.5em;
    max-height: 15em;
}

.vjs-workinghover .vjs-menu-button-popup:hover .vjs-menu,
.vjs-menu-button-popup .vjs-menu.vjs-lock-showing {
    display: block;
}

.yan-video .vjs-menu-button-inline {
    -webkit-transition: all 0.4s;
    -moz-transition: all 0.4s;
    -o-transition: all 0.4s;
    transition: all 0.4s;
    overflow: hidden;
}

.yan-video .vjs-menu-button-inline:before {
    width: 2.222222222em;
}

.yan-video .vjs-menu-button-inline:hover,
.yan-video .vjs-menu-button-inline:focus,
.yan-video .vjs-menu-button-inline.vjs-slider-active,
.yan-video.vjs-no-flex .vjs-menu-button-inline {
    width: 12em;
}

.yan-video .vjs-menu-button-inline.vjs-slider-active {
    -webkit-transition: none;
    -moz-transition: none;
    -o-transition: none;
    transition: none;
}

.vjs-menu-button-inline .vjs-menu {
    opacity: 0;
    height: 100%;
    width: auto;
    position: absolute;
    left: 4em;
    top: 0;
    padding: 0;
    margin: 0;
    -webkit-transition: all 0.4s;
    -moz-transition: all 0.4s;
    -o-transition: all 0.4s;
    transition: all 0.4s;
}

.vjs-menu-button-inline:hover .vjs-menu,
.vjs-menu-button-inline:focus .vjs-menu,
.vjs-menu-button-inline.vjs-slider-active .vjs-menu {
    display: block;
    opacity: 1;
}

.vjs-no-flex .vjs-menu-button-inline .vjs-menu {
    display: block;
    opacity: 1;
    position: relative;
    width: auto;
}

.vjs-no-flex .vjs-menu-button-inline:hover .vjs-menu,
.vjs-no-flex .vjs-menu-button-inline:focus .vjs-menu,
.vjs-no-flex .vjs-menu-button-inline.vjs-slider-active .vjs-menu {
    width: auto;
}

.vjs-menu-button-inline .vjs-menu-content {
    width: auto;
    height: 100%;
    margin: 0;
    overflow: hidden;
}

.yan-video .vjs-control-bar {
    display: none;
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3em;
    font-size: 0.8em;
    color: var(--color-primary-black);
    background-color: var(--color-primary-light-gray);
    border-bottom-left-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
}

.vjs-has-started .vjs-control-bar {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    visibility: visible;
    opacity: 1;
    -webkit-transition: visibility 0.1s, opacity 0.1s;
    -moz-transition: visibility 0.1s, opacity 0.1s;
    -o-transition: visibility 0.1s, opacity 0.1s;
    transition: visibility 0.1s, opacity 0.1s;
}

.vjs-has-started.vjs-user-inactive.vjs-playing .vjs-control-bar {
    visibility: visible;
    opacity: 0;
    -webkit-transition: visibility 1s, opacity 1s;
    -moz-transition: visibility 1s, opacity 1s;
    -o-transition: visibility 1s, opacity 1s;
    transition: visibility 1s, opacity 1s;
}

.vjs-controls-disabled .vjs-control-bar,
.vjs-using-native-controls .vjs-control-bar,
.vjs-error .vjs-control-bar {
    display: none !important;
}

.vjs-audio.vjs-has-started.vjs-user-inactive.vjs-playing .vjs-control-bar {
    opacity: 1;
    visibility: visible;
}

.vjs-has-started.vjs-no-flex .vjs-control-bar {
    display: table;
}

.yan-video .vjs-control {
    outline: none;
    position: relative;
    text-align: center;
    margin: 0;
    padding: 0;
    height: 100%;
    width: 4em;
    -webkit-box-flex: none;
    -moz-box-flex: none;
    -webkit-flex: none;
    -ms-flex: none;
    flex: none;
}
.yan-video .vjs-control:before {
    font-size: 1.5em;
    line-height: 2;
}

.yan-video .vjs-control:hover:before {
    background: var(--gradient-success);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.yan-video .vjs-control-text {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
}

.vjs-no-flex .vjs-control {
    display: table-cell;
    vertical-align: middle;
}

.yan-video .vjs-custom-control-spacer {
    display: none;
}

.yan-video .vjs-progress-control {
    -webkit-box-flex: auto;
    -moz-box-flex: auto;
    -webkit-flex: auto;
    -ms-flex: auto;
    flex: auto;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    min-width: 4em;
}

.vjs-live .vjs-progress-control {
    display: none;
}

.yan-video .vjs-progress-holder {
    -webkit-box-flex: auto;
    -moz-box-flex: auto;
    -webkit-flex: auto;
    -ms-flex: auto;
    flex: auto;
    -webkit-transition: all 0.2s;
    -moz-transition: all 0.2s;
    -o-transition: all 0.2s;
    transition: all 0.2s;
    height: 0.3em;
}

.yan-video .vjs-progress-control:hover .vjs-progress-holder {
    font-size: 1.666666666666666666em;
}

/* If we let the font size grow as much as everything else, the current time tooltip ends up
 ginormous. If you'd like to enable the current time tooltip all the time, this should be disabled
 to avoid a weird hitch when you roll off the hover. */
.yan-video .vjs-progress-control:hover .vjs-time-tooltip,
.yan-video .vjs-progress-control:hover .vjs-mouse-display:after,
.yan-video .vjs-progress-control:hover .vjs-play-progress:after {
    visibility: visible;
    font-size: 0.6em;
}

.yan-video .vjs-progress-holder .vjs-load-progress {
    background: var(--gradient-success);
    opacity: 0.5;
}

.yan-video .vjs-progress-holder .vjs-play-progress,
.yan-video .vjs-progress-holder .vjs-load-progress,
.yan-video .vjs-progress-holder .vjs-tooltip-progress-bar,
.yan-video .vjs-progress-holder .vjs-load-progress div {
    position: absolute;
    display: block;
    height: 100%;
    margin: 0;
    padding: 0;
    width: 0;
    left: 0;
    top: 0;
}

.yan-video .vjs-mouse-display:before {
    display: none;
}

.yan-video .vjs-play-progress {
    background: var(--gradient-success);
}
.yan-video .vjs-play-progress:before {
    position: absolute;
    top: -0.333333333333333em;
    right: -0.5em;
    font-size: 0.9em;
}

.yan-video .vjs-time-tooltip,
.yan-video .vjs-mouse-display:after,
.yan-video .vjs-play-progress:after {
    visibility: hidden;
    pointer-events: none;
    position: absolute;
    top: -3.65em;
    right: -1.9em;
    font-size: 0.9em;
    color: var(--color-white);
    content: attr(data-current-time);
    padding: var(--padding-small);
    padding-top: var(--padding-tiny);
    background: var(--gradient-success);
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
}
.yan-video .vjs-play-progress:after {
    display: none;
}
.yan-video .vjs-time-tooltip,
.yan-video .vjs-play-progress:before,
.yan-video .vjs-play-progress:after {
    z-index: 1;
}

.yan-video .vjs-progress-control .vjs-keep-tooltips-inside:after {
    display: none;
}

.yan-video .vjs-load-progress {
    background: var(--color-primary-black);
}

.yan-video.vjs-no-flex .vjs-progress-control {
    width: auto;
}

.yan-video .vjs-time-tooltip {
    display: inline-block;
    height: 2.4em;
    position: relative;
    float: right;
    right: -1.9em;
}

.vjs-tooltip-progress-bar {
    visibility: hidden;
}

.yan-video .vjs-volume-control .vjs-mouse-display {
    display: none;
}

.yan-video .vjs-progress-control .vjs-mouse-display {
    display: none;
    position: absolute;
    width: 1px;
    height: 100%;
    background-color: var(--color-primary-white);
    z-index: 1;
}

.vjs-no-flex .vjs-progress-control .vjs-mouse-display {
    z-index: 0;
}

.yan-video .vjs-progress-control:hover .vjs-mouse-display {
    display: block;
}

.yan-video.vjs-user-inactive .vjs-progress-control .vjs-mouse-display,
.yan-video.vjs-user-inactive .vjs-progress-control .vjs-mouse-display:after {
    visibility: hidden;
    opacity: 0;
    -webkit-transition: visibility 1s, opacity 1s;
    -moz-transition: visibility 1s, opacity 1s;
    -o-transition: visibility 1s, opacity 1s;
    transition: visibility 1s, opacity 1s;
}

.yan-video.vjs-user-inactive.vjs-no-flex
    .vjs-progress-control
    .vjs-mouse-display,
.yan-video.vjs-user-inactive.vjs-no-flex
    .vjs-progress-control
    .vjs-mouse-display:after {
    display: none;
}

.vjs-mouse-display .vjs-time-tooltip,
.yan-video .vjs-progress-control .vjs-mouse-display:after {
    color: var(--color-primary-black);
    background: var(--color-primary-light-gray);
}

.yan-video .vjs-slider {
    outline: 0;
    position: relative;
    cursor: pointer;
    padding: 0;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-color: var(--color-primary-black);
}

.yan-video .vjs-mute-control,
.yan-video .vjs-volume-menu-button {
    cursor: pointer;
    -webkit-box-flex: none;
    -moz-box-flex: none;
    -webkit-flex: none;
    -ms-flex: none;
    flex: none;
}

.yan-video .vjs-volume-control {
    width: 10em;
    height: 50%;
    padding: var(--padding-small);
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    flex: none;
    display: flex;
    align-items: center;
    background: var(--color-primary-light-gray);
}

.yan-video .vjs-volume-bar {
    //margin: 1.35em 0.45em;
}

.vjs-volume-bar.vjs-slider-horizontal {
    width: 10em;
    height: 0.3em;
}

.vjs-volume-bar.vjs-slider-vertical {
    width: 0.3em;
    height: 5em;
    margin: 1.35em auto;
}

.yan-video .vjs-volume-level {
    position: absolute;
    bottom: 0;
    left: 0;
    background: var(--gradient-success);
}
.yan-video .vjs-volume-level:before {
    position: absolute;
    font-size: 0.9em;
}

.vjs-slider-vertical .vjs-volume-level {
    width: 0.3em;
}
.vjs-slider-vertical .vjs-volume-level:before {
    top: -0.5em;
    left: -0.3em;
}

.vjs-slider-horizontal .vjs-volume-level {
    height: 0.3em;
}
.vjs-slider-horizontal .vjs-volume-level:before {
    top: -0.3em;
    right: -0.5em;
}

.vjs-volume-bar.vjs-slider-vertical .vjs-volume-level {
    height: 100%;
}

.vjs-volume-bar.vjs-slider-horizontal .vjs-volume-level {
    width: 100%;
}

.vjs-menu-button-popup.vjs-volume-menu-button .vjs-menu {
    display: block;
    width: 0;
    height: 0;
    border-top-color: transparent;
}

.vjs-menu-button-popup.vjs-volume-menu-button-vertical .vjs-menu {
    left: 0.5em;
    height: 8em;
}

.vjs-menu-button-popup.vjs-volume-menu-button-horizontal .vjs-menu {
    left: -2em;
}

.vjs-menu-button-popup.vjs-volume-menu-button .vjs-menu-content {
    height: 0;
    width: 0;
    overflow-x: hidden;
    overflow-y: hidden;
}

.vjs-volume-menu-button-vertical:hover .vjs-menu-content,
.vjs-volume-menu-button-vertical:focus .vjs-menu-content,
.vjs-volume-menu-button-vertical.vjs-slider-active .vjs-menu-content,
.vjs-volume-menu-button-vertical .vjs-lock-showing .vjs-menu-content {
    height: 8em;
    width: 2.9em;
}

.vjs-volume-menu-button-horizontal:hover .vjs-menu-content,
.vjs-volume-menu-button-horizontal:focus .vjs-menu-content,
.vjs-volume-menu-button-horizontal .vjs-slider-active .vjs-menu-content,
.vjs-volume-menu-button-horizontal .vjs-lock-showing .vjs-menu-content {
    height: 2.9em;
    width: 8em;
}

.vjs-volume-menu-button.vjs-menu-button-inline .vjs-menu-content {
    background-color: transparent !important;
}

.vjs-poster {
    display: inline-block;
    vertical-align: middle;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: cover;
    background-color: #000000;
    cursor: pointer;
    margin: 0;
    padding: 0;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    height: 100%;
}

.vjs-poster img {
    display: block;
    vertical-align: middle;
    margin: 0 auto;
    max-height: 100%;
    padding: 0;
    width: 100%;
}

.vjs-has-started .vjs-poster {
    display: none;
}

.vjs-audio.vjs-has-started .vjs-poster {
    display: block;
}

.vjs-using-native-controls .vjs-poster {
    display: none;
}

.yan-video .vjs-live-control {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: flex-start;
    -webkit-align-items: flex-start;
    -ms-flex-align: flex-start;
    align-items: flex-start;
    -webkit-box-flex: auto;
    -moz-box-flex: auto;
    -webkit-flex: auto;
    -ms-flex: auto;
    flex: auto;
    font-size: 1em;
    line-height: 3em;
    display: none;
}

.vjs-no-flex .vjs-live-control {
    display: table-cell;
    width: auto;
    text-align: left;
    display: none;
}

.yan-video .vjs-time-control {
    -webkit-box-flex: none;
    -moz-box-flex: none;
    -webkit-flex: none;
    -ms-flex: none;
    flex: none;
    font-size: 1em;
    line-height: 3em;
    min-width: 2em;
    width: auto;
    padding-left: 1em;
    padding-right: 1em;
}

.vjs-live .vjs-time-control {
    display: none;
}

.yan-video .vjs-current-time,
.vjs-no-flex .vjs-current-time {
    display: none;
}

.yan-video .vjs-duration,
.vjs-no-flex .vjs-duration {
    display: none;
}

.vjs-time-divider {
    display: none;
    line-height: 3em;
}

.vjs-live .vjs-time-divider {
    display: none;
}

.yan-video .vjs-play-control {
    cursor: pointer;
    -webkit-box-flex: none;
    -moz-box-flex: none;
    -webkit-flex: none;
    -ms-flex: none;
    flex: none;
}

.vjs-text-track-display {
    position: absolute;
    bottom: 3em;
    left: 0;
    right: 0;
    top: 0;
    pointer-events: none;
}

.yan-video.vjs-user-inactive.vjs-playing .vjs-text-track-display {
    bottom: 1em;
}

.yan-video .vjs-text-track {
    font-size: 1.4em;
    text-align: center;
    margin-bottom: 0.1em;
    background-color: #000;
    background-color: rgba(0, 0, 0, 0.5);
}

.vjs-subtitles {
    color: #fff;
}

.vjs-captions {
    color: #fc6;
}

.vjs-tt-cue {
    display: block;
}

video::-webkit-media-text-track-display {
    -moz-transform: translateY(-3em);
    -ms-transform: translateY(-3em);
    -o-transform: translateY(-3em);
    -webkit-transform: translateY(-3em);
    transform: translateY(-3em);
}

.yan-video.vjs-user-inactive.vjs-playing
    video::-webkit-media-text-track-display {
    -moz-transform: translateY(-1.5em);
    -ms-transform: translateY(-1.5em);
    -o-transform: translateY(-1.5em);
    -webkit-transform: translateY(-1.5em);
    transform: translateY(-1.5em);
}

.yan-video .vjs-fullscreen-control {
    cursor: pointer;
    -webkit-box-flex: none;
    -moz-box-flex: none;
    -webkit-flex: none;
    -ms-flex: none;
    flex: none;
}

.vjs-playback-rate .vjs-playback-rate-value {
    font-size: 1.5em;
    line-height: 2;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    text-align: center;
}

.vjs-playback-rate .vjs-menu {
    width: 4em;
    left: 0em;
}

.vjs-error .vjs-error-display .vjs-modal-dialog-content {
    font-size: 1.4em;
    text-align: center;
}

.vjs-error .vjs-error-display:before {
    font-family: FontAwesome;
    color: #fff;
    content: '\f071';
    color: var(--color-alert-warning);
    font-size: 4em;
    left: 0;
    line-height: 1;
    margin-top: -0.5em;
    position: absolute;
    text-shadow: 0.05em 0.05em 0.1em #000;
    text-align: center;
    top: 50%;
    vertical-align: middle;
    width: 100%;
}

.vjs-loading-spinner {
    display: none;
    position: absolute;
    top: 50%;
    left: 50%;
    margin: -25px 0 0 -25px;
    opacity: 0.85;
    text-align: left;
    border: 6px solid rgba(255, 255, 255, 0.2);
    box-sizing: border-box;
    background-clip: padding-box;
    width: 50px;
    height: 50px;
    border-radius: 25px;
}

.yan-video .vjs-seek-to-live-control {
    display: none;
}
.yan-video .vjs-picture-in-picture-control {
    cursor: pointer;
}

.yan-video .vjs-picture-in-picture-control::before {
    font-family: FontAwesome;
    content: '\f24d';
}
.yan-video.vjs-picture-in-picture .vjs-picture-in-picture-control::before {
    font-family: FontAwesome;
    content: '\f08e';
}

.vjs-seeking .vjs-loading-spinner,
.vjs-waiting .vjs-loading-spinner {
    display: block;
}

.vjs-loading-spinner:before,
.vjs-loading-spinner:after {
    content: '';
    position: absolute;
    margin: -6px;
    box-sizing: inherit;
    width: inherit;
    height: inherit;
    border-radius: inherit;
    opacity: 1;
    border: inherit;
    border-color: transparent;
    border-top-color: white;
}

.vjs-seeking .vjs-loading-spinner:before,
.vjs-seeking .vjs-loading-spinner:after,
.vjs-waiting .vjs-loading-spinner:before,
.vjs-waiting .vjs-loading-spinner:after {
    -webkit-animation: vjs-spinner-spin 1.1s cubic-bezier(0.6, 0.2, 0, 0.8)
            infinite,
        vjs-spinner-fade 1.1s linear infinite;
    animation: vjs-spinner-spin 1.1s cubic-bezier(0.6, 0.2, 0, 0.8) infinite,
        vjs-spinner-fade 1.1s linear infinite;
}

.vjs-seeking .vjs-loading-spinner:before,
.vjs-waiting .vjs-loading-spinner:before {
    border-top-color: white;
}

.vjs-seeking .vjs-loading-spinner:after,
.vjs-waiting .vjs-loading-spinner:after {
    border-top-color: white;
    -webkit-animation-delay: 0.44s;
    animation-delay: 0.44s;
}

@keyframes vjs-spinner-spin {
    100% {
        transform: rotate(360deg);
    }
}

@-webkit-keyframes vjs-spinner-spin {
    100% {
        -webkit-transform: rotate(360deg);
    }
}

@keyframes vjs-spinner-fade {
    0% {
        border-top-color: rgba(255, 255, 255, 0.5);
    }
    20% {
        border-top-color: rgba(255, 255, 255, 0.5);
    }
    30% {
        border-top-color: var(--color-secondary-lime);
    }
    40% {
        border-top-color: var(--color-primary-blue);
    }
    60% {
        border-top-color: rgba(255, 255, 255, 0.5);
    }
    100% {
        border-top-color: rgba(255, 255, 255, 0.5);
    }
}

@-webkit-keyframes vjs-spinner-fade {
    0% {
        border-top-color: #73859f;
    }
    20% {
        border-top-color: #73859f;
    }
    35% {
        border-top-color: white;
    }
    60% {
        border-top-color: #73859f;
    }
    100% {
        border-top-color: #73859f;
    }
}

.vjs-chapters-button .vjs-menu ul {
    width: 24em;
}

.yan-video.vjs-layout-tiny:not(.vjs-fullscreen) .vjs-custom-control-spacer {
    -webkit-box-flex: auto;
    -moz-box-flex: auto;
    -webkit-flex: auto;
    -ms-flex: auto;
    flex: auto;
}

.yan-video.vjs-layout-tiny:not(.vjs-fullscreen).vjs-no-flex
    .vjs-custom-control-spacer {
    width: auto;
}

.yan-video.vjs-layout-tiny:not(.vjs-fullscreen) .vjs-current-time,
.yan-video.vjs-layout-tiny:not(.vjs-fullscreen) .vjs-time-divider,
.yan-video.vjs-layout-tiny:not(.vjs-fullscreen) .vjs-duration,
.yan-video.vjs-layout-tiny:not(.vjs-fullscreen) .vjs-remaining-time,
.yan-video.vjs-layout-tiny:not(.vjs-fullscreen) .vjs-playback-rate,
.yan-video.vjs-layout-tiny:not(.vjs-fullscreen) .vjs-progress-control,
.yan-video.vjs-layout-tiny:not(.vjs-fullscreen) .vjs-mute-control,
.yan-video.vjs-layout-tiny:not(.vjs-fullscreen) .vjs-volume-control,
.yan-video.vjs-layout-tiny:not(.vjs-fullscreen) .vjs-volume-menu-button,
.yan-video.vjs-layout-tiny:not(.vjs-fullscreen) .vjs-chapters-button,
.yan-video.vjs-layout-tiny:not(.vjs-fullscreen) .vjs-descriptions-button,
.yan-video.vjs-layout-tiny:not(.vjs-fullscreen) .vjs-captions-button,
.yan-video.vjs-layout-tiny:not(.vjs-fullscreen) .vjs-subtitles-button,
.yan-video.vjs-layout-tiny:not(.vjs-fullscreen) .vjs-audio-button {
    display: none;
}

.yan-video.vjs-layout-x-small:not(.vjs-fullscreen) .vjs-current-time,
.yan-video.vjs-layout-x-small:not(.vjs-fullscreen) .vjs-time-divider,
.yan-video.vjs-layout-x-small:not(.vjs-fullscreen) .vjs-duration,
.yan-video.vjs-layout-x-small:not(.vjs-fullscreen) .vjs-remaining-time,
.yan-video.vjs-layout-x-small:not(.vjs-fullscreen) .vjs-playback-rate,
.yan-video.vjs-layout-x-small:not(.vjs-fullscreen) .vjs-mute-control,
.yan-video.vjs-layout-x-small:not(.vjs-fullscreen) .vjs-volume-control,
.yan-video.vjs-layout-x-small:not(.vjs-fullscreen) .vjs-volume-menu-button,
.yan-video.vjs-layout-x-small:not(.vjs-fullscreen) .vjs-chapters-button,
.yan-video.vjs-layout-x-small:not(.vjs-fullscreen) .vjs-descriptions-button,
.yan-video.vjs-layout-x-small:not(.vjs-fullscreen) .vjs-captions-button,
.yan-video.vjs-layout-x-small:not(.vjs-fullscreen) .vjs-subtitles-button,
.yan-video.vjs-layout-x-small:not(.vjs-fullscreen) .vjs-audio-button {
    display: none;
}

.yan-video.vjs-layout-small:not(.vjs-fullscreen) .vjs-current-time,
.yan-video.vjs-layout-small:not(.vjs-fullscreen) .vjs-time-divider,
.yan-video.vjs-layout-small:not(.vjs-fullscreen) .vjs-duration,
.yan-video.vjs-layout-small:not(.vjs-fullscreen) .vjs-remaining-time,
.yan-video.vjs-layout-small:not(.vjs-fullscreen) .vjs-playback-rate,
.yan-video.vjs-layout-small:not(.vjs-fullscreen) .vjs-mute-control,
.yan-video.vjs-layout-small:not(.vjs-fullscreen) .vjs-volume-control,
.yan-video.vjs-layout-small:not(.vjs-fullscreen) .vjs-chapters-button,
.yan-video.vjs-layout-small:not(.vjs-fullscreen) .vjs-descriptions-button,
.yan-video.vjs-layout-small:not(.vjs-fullscreen) .vjs-captions-button,
.yan-video.vjs-layout-small:not(.vjs-fullscreen)
    .vjs-subtitles-button
    .vjs-audio-button {
    display: none;
}

.vjs-caption-settings {
    position: relative;
    top: 1em;
    background-color: #2b333f;
    background-color: rgba(43, 51, 63, 0.75);
    color: #fff;
    margin: 0 auto;
    padding: 0.5em;
    height: 16em;
    font-size: 12px;
    width: 40em;
}

.vjs-caption-settings .vjs-tracksettings {
    top: 0;
    bottom: 1em;
    left: 0;
    right: 0;
    position: absolute;
    overflow: auto;
}

.vjs-caption-settings .vjs-tracksettings-colors,
.vjs-caption-settings .vjs-tracksettings-font {
    float: left;
}

.vjs-caption-settings .vjs-tracksettings-colors:after,
.vjs-caption-settings .vjs-tracksettings-font:after,
.vjs-caption-settings .vjs-tracksettings-controls:after {
    clear: both;
}

.vjs-caption-settings .vjs-tracksettings-controls {
    position: absolute;
    bottom: 1em;
    right: 1em;
}

.vjs-caption-settings .vjs-tracksetting {
    margin: 5px;
    padding: 3px;
    min-height: 40px;
    border: none;
}

.vjs-caption-settings .vjs-tracksetting label,
.vjs-caption-settings .vjs-tracksetting legend {
    display: block;
    width: 100px;
    margin-bottom: 5px;
}

.vjs-caption-settings .vjs-tracksetting span {
    display: inline;
    margin-left: 5px;
    vertical-align: top;
    float: right;
}

.vjs-caption-settings .vjs-tracksetting > div {
    margin-bottom: 5px;
    min-height: 20px;
}

.vjs-caption-settings .vjs-tracksetting > div:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    min-height: 0;
}

.vjs-caption-settings label > input {
    margin-right: 10px;
}

.vjs-caption-settings fieldset {
    margin-top: 1em;
    margin-left: 0.5em;
}

.vjs-caption-settings fieldset .vjs-label {
    position: absolute;
    clip: rect(1px 1px 1px 1px);
    /* for Internet Explorer */
    clip: rect(1px, 1px, 1px, 1px);
    padding: 0;
    border: 0;
    height: 1px;
    width: 1px;
    overflow: hidden;
}

.vjs-caption-settings input[type='button'] {
    width: 40px;
    height: 40px;
}

.yan-video .vjs-modal-dialog {
    background: rgba(0, 0, 0, 0.8);
    background: -webkit-linear-gradient(
        -90deg,
        rgba(0, 0, 0, 0.8),
        rgba(255, 255, 255, 0)
    );
    background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.8),
        rgba(255, 255, 255, 0)
    );
}

.vjs-modal-dialog .vjs-modal-dialog-content {
    font-size: 1.2em;
    line-height: 1.5;
    padding: 20px 24px;
    z-index: 1;
}

@media print {
    .yan-video > *:not(.vjs-tech):not(.vjs-poster) {
        visibility: hidden;
    }
}

@media \0screen {
    .vjs-user-inactive.vjs-playing .vjs-control-bar :before {
        content: '';
    }
}

@media \0screen {
    .vjs-has-started.vjs-user-inactive.vjs-playing .vjs-control-bar {
        visibility: hidden;
    }
}
</style>
