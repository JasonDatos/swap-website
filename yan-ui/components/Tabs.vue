<template>
    <div
        class="tabs-wrapper"
        :class="[
            direction,
            { fullWidth, ghost, spacing, scrollable, mobile_active, is_page },
        ]"
    >
        <div class="tabs-buttons">
            <Button
                v-for="tab in tabs"
                :key="tab.props.title"
                class="tab-button"
                :size="small ? 'is-small' : ''"
                :class="{ selected: selectedIndex == tab.props.title }"
                :no-hover="selectedIndex == tab.props.title"
                type="is-gray"
                :to="tab.props.to"
                :external="tab.props.external"
                @click.prevent="clickTab(tab)"
            >
                <div class="tab-button-content">
                    <div class="tab-button-title">
                        {{ tab.props.title }}
                    </div>
                    <div v-once class="tabs-chevron-right">
                        <fa-icon :icon="['fal', 'chevron-right']"></fa-icon>
                    </div>
                </div>
            </Button>
        </div>
        <div class="tabs-background"></div>
        <div v-once class="tabs-content" :class="{ card: hasCard }">
            <slot />
            <div class="tabs-footer" v-if="$slots.footer">
                <slot name="footer"></slot>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'
import Button from '@/yan-ui/components/Button.vue'

class Props {
    useShow = prop({
        type: Boolean,
        required: false,
        default: false,
    })

    direction = prop({
        type: String,
        required: false,
        default: 'bottom',
        validator: (value) =>
            value === 'top' ||
            value === 'bottom' ||
            value === 'left' ||
            value === 'right',
    })

    hasCard = prop({
        type: Boolean,
        required: false,
        default: false,
    })

    fullWidth = prop({
        type: Boolean,
        default: false,
        required: false,
    })

    ghost = prop({
        type: Boolean,
        default: false,
        required: false,
    })

    small = prop({
        type: Boolean,
        default: false,
        required: false,
    })

    spacing = prop({
        type: Boolean,
        default: true,
        required: false,
    })

    scrollable = prop({
        type: Boolean,
        default: false,
        required: false,
    })

    is_page = prop({
        type: Boolean,
        default: false,
        required: false,
    })
}

const isTab = (node: any) => node.type.name === 'TabItem'
const isFragment = (node: any) =>
    typeof node.type === 'symbol' && node.type.description === 'Fragment'
const hasTabs = (node: any) =>
    node.children && node.children.length && node.children.some(isTab)
const isTabParent = (node: any) => isFragment(node) && hasTabs(node)

@Options({
    name: 'Tabs',
    components: {
        Button,
    },
})
export default class Tabs extends Vue.with(Props) {
    private selectedIndex = 0
    private tabs: any = []
    private count = 0
    private mobile_active = false

    mounted() {
        this.selectTab(this.tabs[0].props.title)
    }

    beforeUpdate() {
        this.update()
    }
    beforeMount() {
        this.update()
    }

    private selectTab(i: any) {
        this.selectedIndex = i
    }

    private clickTab(tab: any) {
        if (tab.props.to) return
        this.selectTab(tab.props.title)
        if (this.is_page) {
            this.mobile_active = true
            this.$yanui.back.element_append({
                component: this,
                title: tab.props.title,
            })
        }
    }

    private back_click() {
        this.mobile_active = false
    }

    private update() {
        if (this.$slots.default) {
            this.tabs = this.$slots
                .default()
                .filter((node) => isTab(node) || isTabParent(node))
                .flatMap((node) => (isTabParent(node) ? node.children : node))
        }
    }
}
</script>

<style lang="scss">
@mixin default-top {
    & > .tabs-content {
        order: 0;

        &::before {
            content: '';
            bottom: 0;
            top: initial;
        }

        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
    }

    & > .tabs-buttons {
        order: 1;
        overflow-x: auto;
        .tab-button {
            transition: margin-top 0.2s, border-top-left-radius 0.2s,
                border-top-right-radius 0.2s, transform 0.2s;
            margin-top: var(--padding-tiny);
            margin-bottom: 0;
            &.selected {
                margin-top: 0;
                --border-top-left-radius: 0;
                --border-top-right-radius: 0;
            }
        }
    }
}

@mixin default-bottom {
    & > .tabs-content {
        &::before {
            content: '';
        }
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }

    & > .tabs-buttons {
        overflow-x: auto;
        .tab-button {
            transition: margin-bottom 0.2s, border-bottom-left-radius 0.2s,
                border-bottom-right-radius 0.2s, transform 0.2s;

            &.selected {
                margin-bottom: 0;
                --border-bottom-left-radius: 0;
                --border-bottom-right-radius: 0;
            }
        }
    }
}

.tabs-wrapper {
    display: flex;
    flex-direction: column;
    padding-bottom: var(--padding-small);

    @include desktop {
    }

    &:not(.is_page) {
        & > .tabs-buttons {
            & > .tab-button {
                &.selected {
                    transition: none;
                    color: var(--color-white);

                    .button-background {
                        background: var(--gradient-success);
                    }
                }
            }
        }
    }

    &.is_page {
        padding-bottom: 0;

        @include desktop {
            & > .tabs-buttons {
                & > .tab-button {
                    &.selected {
                        transition: none;
                        color: var(--color-white);

                        .button-background {
                            background: var(--gradient-success);
                        }
                    }
                }
            }
        }

        @include mobile {
            &.mobile_active {
                & > .tabs-buttons {
                    & > .tab-button {
                        &.selected {
                            transition: none;
                            color: var(--color-white);

                            .button-background {
                                background: var(--gradient-success);
                            }
                        }
                    }
                }
            }
        }
    }

    & > .tabs-content {
        position: relative;
        display: grid;
        padding-top: var(--padding-normal);
        padding-bottom: var(--padding-normal);
        &::before {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: 2;
            height: 2px;
            background: var(--gradient-success);
        }

        @include mobile {
            padding-top: var(--padding-small);
            padding-bottom: var(--padding-small);
        }

        & > .tabs-footer {
            //position: absolute;
            //bottom: 0;
            //width: 100%;
            box-sizing: border-box;
            position: absolute;
            display: flex;
            vertical-align: bottom;
            justify-content: flex-end;
            bottom: 0;
            width: 100%;
            background: var(--color-primary-white);
            transition: background $theme-duration;
            z-index: 1;
            @include desktop {
                padding-top: var(--padding-tiny);
                padding-bottom: var(--padding-tiny);
                padding-left: var(--padding-normal);
                padding-right: var(--padding-giant);
            }
            @include mobile {
                padding-top: var(--padding-tiny);
                padding-bottom: var(--padding-tiny);
                padding-left: var(--padding-normal);
                padding-right: var(--padding-normal);
            }
            align-self: end;

            .button-wrapper {
                margin-bottom: 0;
            }
        }
    }

    & > .tabs-buttons {
        & > .tab-button {
            &:first-child {
                margin-left: 0;
            }
            &:last-child {
                margin-right: 0;
            }

            .tabs-chevron-right {
                display: none;
            }
        }
    }

    & > .tabs-background {
        display: none;
    }

    &.ghost {
        & > .tabs-content {
            display: none;
            pointer-events: none;
        }

        @include mobile {
            & > .tabs-buttons {
                & > .tab-button {
                    flex-shrink: 1;
                }
            }
        }
    }

    &.fullWidth {
        & > .tabs-buttons {
            & > .tab-button {
                width: 100%;
                flex-shrink: 1;
            }
        }
    }

    &.scrollable {
        max-height: 100%;
        height: 100%;
        & > .tabs-content {
            overflow: hidden;

            & > .tab-item {
                overflow-x: hidden;
                overflow-y: auto;
                padding-right: var(--padding-small);
            }
        }
    }

    &.spacing {
        & > .tabs-content {
            padding: var(--padding-normal);

            @include mobile {
                padding: var(--padding-small);
            }
        }
    }

    &:not(.ghost) {
        &.bottom {
            @include default-bottom;
        }

        &.top {
            @include default-top;
        }

        @include desktop {
            &.is_page {
                &.left,
                &.right {
                    & > .tabs-content {
                        padding-top: 0;
                        padding-bottom: 0;
                        margin-bottom: var(--content-padding-bottom);
                    }
                }
            }

            &:not(.spacing) {
                &.left {
                    padding-right: var(--content-padding-right);
                    & > .tabs-content {
                        & > .tab-item {
                            padding-right: var(--padding-normal);
                            padding-left: var(--content-padding-left);
                        }
                    }
                }
                &.right {
                    padding-left: var(--content-padding-left);
                    & > .tabs-content {
                        & > .tab-item {
                            padding-left: var(--padding-normal);
                            padding-right: var(--content-padding-right);
                        }
                    }
                }
            }

            &.left {
                flex-direction: row;
                flex-grow: 1;
                flex-shrink: 0;

                & > .tabs-content {
                    order: 0;
                    width: 100%;
                    //display: flex;
                    //flex-direction: column;
                    //flex: 0 1 auto;

                    &::before {
                        content: '';
                        bottom: 0;
                        top: 0;
                        left: initial;
                        right: 0;
                        width: 2px;
                        height: 100%;
                    }

                    border-top-right-radius: 0;
                    border-top-right-radius: 0;
                }

                & > .tabs-buttons {
                    order: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    flex: 1 0 150px;
                    overflow-y: auto;

                    & > .tab-button {
                        transition: margin-left 0.2s,
                            border-top-left-radius 0.2s,
                            border-bottom-left-radius 0.2s, transform 0.2s;
                        margin-left: var(--padding-tiny);
                        margin-right: 0;
                        &:last-child {
                            margin-bottom: 0;
                        }
                        &.selected {
                            margin-left: 0;
                            --border-top-left-radius: 0;
                            --border-bottom-left-radius: 0;
                        }
                    }
                }
            }

            &.right {
                flex-direction: row;
                flex-grow: 1;
                flex-shrink: 0;

                & > .tabs-content {
                    width: 100%;
                    //display: flex;
                    //flex-direction: column;
                    //flex: 0 1 auto;

                    &::before {
                        content: '';
                        bottom: 0;
                        top: 0;
                        left: 0;
                        right: initial;
                        width: 2px;
                        height: 100%;
                    }

                    border-top-left-radius: 0;
                    border-top-left-radius: 0;
                }

                & > .tabs-buttons {
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    direction: rtl;
                    overflow-y: auto;
                    flex: 1 0 150px;

                    & > .tab-button {
                        transition: margin-right 0.2s,
                            border-top-right-radius 0.2s,
                            border-bottom-right-radius 0.2s, transform 0.2s;
                        margin-left: 0;
                        margin-right: var(--padding-tiny);
                        &:last-child {
                            margin-bottom: 0;
                        }
                        &.selected {
                            margin-right: 0;
                            --border-top-right-radius: 0;
                            --border-bottom-right-radius: 0;
                        }
                    }
                }
            }
        }

        @include mobile {
            &.is_page {
                box-sizing: border-box;
                position: relative;
                padding: 0;
                padding-right: var(--content-padding-right);
                padding-left: var(--content-padding-left);
                padding-top: var(--content-padding-top);

                & > * .is_page {
                    padding-left: 0;
                    padding-right: 0;
                    padding-top: 0;
                }

                & > .tabs-background {
                    pointer-events: none;
                    display: block;
                    position: fixed;
                    top: calc(var(--padding-small) * -1);
                    bottom: calc(var(--padding-small) * -1 - 72px);
                    left: calc(var(--padding-normal) * -1);
                    right: calc(var(--padding-normal) * -1);
                    z-index: 15;
                    background: var(--color-black);
                    opacity: 0;
                    transition: opacity 0.25s;
                }

                &.mobile_active {
                    & > .tabs-background {
                        opacity: 0.5;
                    }
                }

                & > .tabs-content {
                    transition: transform 0.25s ease-in-out;
                    transform: translateX(100vw);
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: var(--color-primary-white);
                    z-index: 20;
                    padding: 0;

                    & > .tab-item {
                        position: absolute;
                        left: 0;
                        right: 0;
                        top: 0;
                        bottom: 0;
                        padding-left: var(--padding-normal);
                        padding-right: var(--padding-normal);
                        padding-top: var(--content-padding-top);
                        margin-top: 64px;
                        padding-bottom: 0;
                    }
                }

                & > .tabs-buttons {
                    flex-direction: column;
                    z-index: 10;
                    background: var(--color-primary-white);
                    overflow-y: visible;
                    & > .tab-button {
                        border-radius: var(--border-radius) !important;
                        .button-content {
                            justify-content: flex-start;
                        }
                        margin-left: 0;
                        margin-right: 0;
                        margin-bottom: var(--padding-tiny) !important;
                        margin-top: 0;

                        .button-text {
                            width: 100%;
                        }

                        .tab-button-content {
                            width: 100%;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            .tabs-chevron-right {
                                padding-left: var(--padding-tiny);
                                display: flex;
                                justify-content: flex-end;
                                align-items: center;
                                justify-self: flex-end;
                                font-size: 1em;
                            }
                        }
                    }
                }

                &.mobile_active {
                    & > .tabs-content {
                        transform: translateX(0vw);
                    }
                }
            }

            &:not(.is_page) {
                &.left,
                &.right {
                    flex-direction: column;
                    @include default-bottom;
                }
                & > .tabs-buttons {
                    & > .tab-button {
                        flex-shrink: 1;
                    }
                }
            }
        }
    }

    & > .tabs-buttons {
        display: flex;
    }
}
</style>

<style lang="scss"></style>
