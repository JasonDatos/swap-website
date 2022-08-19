<template>
    <form @keydown.enter.prevent="form_submitted" class="form-wrapper">
        <slot></slot>
    </form>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'

class Props {}

@Options({
    components: {},
})
export default class Form extends Vue.with(Props) {
    private form_submitted() {
        console.log('he')
        this.$emit('submit')
    }
}
</script>

<style lang="scss">
.form-wrapper {
    & > * {
        box-sizing: border-box;
        margin-bottom: var(--padding-small);

        &:first-child {
            padding-top: 0;
            margin-top: 0;
        }
        &:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
        }
    }
}
</style>
