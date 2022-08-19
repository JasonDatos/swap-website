<template>
    <div class="breadcrumb">
        <div
            class="breadcrumb-dropdown"
            v-if="hidden_index >= 0"
            ref="breadcrumbDropdown"
        >
            <Dropdown origin="16px 0px" :append-class="appendDropdownClass">
                <template #trigger="prop">
                    <Button
                        type="is-success"
                        icon="angle-down"
                        :square="true"
                        size="is-small"
                        :state="prop.show ? 'active' : ''"
                    ></Button>
                </template>
                <div class="">
                    <template
                        v-for="(item, $index) in data
                            .slice(0, hidden_index + 1)
                            .reverse()"
                        :key="$index"
                    >
                        <DropdownItem
                            @click="breadcrumb_item_click(item, $index)"
                            :class="appendClass"
                            v-bind="get_attributes(item)"
                        >
                            <span
                                class="breadcrumb-dropwdown-item-icon"
                                v-if="item.icon"
                            >
                                <fa-icon :icon="['fal', item.icon]"></fa-icon>
                            </span>
                            <span class="breadcrumb-dropwdown-item-text">{{
                                item.text
                            }}</span>
                        </DropdownItem>
                    </template>
                </div>
            </Dropdown>
            <div class="breadcrumb-arrow">
                <fa-icon :icon="['fal', 'angle-right']"></fa-icon>
            </div>
        </div>
        <div
            class="breadcrumb-items"
            ref="breadcrumbItems"
            :class="{ 'breadcrumb-overflow': overflow_breadcrumb }"
        >
            <template v-for="(item, $index) in data" :key="$index">
                <div
                    class="breadcrumb-inner"
                    :class="[
                        {
                            hidden: $index <= hidden_index,
                        },
                        $index == data.length - 1
                            ? appendActiveClass
                            : appendClass,
                    ]"
                    :data-index="$index"
                    v-bind="get_attributes(item)"
                >
                    <div
                        class="breadcrumb-item"
                        @click="breadcrumb_item_click(item, $index)"
                    >
                        <span class="breadcrumb-item-icon" v-if="item.icon">
                            <fa-icon :icon="['fal', item.icon]"></fa-icon>
                        </span>
                        <span class="breadcrumb-item-text">{{
                            item.text
                        }}</span>
                    </div>
                    <div class="breadcrumb-arrow">
                        <fa-icon :icon="['fal', 'angle-right']"></fa-icon>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'
import ResizeObserver from 'resize-observer-polyfill'
import Button from './Button.vue'
import Dropdown from './Dropdown/Dropdown.vue'
import DropdownItem from './Dropdown/DropdownItem.vue'

import { BreadcrumbItem } from '../type/types'

class Props {
    data = prop({
        type: Array,
        required: true,
    })

    appendActiveClass = prop({
        type: String,
        required: false,
        default: '',
    })

    appendClass = prop({
        type: String,
        required: false,
        default: '',
    })

    appendDropdownClass = prop({
        type: String,
        required: false,
        default: '',
    })

    attribute = prop({
        type: Object,
        required: false,
        default: {},
    })
}

@Options({
    components: {
        Button,
        Dropdown,
        DropdownItem,
    },
})
export default class Breadcrumb extends Vue.with(Props) {
    private resizeObserver?: ResizeObserver
    private hidden_index: number = -1
    private overflow_breadcrumb: boolean = false
    private dropdown_activate: boolean = false

    mounted() {
        this.resizeObserver = new ResizeObserver(this.breadcrumb_resize)
        this.resizeObserver.observe(this.$el)

        this.update_data()
        this.$watch('data', this.update_data)
    }

    beforeUnmount() {
        this.resizeObserver?.disconnect()
    }

    private get_attributes(data: any) {
        const keys = Object.keys(this.attribute)
        const attr: any = {}
        for (let i = 0; i < keys.length; i++) {
            const key: string = keys[i]
            const value: string = this.attribute[key]
            if (data[value]) {
                attr[key] = data[value]
            }
        }
        return attr
    }

    private update_data() {
        this.$nextTick(() => {
            this.breadcrumb_resize([
                {
                    contentRect: this.$el.getBoundingClientRect(),
                },
            ])
        })
    }

    private breadcrumb_item_click(item: BreadcrumbItem, $index: number) {
        if (item.link) {
            //this.$router.push(item.link);
            this.$emit('item-click', { ...item, $index })
        } else {
            this.$emit('item-click', { ...item, $index })
        }
    }

    private breadcrumb_resize(
        entries: ResizeObserverEntry[] | any[],
        observer: ResizeObserver | null = null,
    ) {
        const entry = entries ? entries[0] : this.$el
        const breadcrumb_width = entry.contentRect.width
        this.hidden_index = -1
        //@ts-ignore // TypeScript config needs to be fixed yet
        const elements = this.$refs.breadcrumbItems.children

        let elements_width = 1

        const breadcrumbDropdown: HTMLElement | any =
            this.$refs.breadcrumbDropdown
        if (breadcrumbDropdown) {
            elements_width += breadcrumbDropdown.getBoundingClientRect().width
        }

        for (let i = elements.length - 1; i >= 0; i--) {
            const el = elements[i]
            const { width } = el.getBoundingClientRect()
            const index = el.getAttribute('data-index')

            if (elements_width + width > breadcrumb_width) {
                this.hidden_index = Number(index)
                if (this.hidden_index >= this.data.length - 1) {
                    //It's already last item - so force text ellipses it
                    this.hidden_index -= 1
                    this.overflow_breadcrumb = true
                } else {
                    this.overflow_breadcrumb = false
                }
                break
            } else {
                elements_width += width
            }
        }
    }
}
</script>

<style lang="scss">
.breadcrumb {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    position: relative;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1 0 auto;

    .breadcrumb-dropdown {
        display: flex;
        align-items: center;

        .button-wrapper {
            margin-bottom: 0;
            margin-right: var(--padding-tiny);
        }

        .breadcrumb-arrow {
            margin-right: var(--padding-micro);
        }

        .breadcrumb-dropwdown-item-icon {
            margin-right: var(--padding-tiny);
        }
    }

    .breadcrumb-items {
        display: flex;
        align-items: center;
        max-width: 100%;

        .breadcrumb-inner {
            display: flex;
            align-items: center;

            &.hidden {
                position: absolute;
                left: 0;
                opacity: 0;
                pointer-events: none;
            }

            .breadcrumb-item {
                min-width: 0;
                transition: background $theme-duration, transform 0.2s ease-out,
                    filter 0.2s;
                padding: 0 var(--padding-small);
                height: 32px;
                border-radius: var(--border-radius);
                cursor: pointer;
                display: flex;
                align-items: center;
                background: var(--color-transparent-white);

                &:active {
                    filter: brightness(0.75);
                }

                &:hover {
                    background: var(--color-primary-light-gray);
                }

                .breadcrumb-item-icon {
                    padding-right: var(--padding-tiny);
                }

                .breadcrumb-item-text {
                    display: inline-block;
                    min-width: 0;
                    align-items: center;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    width: 100%;
                }
            }

            .breadcrumb-arrow {
                margin: 0 var(--padding-micro);
            }
            &:last-child {
                .breadcrumb-arrow {
                    display: none;
                    max-width: 0;
                }
                .breadcrumb-item {
                    background: var(--gradient-success);
                    color: var(--color-white);
                    cursor: default;
                    margin-left: var(--padding-micro);
                    filter: none;
                }

                &:first-child {
                    .breadcrumb-item {
                        margin-left: 0;
                    }
                }
            }
        }

        &.breadcrumb-overflow {
            min-width: 0;

            .breadcrumb-inner {
                min-width: 0;
            }
        }
    }
}
</style>
