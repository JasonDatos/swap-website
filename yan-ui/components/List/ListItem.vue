<template>
    <div
        class="list-item-wrapper"
        :class="{ 'card small': hasCard, 'is-hoverable': hoverable }"
    >
        <div class="list-item-content">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'

class Props {
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
}

@Options({
    components: {},
})
export default class Button extends Vue.with(Props) {}
</script>

<style lang="scss">
.list-item-wrapper {
    --list-item-height: var(--list-chunk-item-forced-height, 100%);
    --list-item-margin-bottom: 8px;
    margin-bottom: var(--list-item-margin-bottom);
    .list-item-content {
        max-height: var(--list-item-height);
        height: var(--list-item-height);
        min-height: var(--list-item-height);
    }
}
</style>
