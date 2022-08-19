<template>
    <div class="dropdown-card-wrapper" :class="{ visible }">
        <div
            class="dropdown-card-arrow"
            :style="{ left: `calc(${pointX} - 16px)` }"
        ></div>
        <div
            class="dropdown-card-content card shadow"
            :style="{ 'transform-origin': pointX + ' 0%' }"
        >
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'

class Props {
    visible = prop({
        type: Boolean,
        required: false,
        default: true,
    })

    pointX = prop({
        type: String,
        required: false,
        default: '50%',
    })
}

@Options({
    components: {},
})
export default class DropdownCard extends Vue.with(Props) {
    created() {
        //
    }
}
</script>

<style lang="scss">
.dropdown-card-wrapper {
    padding-top: 12px;
    position: relative;
    pointer-events: none;

    .dropdown-card-arrow {
        position: absolute;
        top: 10px;
        width: 12px;
        height: 12px;
        z-index: 1;
        left: 50%;
        transform: rotate(45deg) translateX(-50%) scale(0);
        transition: background $theme-duration, transform 0.2s;
        background: var(--color-primary-light-gray);
    }

    .dropdown-card-content {
        transform: scale(0);
        transition: transform 0.2s, background $theme-duration;
    }

    transition: transform 0.2s, opacity 0.2s;
    transform-origin: 50% 0%;
    opacity: 0;

    &.visible {
        opacity: 1;
        pointer-events: all;

        .dropdown-card-arrow {
            transform: rotate(45deg) translateX(-50%) scale(1);
        }
        .dropdown-card-content {
            transform: scale(1);
        }
    }
}
</style>
