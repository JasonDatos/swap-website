<template>
    <ModalDialogCard
        :spacing="spacing"
        :type="type"
        :overflow="overflow"
        :style="{ 'max-width': maxWidth, width: width }"
    >
        <template #title v-if="title">
            {{ title }}
        </template>
        <template #default v-if="content || components">
            <div class="dialog-content-wrapper" v-if="content">
                <div v-if="icon" class="dialog-icon" :class="[type]">
                    <fa :icon="['fal', icon]" size="3x" />
                </div>
                <div class="dialog-content">
                    {{ content }}
                </div>
            </div>
            <div class="dialog-components" v-if="components">
                <template v-for="component in components" :key="component.id">
                    <div class="dialog-component">
                        <component
                            v-bind:is="component.component"
                            v-bind="component.props"
                            v-on="component.events"
                        >
                        </component>
                    </div>
                </template>
            </div>
        </template>
        <template #footer v-if="buttons">
            <Button
                v-for="button in buttons"
                :key="button.text"
                :type="button.type"
                @click="button.action(this.$parent, $events)"
            >
                {{ button.text }}
            </Button>
        </template>
    </ModalDialogCard>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'
import Button from '@/yan-ui/components/Button.vue'
import ModalDialogCard from '@/yan-ui/components/Modal/ModalDialogCard.vue'

class Props {
    title = prop({
        type: String,
        required: false,
        default: '',
    })
    content = prop({
        type: String,
        required: false,
        default: '',
    })
    spacing = prop({
        type: Boolean,
        default: true,
        required: false,
    })
    maxWidth = prop({
        type: String,
        default: '100%',
        required: false,
    })
    width = prop({
        type: String,
        default: '100%',
        required: false,
    })
    overflow = prop({
        type: String,
        default: 'visible',
        required: false,
    })

    icon = prop({
        type: String,
        default: '',
        required: false,
    })
    type = prop({
        type: String,
        default: '',
        required: false,
    })
    buttons = prop({
        type: Object,
        default: null,
        required: false,
    })
    components = prop({
        type: Object,
        default: null,
        required: false,
    })
}

@Options({
    components: {
        ModalDialogCard,
        Button,
    },
})
export default class Modal extends Vue.with(Props) {}
</script>

<style lang="scss">
.dialog-content-wrapper {
    display: flex;
    align-items: center;
    .dialog-icon {
        padding-right: var(--padding-normal);

        &.is-danger {
            path {
                fill: url(#gradient-danger);
            }
        }

        &.is-warning {
            path {
                fill: url(#gradient-warning);
            }
        }

        &.is-success {
            path {
                fill: url(#gradient-success);
            }
        }
    }
    .dialog-content {
        flex-grow: 1;
        white-space: pre-wrap;
        word-wrap: break-word;
    }
}

.dialog-components {
    display: flex;
    flex-direction: column;
    padding-top: var(--padding-small);
    box-sizing: border-box;
    overflow: hidden;
    &:first-child {
        padding-top: 0;
    }
    .dialog-component {
        padding-top: var(--padding-small);
        &:first-child {
            padding-top: 0;
        }
    }
}
</style>
