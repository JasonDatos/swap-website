<template>
    <div
        class="list-header-item"
        :class="[
            'list-header-align-' + align,
            { sortable, 'has-content': !!$slots.default },
        ]"
    >
        <div class="list-header-item-padding">
            <slot></slot>
            <fa-icon v-if="sortable" :icon="['fal', 'angle-down']"></fa-icon>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'

class Props {
    sortable = prop({
        type: Boolean,
        default: false,
        required: false,
    })

    align = prop({
        type: String,
        default: 'left',
        required: false,
        validator: (value: string) =>
            ['left', 'center', 'right'].includes(value),
    })

    width = prop({
        default: '100%',
        required: false,
    })
}

@Options({
    components: {},
})
export default class ListHeaderItem extends Vue.with(Props) {
    mounted() {
        this.update_width()
        this.$watch('width', this.update_width)
    }

    private update_width() {
        if (this.width) {
            if (Array.isArray(this.width) && this.width.length > 0) {
                if (this.width[0]) {
                    this.$el.style.setProperty(
                        '--header-item-min-width',
                        this.width[0],
                    )
                }
                if (this.width[1]) {
                    this.$el.style.setProperty(
                        '--header-item-width',
                        this.width[1],
                    )
                }
                if (this.width[2]) {
                    this.$el.style.setProperty(
                        '--header-item-max-width',
                        this.width[2],
                    )
                }
            } else {
                this.$el.style.setProperty('--header-item-width', this.width)
            }
        }
    }
}
</script>

<style lang="scss">
.list-header-item {
    --header-item-width: 100%;
    display: flex;
    width: var(--header-item-width);
    min-width: var(--header-item-min-width, var(--header-item-width));
    max-width: var(--header-item-max-width, var(--header-item-width));
    align-items: center;

    svg {
        padding-left: var(--padding-tiny);
    }

    &.list-header-align-left {
        justify-content: flex-start;
    }

    &.list-header-align-center {
        justify-content: center;
    }

    &.list-header-align-right {
        justify-content: flex-end;
    }

    position: relative;
    left: calc(var(--padding-small) * -1);
    .list-header-item-padding {
        padding: var(--padding-tiny) var(--padding-small);
    }
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    background: var(--color-transparent-white);
    transition: background 0.2s;

    &.has-content {
        &.sortable {
            cursor: pointer;
        }

        &:hover {
            background: var(--color-primary-light-gray);
        }
    }
}
</style>
