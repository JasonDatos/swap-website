<template>
    <div ref="listWrapper" class="list-wrapper">
        <div
            v-if="refresh"
            ref="pullRequest"
            class="list-top-loading"
            :class="{
                'pulled-enough':
                    this.refresh_pull_value == this.refresh_pull_max ||
                    this.data_refresh_requested,
                'pulled-loading': this.data_refresh_requested,
                'pulled-completed': this.data_refresh_completed,
            }"
        >
            <template v-if="this.data_refresh_completed">
                <div class="refresh-icon">
                    <fa-icon :icon="['fal', 'check-circle']"></fa-icon>
                </div>
                <div class="refresh-text">Completed!</div>
            </template>
            <template v-else-if="!this.data_refresh_requested">
                <div class="refresh-icon">
                    <fa-icon :icon="['fal', 'long-arrow-up']"></fa-icon>
                </div>
                <div class="refresh-text">
                    {{
                        this.refresh_pull_value == this.refresh_pull_max
                            ? 'Release to refresh'
                            : 'Pull to refresh'
                    }}
                </div>
            </template>
            <template v-else>
                <div class="refresh-icon">
                    <fa-icon :icon="['fal', 'spinner-third']" spin></fa-icon>
                </div>
                <div class="refresh-text">Loading...</div>
            </template>
        </div>
        <div
            v-if="refresh"
            class="pull-request-desktop"
            :class="{ active: !pull_desktop_active }"
        >
            <div class="pull-request-desktop-button">
                <Button
                    @click="pull_down_desktop"
                    icon="redo-alt"
                    :no-hover="true"
                    :square="true"
                    size="is-small"
                    type="is-success"
                ></Button>
            </div>
        </div>
        <div
            ref="listScroll"
            class="list-scroll"
            :class="{ 'stop-scroll': stopScroll }"
        >
            <template v-if="data">
                <ListItem
                    v-for="(item, $index) in data"
                    :data-index="$index"
                    :has-card="hasCard"
                    :hoverable="hoverable"
                    :key="id ? item[id] : $index"
                >
                    <slot :item="item" :index="$index"></slot>
                </ListItem>
            </template>
            <template v-else>
                <slot></slot>
            </template>
            <div v-if="data_requested" class="list-bottom-loading">
                <fa-icon :icon="['fal', 'spinner-third']" spin></fa-icon>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'
import ListItem from './ListItem.vue'
import PullSwipe from './../../utils/PullSwipe'
import Button from './../Button.vue'
import Math_Utils from './../../utils/MathUtils'
import Utils from '@/yan-ui/utils/Utils'

class Props {
    data = prop({
        type: Array as () => Array<any> | any,
        default: null,
        required: false,
    })

    id = prop({
        type: String,
        default: '',
        required: false,
    })

    hasCard = prop({
        type: Boolean,
        default: true,
        required: false,
    })

    hoverable = prop({
        type: Boolean,
        default: true,
        required: false,
    })

    //---

    loadBottomOffset = prop({
        type: Number,
        default: 0,
        required: false,
    })

    refresh = prop({
        type: Boolean,
        default: false,
        required: false,
    })

    stopScroll = prop({
        type: Boolean,
        default: false,
        required: false,
    })
}

@Options({
    components: {
        ListItem,
        Button,
    },
    emits: ['scroll', 'load-more'],
})
export default class List extends Vue.with(Props) {
    private data_requested: boolean = false
    private data_refresh_requested: boolean = false
    private data_refresh_completed: boolean = false
    private data_completed: boolean = false
    private pull_desktop_active: boolean = false

    private refresh_pull_value: number = 0
    private refresh_pull_max: number = 80

    private on_top: boolean = true
    private pull_swipe: PullSwipe | any = null

    declare $refs: {
        listScroll: HTMLInputElement
        pullRequest: HTMLElement
    }

    public loading_done(complete: boolean = false) {
        this.data_requested = false
        this.data_completed = complete
    }

    public reset() {
        this.data_completed = false
    }

    public refresh_done() {
        this.data_refresh_completed = true
        this.data_refresh_requested = false
        this.pull_down_end_animation()
    }

    mounted() {
        //@ts-ignore //TypeScript bug
        this.$refs.listWrapper.scrollTop = this.$refs.listWrapper.scrollHeight

        this.update_data()
        this.$watch('data', this.update_data)
        this.$watch('stopScroll', () => {
            if (this.stopScroll) {
                window.requestAnimationFrame(this.auto_scroll)
            } else {
                this.scroll_delta = 0
            }
        })

        this.$refs.listScroll.addEventListener('scroll', this.scroll, {
            passive: true,
        })
        this.$refs.listScroll.addEventListener('touchmove', this.on_move)
        this.$refs.listScroll.addEventListener('mousemove', this.on_move)
        //@ts-ignore //TypeScript bug
        if (this.refresh && this.$refs.pullRequest) {
            //@ts-ignore //TypeScript bug
            this.$refs.pullRequest.style.setProperty(
                '--max-height',
                this.refresh_pull_max + 'px',
            )

            this.pull_swipe = new PullSwipe(this.$el, this.refresh_pull_max)
            this.pull_swipe.event.on('pull-update', this.pull_update)
            this.pull_swipe.event.on('pull-down', this.pull_down)
            this.pull_swipe.event.on('pull-revert', this.pull_revert)
        }
    }

    beforeUnmount() {
        this.$refs.listScroll.removeEventListener('scroll', this.scroll)
        this.$refs.listScroll.removeEventListener('touchmove', this.on_move)
        this.$refs.listScroll.removeEventListener('mousemove', this.on_move)

        if (this.refresh && this.$refs.pullRequest) {
            this.pull_swipe.destroy()
        }
    }

    private pull_revert() {
        this.data_refresh_completed = false
        this.data_refresh_requested = false
        this.pull_down_end_animation()
    }

    private pull_update(pos: any) {
        if (!this.data_refresh_requested && !this.data_refresh_completed) {
            if ((this.on_top && pos.deltaY < 0) || pos.deltaY >= 0) {
                this.refresh_pull_value = Math.max(
                    0,
                    Math.min(-pos.deltaY, this.refresh_pull_max),
                ) //This will make sure do not go over the max value or below 0

                this.pull_down_update_property()
            }
        } else {
            this.pull_swipe.swipeStartReset()
        }
    }

    private pull_down_desktop() {
        if (!this.pull_desktop_active) {
            this.pull_desktop_active = true
            if (this.refresh_pull_value === 0) {
                this.refresh_pull_value = 1
            }
        }

        if (this.refresh_pull_value < this.refresh_pull_max) {
            this.refresh_pull_value = (
                this.$i ? this.$i : this
            ).$yanui.math_utils.approach_smooth(
                this.refresh_pull_value,
                this.refresh_pull_max,
                0.15,
            )
            this.pull_down_update_property()
            window.requestAnimationFrame(this.pull_down_desktop)
        } else {
            this.refresh_pull_value = this.refresh_pull_max
            this.pull_down_update_property()
            this.pull_down()
        }
    }

    private pull_down() {
        if (!this.data_refresh_requested && !this.data_refresh_completed) {
            this.data_refresh_requested = true
            setTimeout(() => {
                this.refresh_done()
            }, 1000)
        } else {
            this.pull_swipe.swipeStartReset()
        }
    }

    private pull_down_update_property() {
        if (!this.data_refresh_requested && !this.data_refresh_completed) {
            //@ts-ignore //TypeScript bug
            this.$refs.pullRequest.style.setProperty(
                '--height',
                this.refresh_pull_value + 'px',
            )
            //@ts-ignore //TypeScript bug
            this.$refs.pullRequest.style.setProperty(
                '--value',
                //@ts-ignore
                this.refresh_pull_value / this.refresh_pull_max,
            )
        }
    }

    private pull_down_end_animation() {
        if (this.refresh_pull_value > 1) {
            this.refresh_pull_value = Math_Utils.approach_smooth(
                this.refresh_pull_value,
                0,
                0.1,
            )
            this.pull_down_update_property()
            window.requestAnimationFrame(this.pull_down_end_animation)
        } else {
            this.data_refresh_completed = false
            this.data_refresh_requested = false
            this.pull_desktop_active = false
            this.refresh_pull_value = 0
        }
    }

    private scroll_delta: number = 0

    private on_move(e: TouchEvent | MouseEvent) {
        if (this.stopScroll) {
            const pos = Utils.get_position(e)
            const list_scroll_element = this.$refs.listScroll

            const list_bounding = list_scroll_element.getBoundingClientRect()

            if (list_bounding.y > pos.y - 100) {
                //Top Screen
                this.scroll_delta = -(list_bounding.y - (pos.y - 100))
            } else if (list_bounding.y + list_bounding.height < pos.y + 100) {
                //Bottom Screen
                this.scroll_delta = -(
                    list_bounding.y +
                    list_bounding.height -
                    (pos.y + 100)
                )
            } else {
                this.scroll_delta = 0
            }

            e.preventDefault()
        } else {
            this.scroll_delta = 0
        }
    }

    private auto_scroll() {
        this.$refs.listScroll.scrollTop += this.scroll_delta * 0.25
        if (this.stopScroll) {
            window.requestAnimationFrame(this.auto_scroll)
        }
    }

    private on_move_end() {
        //console.log("END? :(");
    }

    private scroll(e: any) {
        this.$emit('scroll', e)
        //console.log('LOAD MORE?')
        const scrollTop = e.target.scrollTop
        if (this.loadBottomOffset > 0) {
            const scrollHeight = e.target.scrollHeight
            const scrollBottom = e.target.scrollTop + e.target.clientHeight
            if (
                this.loadBottomOffset > 0 &&
                !this.data_requested &&
                !this.data_completed &&
                scrollBottom > scrollHeight - this.loadBottomOffset
            ) {
                this.data_requested = true
                this.$emit('load-more', this.loading_done)
            }
        }
        if (this.refresh && this.$refs.pullRequest) {
            if (scrollTop <= 0) {
                if (!this.on_top) {
                    this.on_top = true
                    this.pull_swipe.pull_activate = true
                    this.pull_swipe.swipeStartReset()
                }
            } else {
                this.on_top = false
                this.pull_swipe.pull_activate = false
            }
        }
    }

    private update_data() {
        //console.log("Update Data");
    }
}
</script>

<style lang="scss">
.list-wrapper {
    height: 100%;
    max-height: var(--app-height, 100vh);
    display: flex;
    flex-direction: column;
    .list-top-loading {
        --height: 0px;
        --max-height: 100px;
        --value: calc(var(--height) / var(--max-height));
        min-height: var(--height);
        max-height: var(--height);
        width: 100%;
        overflow: hidden;
        pointer-events: none;
        display: flex;
        justify-content: center;
        align-items: center;

        border-bottom-left-radius: var(--border-radius);
        border-bottom-right-radius: var(--border-radius);
        flex-direction: column;
        margin: 0 auto;
        position: relative;
        border: 2px solid var(--color-primary-lime);
        margin-bottom: calc(var(--padding-tiny) * var(--value));
        padding-top: calc(2px * var(--value));

        &::before {
            content: '';
            position: absolute;
            bottom: 0;
            height: 2px;
            background: var(--gradient-success);
            transform: scaleX(0);
            left: 0;
            right: 0;
            transition: transform 0.2s;
        }

        .refresh-icon {
            transform: rotate(180deg);
            box-sizing: border-box;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: var(--padding-small);
            transition: background $theme-duration, transform 0.2s;
            border-radius: 99px;
            position: relative;
            z-index: 0;

            svg {
                box-sizing: border-box;
                width: 48px;
                height: 48px;
                padding: var(--padding-small);
            }

            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: var(--color-primary-light-gray);
                z-index: -1;
                border-radius: 50%;
            }
            &::after {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: var(--gradient-success);
                z-index: -2;
                border-radius: 50%;
                opacity: 0;
                transition: opacity 0.2s;
            }
        }
        .refresh-text {
            padding-top: 0.25em;
            padding-bottom: var(--padding-tiny);
        }

        &.pulled-enough {
            .refresh-icon {
                transform: rotate(0deg);
                path {
                    fill: url(#gradient-success);
                }

                &::after {
                    opacity: 1;
                }
            }

            &::before {
                transform: scaleX(1);
            }
        }

        &.pulled-completed {
            .refresh-icon {
                transform: rotate(0deg);
                path {
                    fill: url(#gradient-success);
                }

                &::after {
                    opacity: 1;
                }
            }
        }
    }

    .pull-request-desktop {
        display: none;
        @include no-touchscreen {
            display: block;
            width: 100%;
            background: var(--gradient-success);
            min-height: 2px;
            transition: margin-bottom 0.2s, opacity 0.2s;
            position: relative;
            margin-bottom: calc(var(--padding-small) + var(--padding-micro));
            opacity: 0;

            .pull-request-desktop-button {
                position: absolute;
                z-index: 2;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                height: var(--padding-small);
                transition: height 0.2s;

                .button-wrapper {
                    cursor: pointer;
                    height: var(--padding-small);
                    transition: height 0.2s;
                    transform: translateZ(0);
                    --border-top-left-radius: 0;
                    --border-top-right-radius: 0;

                    .button-icon {
                        transition: opacity 0.2s;
                        opacity: 0;
                    }
                }
            }

            &.active {
                opacity: 1;
                &:hover {
                    margin-bottom: calc(
                        var(--padding-normal) + var(--padding-tiny) +
                            var(--padding-micro)
                    );
                    .pull-request-desktop-button {
                        height: 32px;
                        .button-wrapper {
                            height: 32px;

                            .button-icon {
                                opacity: 1;
                            }
                        }
                    }
                }
            }
        }
    }

    .list-scroll {
        overflow-y: auto;
        max-height: 100%;

        &.stop-scroll {
            //touch-action: none;
            //pointer-events: none;
        }
        .list-bottom-loading {
            display: flex;
            justify-content: center;
            padding: var(--padding-tiny) 0;
        }
    }
}
</style>
