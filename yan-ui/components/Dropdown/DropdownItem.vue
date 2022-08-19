<template>
    <div class="dropdown-item">
        <Button
            :icon="icon"
            :type="type"
            :icon-fixed-width="true"
            :to="to"
            @mousedown="select"
        >
            <slot></slot>
        </Button>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'
import Button from './../Button.vue'

class Props {
    icon = prop({
        type: String,
        default: '',
        required: false,
    })

    type = prop({
        type: String,
        default: undefined,
        required: false,
    })

    to = prop({
        type: String,
        required: false,
    })
}

@Options({
    name: 'dropdown-item',
    components: {
        Button,
    },
})
export default class DropdownItem extends Vue.with(Props) {
    select() {
        let maxParent = 10
        let i = 0
        let parent: any = this.$parent
        while (i < maxParent) {
            if (parent.$options.name === 'dropdown') {
                parent.toggle()
                break
            }
            parent = parent.$parent
            i++
        }
        this.$emit('click')
    }
}
</script>

<style lang="scss">
.dropdown-item {
    position: relative;
    display: flex;
    flex-grow: 1;
    flex-shrink: 0;
    width: 100%;

    .button-wrapper {
        min-width: 100%;
        margin-bottom: 0;
        margin-right: 0 !important;

        .button-content {
            justify-content: flex-start;
        }
        --border-top-left-radius: 0;
        --border-top-right-radius: 0;
        --border-bottom-left-radius: 0;
        --border-bottom-right-radius: 0;
    }

    &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 2px;
        background: var(--gradient-success);
        z-index: 1;
    }
    padding-bottom: 2px;

    &:last-child {
        padding-bottom: 0;
        &::before {
            display: none;
        }
    }
}
</style>
