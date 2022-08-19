<template>
    <Teleport to="#teleport-toast">
        <div
            class="toast-wrapper"
            :class="[{ active: active }, direction, type, hide]"
        >
            <div class="toast-content">
                <slot></slot>
            </div>
        </div>
    </Teleport>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'
import Button from '@/yan-ui/components/Button.vue'
import ModalDialogCard from '@/yan-ui/components/Modal/ModalDialogCard.vue'

class Props {
    direction = prop({
        type: String,
        default: 'top',
        required: false,
    })
    duration = prop({
        type: Number,
        default: 5000,
        required: false,
    })
    type = prop({
        type: String,
        default: '',
        required: false,
    })
}

@Options({
    name: 'Toast',
    components: {
        Button,
        ModalDialogCard,
    },
})
export default class Modal extends Vue.with(Props) {
    private active: boolean = false

    mounted() {
        setTimeout(() => {
            this.close()
        }, this.duration)

        setTimeout(() => {
            this.active = true
        }, 1)
    }

    close() {
        this.active = false
        setTimeout(() => {
            this.$event.emit('close')
        }, 1300)
    }
}
</script>

<style lang="scss">
.toast-wrapper {
    position: absolute;
    left: 50%;
    z-index: 100000000000000;
    max-width: 300px;
    padding-left: var(--padding-small);
    padding-right: var(--padding-small);
    transition: transform 0.75s, opacity 0.25s 0.25s;
    transform: translate(-50%, -100%);
    opacity: 0;
    text-align: center;
    &.top {
        top: 0;
        &.active {
            transform: translate(-50%, var(--padding-normal));
            opacity: 1;
        }
    }

    &.bottom {
        bottom: 0;
        &.active {
            transform: translate(-50%, var(--padding-normal));
            opacity: 1;
        }
    }

    .toast-content {
        padding: var(--padding-small) var(--padding-normal);
        border-radius: var(--border-radius);
        color: var(--color-primary-black);
        background: var(--color-primary-light-gray);
        box-shadow: var(--box-shadow);
        transition: color $theme-duration, background $theme-duration;
        white-space: pre-wrap;
    }

    &.is-success {
        .toast-content {
            color: var(--color-white);
            background: var(--gradient-success);
        }
    }
    &.is-warning {
        .toast-content {
            color: var(--color-white);
            background: var(--gradient-warning);
        }
    }
    &.is-danger {
        .toast-content {
            color: var(--color-white);
            background: var(--gradient-danger);
        }
    }
}
</style>
