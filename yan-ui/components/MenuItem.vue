<template>
    <component
        class="menu-item-wrapper"
        :to="to"
        v-bind:is="to ? 'router-link' : 'span'"
    >
        <div class="menu-item-content">
            <div class="menu-item-icon">
                <fa
                    class="menu-item-icon-direct"
                    fixed-width
                    :icon="['fal', icon]"
                ></fa>
            </div>
            <div class="menu-item-text">
                {{ text }}
            </div>
            <div class="menu-item-hint-bar"></div>
        </div>
        <div class="menu-item-extra-content" v-if="$slots.default">
            <slot></slot>
        </div>
    </component>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'

class Props {
    icon = prop({
        type: String,
        required: true,
    })

    text = prop({
        type: String,
        required: true,
    })

    to = prop({
        required: false,
    })
}

@Options({
    components: {},
})
export default class MenuItem extends Vue.with(Props) {}
</script>

<style lang="scss" scoped>
.menu-item-wrapper {
    transition: background 0.2s;
    display: flex;
    flex-direction: column;
    background: var(--color-transparent-white);
    border-radius: var(--border-radius) 0 0 var(--border-radius);
    font-size: var(--menu-font-size);
    padding: var(--padding-small);
    position: relative;
    text-decoration: none;
    transition: color $theme-duration, background $theme-duration;
    color: var(--color-primary-black);
    margin-bottom: var(--padding-tiny);
    overflow: hidden;

    .menu-item-content {
        display: flex;
        align-items: center;
        max-width: 100%;
    }

    .menu-item-extra-content {
        max-width: 100%;
        margin-top: var(--padding-tiny);
        transform: translateX(-25%);
        transition: transform $theme-duration;
    }

    .menu-item-icon {
        padding-right: var(--padding-normal);
    }

    .menu-item-text {
        opacity: 0;
        transition: opacity 0.2s;
        display: block;
        min-width: 256px;
        white-space: nowrap;
    }

    .menu-item-hint-bar {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: var(--padding-tiny);
        background: var(--gradient-success);
        transform-origin: 100% 50%;
        transform: scaleX(0);
        transition: transform 0.2s;
    }

    &.router-link-active {
        background: var(--color-primary-light-gray);
        .menu-item-hint-bar {
            transform: scaleX(1);
            @include mobile {
                transform: scaleY(1);
            }
        }
    }

    &:hover {
        background: var(--color-primary-light-gray);
    }

    @include mobile {
        border-radius: 0 0 var(--border-radius) var(--border-radius);
        margin: 0 4px;
        margin-bottom: 100%;

        .menu-item-content {
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 40px;
        }

        .menu-item-icon {
            padding-right: 0;
        }

        .menu-item-text {
            font-size: 11px;
            min-width: 0;
            opacity: 1 !important;
        }

        .menu-item-hint-bar {
            top: 0;
            left: 0;
            right: 0;
            bottom: initial;
            height: var(--padding-tiny);
            width: 100%;
            transform-origin: 50% 0%;
            transform: scaleY(0);
        }
    }
}
</style>

<style lang="scss">
#menu {
    &:hover,
    &.pinned {
        .menu-item-text {
            opacity: 1;
        }

        .menu-item-extra-content {
            transform: translateX(0%);
            max-width: calc(100% - var(--padding-small) * 2);
        }
    }
}
</style>
