<template>
    <div class="card is-modal" :class="[type, { spacing }]">
        <div class="card-title card-item" v-if="$slots.title">
            <slot name="title"></slot>
        </div>
        <div
            class="card-content card-item"
            :class="{
                'with-top': $slots.title && !$slots.footer,
                'with-bottom': $slots.footer && !$slots.title,
                'with-both': $slots.title && $slots.footer,
            }"
            v-if="$slots.default"
            :style="{
                overflow,
            }"
        >
            <slot></slot>
        </div>
        <div class="card-footer card-item" v-if="$slots.footer">
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'

class Props {
    spacing = prop({
        type: Boolean,
        default: true,
        required: false,
    })

    overflow = prop({
        type: String,
        default: 'visible',
        required: false,
    })

    type = prop({
        type: String,
        default: '',
        required: false,
    })
}

@Options({
    components: {},
})
export default class Modal extends Vue.with(Props) {}
</script>
