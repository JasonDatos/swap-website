<template>
    <div class="slider" :class="{ 'no-slider': !hasSlider }">
        <div class="slider-bar" v-if="$slots.title || $slots.action">
            <!-- File Name & Additional Options-->
            <div class="slider-title" v-if="$slots.title">
                <slot name="title"></slot>
            </div>
            <div class="slider-action" v-if="$slots.action">
                <slot name="action"></slot>
            </div>
        </div>

        <transition
            :name="last_dir"
            mode="out-in"
            @after-enter="reset_animation"
        >
            <div class="slider-content" :key="id">
                <div class="slider-element">
                    <slot></slot>
                </div>
            </div>
        </transition>
        <div class="slider-pagination" v-if="hasSlider">
            <!-- Slider pagination button on left & right-->
            <div
                class="slider-button slider-left-button"
                :class="{ 'show-slider': slideLeft }"
            >
                <Button
                    type="is-success"
                    :square="true"
                    size="is-large"
                    @click="slide('left')"
                >
                    <fa :icon="['fal', 'chevron-left']"></fa>
                </Button>
            </div>
            <div
                class="slider-button slider-right-button"
                :class="{ 'show-slider': slideRight }"
            >
                <Button
                    type="is-success"
                    :square="true"
                    size="is-large"
                    @click="slide('right')"
                >
                    <fa :icon="['fal', 'chevron-right']"></fa>
                </Button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { nanoid } from 'nanoid'
import { Options, Vue, prop } from 'vue-class-component'
import Button from './Button.vue'

class Props {
    id = prop({
        type: String,
        required: true,
        default: '',
    })
    slideLeft = prop({
        type: Boolean,
        default: false,
        required: false,
    })
    slideRight = prop({
        type: Boolean,
        default: false,
        required: false,
    })

    active = prop({
        type: Boolean,
        default: false,
        required: false,
    })

    hasSlider = prop({
        type: Boolean,
        default: true,
        required: false,
    })
}

@Options({
    components: {
        Button,
    },
})
export default class Slider extends Vue.with(Props) {
    private last_dir: any = null

    created() {
        this.$watch('active', () => {
            this.last_dir = null
        })
    }

    private random_id() {
        return nanoid(10)
    }

    private slide(direction: string) {
        this.last_dir = 'slide-' + direction
        this.$emit('slide', direction)
    }

    private reset_animation() {
        this.last_dir = null
    }
}
</script>

<style lang="scss">
.slider {
    --bar-height: 64px;

    position: relative;
    display: flex;
    flex-direction: column;
    height: var(--app-height, 100vh);
    width: 100vw;
    pointer-events: none;

    .slider-bar {
        box-sizing: border-box;
        height: var(--bar-height);
        background: var(--color-primary-white);
        color: var(--color-primary-black);
        padding: var(--padding-tiny) var(--padding-large);
        @include mobile {
            padding: var(--padding-tiny);
        }
        display: flex;
        align-items: center;
        position: relative;
        width: 100%;
        max-width: 100%;
        transform-origin: 50% 0;
        top: calc(var(--bar-height) * -1);
        transition: top 0.2s;
        box-sizing: border-box;

        &::before {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            height: 2px;
            background: var(--gradient-success);
        }

        .slider-title {
            box-sizing: border-box;
            display: flex;
            align-items: center;
            @include mobile {
                max-width: 50%;
            }
        }

        .slider-action {
            box-sizing: border-box;
            display: flex;
            align-items: center;
            margin-left: auto;

            .button-wrapper {
                margin-bottom: 0;
            }
        }
    }

    .slider-content {
        max-height: 100%;
        height: 100%;
        width: 100%;
        min-width: 0;
        min-height: 0;
        pointer-events: none;

        .slider-element {
            transition: transform 0.2s, opacity 0.2s;
            transform: scale(0.8);
            opacity: 0;

            box-sizing: border-box;
            width: 100%;
            height: 100%;
            padding: var(--padding-normal) calc(64px + var(--padding-tiny));
            display: block;
            text-align: center;
            position: relative;
            --padding-horizontal: calc(64px + var(--padding-normal));
            --padding-vertical: var(--padding-normal);

            @include mobile {
                --padding-horizontal: calc(64px + var(--padding-tiny));
                --padding-vertical: var(--padding-normal);
            }

            & > * {
                position: absolute;
                top: var(--padding-vertical);
                left: var(--padding-horizontal);
                width: calc(100% - var(--padding-horizontal) * 2);
                height: calc(100% - var(--padding-vertical) * 2);
                * {
                    pointer-events: none;
                }
            }
        }
    }

    &.no-slider {
        .slider-content {
            .slider-element {
                padding: var(--padding-normal);

                & > * {
                    position: absolute;
                    top: var(--padding-normal);
                    left: var(--padding-normal);
                    width: calc(100% - var(--padding-normal) * 2);
                    height: calc(100% - var(--padding-normal) * 2);
                    * {
                        pointer-events: none;
                    }
                }
            }
        }
    }
    .slider-pagination {
        .slider-button {
            position: absolute;
            top: calc(50% + var(--bar-height) * 0.5);
            transform: translateY(-50%) scale(0.25);

            .button-wrapper {
                margin-bottom: 0;
            }
            &.slider-left-button {
                left: -64px;
                transition: left 0.2s, transform 0.2s;
            }
            &.slider-right-button {
                right: -64px;
                transition: right 0.2s, transform 0.2s;
            }
        }
    }

    .slider-zoom {
    }
}

.modal-wrapper.active.is-slider {
    .modal-content {
        pointer-events: none;
        .modal-inner-content {
            pointer-events: none;
            .slider {
                .slider-bar {
                    pointer-events: all;
                    top: 0;
                }
                .slider-button {
                    pointer-events: none;

                    &.show-slider {
                        pointer-events: all;
                        transform: translateY(-50%) scale(1);
                        &.slider-left-button {
                            left: var(--padding-normal);
                        }
                        &.slider-right-button {
                            right: var(--padding-normal);
                        }
                        @include mobile {
                            &.slider-left-button {
                                left: var(--padding-tiny);
                            }
                            &.slider-right-button {
                                right: var(--padding-tiny);
                            }
                        }
                    }

                    .button-wrapper {
                        box-shadow: var(--box-shadow);
                    }
                }

                .slider-content {
                    .slider-element {
                        transform: scale(1);
                        opacity: 1;
                        & > * {
                            * {
                                pointer-events: initial;
                            }
                        }
                    }
                }
            }
        }
    }
}
</style>
