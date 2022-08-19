<template>
    <div class="list-header" :class="{ 'has-content': !!$slots.default }">
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'

class Props {}

@Options({
    components: {},
})
export default class FileItems extends Vue.with(Props) {}
</script>

<style lang="scss">
.list-header {
    display: flex;
    border-bottom: var(--color-primary-light-gray);
    padding: 0 var(--padding-tiny);
    min-height: 35px;
    height: 35px;
    overflow: hidden;

    & > .list-header-item {
        display: flex;
    }
}
</style>
