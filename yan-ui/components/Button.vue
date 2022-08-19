<template>
    <div
        class="button-wrapper"
        :class="[
            type,
            size,
            state,

            { square, loading, spacing, noHover, visible, ignoremobile, inactive },
        ]"
        :style="{ width: width !== 'auto' ? width : null }"
        @click="to_link"
        :tabindex="tabindex"
    >
        <div class="button-background"></div>
        <div class="button-background-hover"></div>
        <div class="button-content">
            <div class="button-icon" v-if="icon">
                <fa :icon="['fal', icon]" :fixed-width="iconFixedWidth"></fa>
            </div>
            <div class="button-text" v-if="$slots.default">
                <slot></slot>
            </div>
            <div class="button-dropdown-icon" v-if="dropdown">
                <fa :icon="['fal', dropdownIcon]"></fa>
            </div>
        </div>
        <div class="button-loading">
            <div class="button-loading-background"></div>
            <div class="button-loading-spinner">
                <fa :icon="['fal', 'spinner-third']" spin></fa>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'

class Props {
    type = prop({
        type: String,
        default: 'is-empty',
        required: false,
    })
    icon = prop({
        type: String,
        default: '',
        required: false,
    })
    iconFixedWidth = prop({
        type: Boolean,
        default: true,
        required: false,
    })
    square = prop({
        type: Boolean,
        default: false,
        required: false,
    })
    size = prop({
        type: String,
        default: '',
        required: false,
    })
    width = prop({
        type: String,
        default: 'auto',
        required: false,
    })
    state = prop({
        type: String,
        default: '',
        required: false,
    })
    loading = prop({
        type: Boolean,
        default: false,
        required: false,
    })
    spacing = prop({
        type: Boolean,
        default: true,
        required: false,
    })
    noHover = prop({
        type: Boolean,
        default: false,
    })
    visible = prop({
        type: Boolean,
        required: false,
        default: true,
    })
    dropdown = prop({
        type: Boolean,
        required: false,
        default: false,
    })
    dropdownIcon = prop({
        type: String,
        required: false,
        default: 'chevron-down',
    })
    to = prop({
        type: String,
        required: false,
    })
    toNewTab = prop({
        type: String,
        required: false,
    })
    external = prop({
        type: Boolean,
        required: false,
        default: false,
    })

    tabindex = prop({
        type: Number,
        required: false,
        default: -1,
    })

    ignoremobile = prop({
        type: Boolean,
        required: false,
        default: false,
    })
    
    inactive = prop({
        type: Boolean,
        required: false,
        default: false,
    })
}

@Options({
    name: 'Button',
    components: {},
})
export default class Button extends Vue.with(Props) {
    public to_link() {
        if (!this.to) return;
        console.log("???");
        if (!this.external) {
            if (this.to) {
                this.$router.push(this.to)
            }
        } else {
            window.open(this.to, '_target')
        }
    }
}
</script>

<style lang="scss">
@mixin active-hover {
    &:not(.noHover) {
        &:hover,
        &.active {
            &:not(.loading) {
                &:not(.inactive) {
                    @content;
                }
            }
        }
    }
}

.button-wrapper {
    --button-hover-color: var(--color-primary-light-gray);

    --border-top-left-radius: var(--border-radius);
    --border-top-right-radius: var(--border-radius);
    --border-bottom-left-radius: var(--border-radius);
    --border-bottom-right-radius: var(--border-radius);

    user-select: none;
    box-sizing: border-box;
    display: inline-block;
    min-width: min-content;
    min-height: min-content;
    flex-shrink: 0;
    text-align: center;
    position: relative;
    overflow: hidden;
    padding: var(--padding-tiny) var(--padding-small);
    border-top-left-radius: var(--border-top-left-radius);
    border-top-right-radius: var(--border-top-right-radius);
    border-bottom-left-radius: var(--border-bottom-left-radius);
    border-bottom-right-radius: var(--border-bottom-right-radius);

    transition: color $theme-duration, opacity 0.2s, transform 0.2s,
        border-top-left-radius 0.2s, border-top-right-radius 0.2s,
        border-bottom-left-radius 0.2s, border-bottom-right-radius 0.2s,
        filter 0.2s;
    cursor: pointer;
    color: var(--color-primary-black);

    &:not(.visible) {
        pointer-events: none;
        opacity: 0;
        transform: scale(0.75);
    }

    @include mobile {
        padding: var(--padding-small) var(--padding-normal);
    }

    &.spacing {
        margin-right: var(--padding-micro);
        margin-left: var(--padding-micro);
        margin-bottom: var(--padding-tiny);
        @include mobile {
            margin-right: var(--padding-micro);
            margin-left: var(--padding-micro);
            margin-bottom: var(--padding-micro);

            &:not(.square) {
                margin-left: 0;
                margin-right: 0;
            }

            &.tab-button {
                margin-right: var(--padding-tiny);
                margin-left: var(--padding-tiny);
                margin-top: var(--padding-tiny);
                margin-bottom: var(--padding-tiny);
            }
        }
    }

    &:first-child {
        margin-left: 0;
    }
    &:last-child {
        margin-right: 0;
    }

    &:not(.ignoremobile){
        @include mobile {
            width: 100%;
            margin-left: 0;
            margin-right: 0;
        }
    }

    .button-background {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        opacity: 1;
        z-index: 1;
        background: transparent;
        transition: opacity 0.2s, background $theme-duration;
        pointer-events: none;
        border-top-left-radius: var(--border-top-left-radius);
        border-top-right-radius: var(--border-top-right-radius);
        border-bottom-left-radius: var(--border-bottom-left-radius);
        border-bottom-right-radius: var(--border-bottom-right-radius);
    }

    .button-background-hover {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        opacity: 0;
        background: var(--button-hover-color);
        transition: opacity 0.1s 0.2s, background $theme-duration;
        pointer-events: none;
        border-top-left-radius: var(--border-top-left-radius);
        border-top-right-radius: var(--border-top-right-radius);
        border-bottom-left-radius: var(--border-bottom-left-radius);
        border-bottom-right-radius: var(--border-bottom-right-radius);
    }

    &.noHover {
        cursor: default;
        .button-background {
            opacity: 1;
        }
        .button-background-hover {
            opacity: 0;
            //opacity: 1;
        }
    }

    .button-content {
        position: relative;
        z-index: 2;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.2s, color $theme-duration;

        .button-text {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .button-icon {
            padding-right: var(--padding-tiny);
            display: flex;
            align-items: center;
            justify-content: center;
            &:last-child {
                padding-right: 0;
            }
        }

        .button-dropdown-icon {
            display: flex;
            align-items: center;
            padding-left: var(--padding-tiny);
            //transform: translate(50%, 0.1em) scale(1.5);

            &:first-child {
                padding-left: 0;
            }
        }
    }

    .button-loading {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 3;
        pointer-events: none;
        display: flex;
        justify-content: center;
        align-items: center;

        .button-loading-background {
            position: absolute;
            transition: opacity 0.2s;
            opacity: 0;
            background: var(--color-black);
            width: 100%;
            height: 100%;
        }
    }

    &.loading {
        .button-loading {
            opacity: 1;

            .button-loading-background {
                opacity: 0.5;
            }
        }

        .button-content {
            opacity: 0;
        }
    }

    &.square {
        width: 35px;
        height: 35px;
        font-size: 24px;
        padding: 0;
        .button-content {
            .button-icon {
                padding-right: 0;
            }
        }

        &.is-small {
            height: 32px;
            width: 32px;
            font-size: 20px;
            padding: 0;
        }

        &.is-large {
            padding: var(--padding-micro) var(--padding-small);
            width: 48px;
            height: 48px;
            font-size: 1.2em;
        }
    }

    &.inactive {
        opacity: 0.5;
        cursor: not-allowed;
    }

    &.is-small {
        padding: var(--padding-micro) var(--padding-small);
        font-size: 0.9em;
        @include mobile {
            padding: var(--padding-tiny) var(--padding-small);
        }
    }

    &.is-large {
        padding: var(--padding-small) var(--padding-normal);

        &:not(.ignoremobile){
            @include mobile {
                padding: var(--padding-tiny) var(--padding-small);
            }
        }
    }

    @include active-hover {
        .button-background {
            opacity: 0;
        }
        .button-background-hover {
            transition: background $theme-duration;
            opacity: 1;
        }
    }

    &:active {
        filter: brightness(0.75);
    }

    &.is-success {
        color: var(--color-white);

        @include active-hover {
            color: var(--color-primary-black);
        }

        .button-background {
            background: var(--gradient-success);
        }
    }

    &.is-warning {
        color: var(--color-white);

        @include active-hover {
            color: var(--color-primary-black);
        }

        .button-background {
            background: var(--gradient-warning);
        }
    }

    &.is-danger {
        color: var(--color-white);

        @include active-hover {
            color: var(--color-primary-black);
        }

        .button-background {
            background: var(--gradient-danger);
        }
    }

    &.is-gray,
    &.is-grey {
        color: var(--color-primary-black);

        @include active-hover {
            color: var(--color-primary-black);
        }

        .button-background {
            background: var(--color-primary-light-gray);
        }

        .button-background-hover {
            background: var(--color-primary-gray);
        }
    }

    &.is-ghost-white {
        color: var(--color-white);

        @include active-hover {
            color: var(--color-primary-black);
        }
        .button-background-hover {
            transition: opacity 0.2s, background $theme-duration,
                color $theme-duration !important;
        }
    }

    &.is-empty {
        .button-background-hover {
            transition: opacity 0.2s, background $theme-duration !important;
        }
    }
}
</style>
