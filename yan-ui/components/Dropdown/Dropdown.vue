<template>
    <div
        class="dropdown"
        @focusout="close_dropdown(true)"
        :class="[vertical, horizontal, vertical_auto, horizontal_auto]"
        tabindex="0"
    >
        <div
            class="dropdown-trigger"
            :class="[{ 'dropdown-trigger-active': show }, appendClass]"
            @click.stop="toggle"
        >
            <template v-if="$slots.trigger">
                <slot :show="show" name="trigger"></slot>
            </template>
            <template v-else>
                <Button
                    :type="type"
                    :icon="!!text ? icon : 'angle-down'"
                    :dropdown="!!text"
                    :square="!text"
                    :state="show ? 'active' : ''"
                >
                    {{ text }}
                </Button>
            </template>
        </div>
        <div v-if="initialized">
            <Teleport
                :to="teleport ? teleport : '#teleport-popup'"
                :disabled="!teleport"
            >
                <div
                    class="dropdown-content"
                    ref="dropdownContent"
                    :class="[
                        {
                            'dropdown-content-active': show,
                            'dropdown-teleport': !!teleport,
                        },
                        vertical,
                        horizontal,
                        vertical_auto,
                        horizontal_auto,
                    ]"
                >
                    <DropdownCard :visible="show" @click="close_dropdown">
                        <template v-if="$slots.default">
                            <slot></slot>
                        </template>
                        <template v-else>
                            <template
                                v-for="(item, $index) in data"
                                :key="item.key"
                            >
                                <DropdownItem
                                    :index="$index"
                                    @mousedown="selected(item, $index)"
                                    >{{ item.value }}</DropdownItem
                                >
                            </template>
                        </template>
                    </DropdownCard>
                </div>
            </Teleport>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'
import Button from '../Button.vue'
import DropdownCard from './DropdownCard.vue'
import DropdownItem from './DropdownItem.vue'

class Props {
    text = prop({
        type: String,
        required: false,
        default: '',
    })

    type = prop({
        type: String,
        required: false,
        default: 'is-success',
    })

    data = prop({
        type: Array,
        required: false,
        default: null,
    })

    icon = prop({
        type: String,
        required: false,
        default: '',
    })

    appendClass = prop({
        type: String,
        required: false,
        default: '',
    })

    origin = prop({
        type: String,
        required: false,
        default: '50% 0%',
    })
    vertical = prop({
        type: String,
        required: false,
        default: 'bottom',
    })
    horizontal = prop({
        type: String,
        required: false,
        default: 'left',
    })

    teleport = prop({
        type: String,
        required: false,
        default: '',
    })
}

@Options({
    name: 'dropdown',
    components: {
        Button,
        DropdownCard,
        DropdownItem,
    },
})
export default class Dropdown extends Vue.with(Props) {
    private show: boolean = false
    private initialized: boolean = false

    private vertical_auto: string = ''
    private horizontal_auto: string = ''
    private timeout: any = null

    private toggle() {
        if (!this.initialized && !this.show) {
            this.initialized = true
            this.$nextTick(() => {
                //@ts-ignore
                this.$refs.dropdownContent.style.setProperty(
                    '--dropdown-content-origin',
                    this.origin,
                )
                this.toggle()
            })
            return
        }
        this.show = !this.show
        if (this.show) {
            clearTimeout(this.timeout)
            const rect = this.$el.getBoundingClientRect()
            const dropdownEl: HTMLElement = this.$refs
                .dropdownContent as HTMLElement
            if (!dropdownEl) {
                return
            }
            const rect_dropdown = dropdownEl.getBoundingClientRect().toJSON()
            const viewport_width =
                window.innerWidth || document.documentElement.clientWidth
            const viewport_height =
                window.innerHeight || document.documentElement.clientHeight

            /*
          If dropdown-content needs to be on absolute position / forced to be in front,
          then use this method to re-position the dropdown on absolute position.

          This is useful when the dropdown is behind of elements.
        */
            if (this.teleport) {
                dropdownEl.style.setProperty('--dropdown-x', rect.x + 'px')
                dropdownEl.style.setProperty('--dropdown-y', rect.y + 'px')
                dropdownEl.style.setProperty(
                    '--dropdown-width',
                    rect.width + 'px',
                )
                dropdownEl.style.setProperty(
                    '--dropdown-height',
                    rect.height + 'px',
                )

                if (this.horizontal.includes('right')) {
                    rect_dropdown.left = rect_dropdown.x =
                        rect.x - rect_dropdown.width
                } else {
                    rect_dropdown.left = rect_dropdown.x = rect.x
                }

                if (this.vertical.includes('bottom')) {
                    rect_dropdown.top = rect_dropdown.y =
                        rect.y - rect_dropdown.height
                } else {
                    rect_dropdown.top = rect_dropdown.y = rect.y
                }
            }

            /*
          Responsible to avoid dropdown content being outside of the viewport

          Example:
          If set to auto-left = means preferred is left, but auto-align it if needed
          If only auto = default to preferred right / bottom
        */
            if (this.horizontal.includes('auto')) {
                const preferred_horizontal = this.horizontal.split('-')[1]

                if (rect_dropdown.left + rect_dropdown.width > viewport_width) {
                    this.horizontal_auto = 'right'
                } else if (rect_dropdown.left <= 0) {
                    this.horizontal_auto = 'left'
                } else {
                    this.horizontal_auto = preferred_horizontal || 'left'
                }
            }

            if (this.vertical.includes('auto')) {
                const preferred_vertical = this.vertical.split('-')[1]
                if (
                    rect_dropdown.top + rect_dropdown.height >
                    viewport_height
                ) {
                    this.vertical_auto = 'top'
                } else if (rect_dropdown.top <= 0) {
                    this.vertical_auto = 'bottom'
                } else {
                    this.vertical_auto = preferred_vertical || 'bottom'
                }
            }
        } else {
            this.close_dropdown()
            this.timeout = setTimeout(() => {
                this.initialized = false
            }, 500)
        }
    }

    private selected(item: any[], index: number) {
        this.$emit('selected', {
            ...item,
            index,
        })
        this.toggle()
    }

    private close_dropdown() {
        this.show = false
    }

    mounted() {
        //
    }
}
</script>

<style lang="scss">
.dropdown {
    --dropdown-x: 0px;
    --dropdown-y: 0px;
    --dropdown-width: 0px;
    --dropdown-height: 0px;
    display: inline-flex;
    position: relative;
    outline: none;

    .dropdown-trigger {
        display: flex;
        .button-wrapper {
            margin-bottom: 0;
        }
    }

    &.top {
        .dropdown-trigger {
            &.dropdown-trigger-active {
                .button-wrapper {
                    --border-top-left-radius: 0;
                    --border-top-right-radius: 0;
                }
            }
        }
        .dropdown-content {
            bottom: 100%;

            .dropdown-card-content {
                border-bottom-left-radius: 0px;
                border-bottom-right-radius: 0px;
                &::before {
                    top: initial;
                    bottom: 0;
                }
            }
        }
    }

    &.bottom {
        .dropdown-trigger {
            &.dropdown-trigger-active {
                .button-wrapper {
                    --border-bottom-left-radius: 0;
                    --border-bottom-right-radius: 0;
                }
            }
        }

        .dropdown-content {
            top: 100%;

            .dropdown-card-content {
                border-top-left-radius: 0px;
                border-top-right-radius: 0px;
                &::before {
                    top: 0;
                    bottom: initial;
                }
            }
        }
    }

    &.left {
        .dropdown-content {
            left: 0;
        }
    }

    &.right {
        .dropdown-content {
            right: 0;
        }
    }
}

.dropdown-content {
    --dropdown-content-origin: 50% 0%;
    position: absolute;
    padding-top: 0;
    z-index: 10;
    pointer-events: none;
    width: max-content;

    &.dropdown-teleport {
        position: absolute;
        top: var(--dropdown-y);
        left: var(--dropdown-x);

        &.left {
            &.top {
                transform: translate(0, -100%);
                .dropdown-card-content {
                    border-bottom-left-radius: 0px;
                    border-bottom-right-radius: 0px;
                    &::before {
                        top: initial;
                        bottom: 0;
                    }
                }
            }
            &.bottom {
                transform: translate(0, var(--dropdown-height));
                .dropdown-card-content {
                    border-top-left-radius: 0px;
                    border-top-right-radius: 0px;
                    &::before {
                        bottom: initial;
                        top: 0;
                    }
                }
            }
        }

        &.right {
            &.top {
                transform: translate(
                    calc(-100% + var(--dropdown-width)),
                    -100%
                );
                .dropdown-card-content {
                    border-bottom-left-radius: 0px;
                    border-bottom-right-radius: 0px;
                    &::before {
                        top: initial;
                        bottom: 0;
                    }
                }
            }
            &.bottom {
                transform: translate(
                    calc(-100% + var(--dropdown-width)),
                    var(--dropdown-height)
                );
                .dropdown-card-content {
                    border-top-left-radius: 0px;
                    border-top-right-radius: 0px;
                    &::before {
                        bottom: initial;
                        top: 0;
                    }
                }
            }
        }
    }

    &.dropdown-content-active {
        pointer-events: all;
    }

    .dropdown-card-wrapper {
        padding-top: 0;

        .dropdown-card-arrow {
            display: none;
        }
        .dropdown-card-content {
            overflow: hidden;
            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 2px;
                right: 0;
                background: var(--gradient-success);
            }
            padding: 0; // var(--padding-tiny);
            padding-top: 2px;
            background: var(--color-primary-white);
            transform-origin: var(--dropdown-content-origin) !important;

            .dropdown-item {
                min-width: max-content;
            }
        }
    }
}
</style>
