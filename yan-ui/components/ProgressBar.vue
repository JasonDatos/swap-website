<template>
    <div
        class="progress-bar"
        :class="[type, { slim, 'darker-bg': darkerBackground }]"
    >
        <div class="progress-bar-chart">
            <div class="progress-bar-background"></div>
            <div class="progress-bar-frontground"></div>
        </div>
        <div class="progress-bar-text">
            {{ text }}
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'

class Props {
    slim = prop({
        type: Boolean,
        default: false,
        required: false,
    })
    darkerBackground = prop({
        type: Boolean,
        default: false,
        required: false,
    })

    value = prop({
        type: Number,
        default: -1, // -1 = Loading, >=0 = Progress
        required: false,
    })
    text = prop({
        type: String,
        default: '',
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
export default class ProgressBar extends Vue.with(Props) {
    mounted() {
        if (this.value >= 0) {
            this.$el.style.setProperty('--progress-value', this.value)
            this.$watch('value', () => {
                this.$el.style.setProperty('--progress-value', this.value)
            })
        }
    }
}
</script>

<style lang="scss">
.progress-bar {
    --progress-value: 0;
    min-height: 10px;
    height: 10px;
    width: 100%;
    &.slim {
        height: 4px;
    }

    .progress-bar-chart {
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: var(--border-radius);
        position: relative;

        .progress-bar-background {
            width: 100%;
            height: 100%;
            background: var(--color-primary-light-gray);
        }
        .progress-bar-frontground {
            position: absolute;
            top: 0;
            width: calc(100% * var(--progress-value));
            height: 100%;
            background: var(--gradient-success);
            border-radius: var(--border-radius);
            transition: width 0.2s;
        }
    }

    &.is-danger {
        .progress-bar-frontground {
            background: var(--gradient-danger);
        }
    }
    &.is-warning {
        .progress-bar-frontground {
            background: var(--gradient-warning);
        }
    }

    &.darker-bg {
        .progress-bar-chart {
            .progress-bar-background {
                background: var(--color-primary-gray);
            }
        }
    }
}
</style>
