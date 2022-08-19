<template>
    <div
        ref="tab"
        class="tab-item"
        :class="{ active, hide }"
        @transitionstart="transitionstart"
        @transitionend="transitionend"
        @click="click"
    >
        <slot v-if="element_visible"></slot>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'

class Props {
    title = prop({
        type: String,
        required: true,
        default: '',
    })

    to = prop({
        type: String,
        required: false,
        default: '',
    })

    external = prop({
        type: Boolean,
        required: false,
        default: false,
    })
}

@Options({
    name: 'TabItem',
})
export default class TabItem extends Vue.with(Props) {
    private active = false
    private hide = true
    private element_visible: boolean = true

    created() {
        this.$watch('$parent.selectedIndex', (val: any) => {
            this.active = this.title === val
            this.manage_visibility()
        })
    }

    private once = false
    private manage_visibility() {
        if (!this.once) {
            this.once = true
            this.hide = !this.active
        }

        //@ts-ignore
        if (!this.$parent.useShow) {
            if (this.active) {
                this.element_visible = true
            } else {
                setTimeout(() => {
                    this.element_visible = false
                }, 210)
            }
        }
    }

    private transitionend() {
        this.hide = !this.active
    }
}
</script>

<style lang="scss" scoped>
.tab-item {
    grid-column: 1;
    grid-row: 1;
    transition: opacity 0.2s 0s;
    pointer-events: none;
    opacity: 0;
    &.active {
        @include desktop {
            transition: opacity 0.2s 0.2s;
        }
        opacity: 1;
        pointer-events: all;
        max-height: 100% !important;
    }

    &.hide {
        visibility: none;
        max-height: 0;
        pointer-events: none;
    }
}
</style>
