<template>
    <Teleport to="#teleport-popup">
        <div
            class="modal-wrapper"
            :class="[
                {
                    active: is_active(),
                    hide,
                    resizable,
                    'enable-modal-inner': modalInner,
                    'has-animation': hasAnimation,
                },
                appendClass,
            ]"
        >
            <div
                class="modal-background"
                @click="close_check($event, canCancelBackground)"
            ></div>
            <div
                class="modal-content"
                :style="{
                    minWidth: modalInner ? minWidth : null,
                    width,
                }"
            >
                <div class="modal-close" v-if="canCancel">
                    <Button
                        icon="times"
                        :square="true"
                        size="is-small"
                        type="is-danger"
                        @click="close_check($event, false)"
                    ></Button>
                </div>
                <div
                    v-if="!$slots.title && !$slots.footer && component"
                    :class="{
                        'card is-modal modal-inner-content': hasCard,
                        spacing,
                    }"
                >
                    <component
                        class="card-content card-item"
                        :style="{ overflow }"
                        v-bind="props"
                        v-on="events ? events : {}"
                        :is="component"
                        :can-cancel="canCancel"
                        :can-cancel-background="canCancelBackground"
                        @close="close"
                    >
                    </component>
                </div>
                <ModalDialogCard
                    v-else-if="hasCard"
                    class="modal-inner-content"
                    :spacing="spacing"
                    :overflow="overflow"
                    :type="type"
                >
                    <template #title v-if="$slots.title">
                        <slot name="title"></slot>
                    </template>
                    <template #default v-if="$slots.default">
                        <component
                            v-if="component"
                            class="card-content card-item"
                            v-bind="props"
                            v-on="events ? events : {}"
                            :is="component"
                            :can-cancel="canCancel"
                            :can-cancel-background="canCancelBackground"
                            @close="close"
                        >
                        </component>
                        <slot v-else></slot>
                    </template>
                    <template #footer v-if="$slots.footer || footer_buttons">
                        <template v-if="$slots.footer">
                            <slot name="footer"></slot>
                        </template>
                        <template
                            v-else-if="
                                footer_buttons && footer_buttons.length > 0
                            "
                        >
                            <Button
                                v-for="button in footer_buttons"
                                :key="button.text"
                                :type="button.type"
                                :width="button.width"
                                @click="button.action(this, $events)"
                            >
                                {{ button.text }}
                            </Button>
                        </template>
                    </template>
                </ModalDialogCard>
                <div v-else class="modal-inner-content" :style="{ overflow }">
                    <slot name="title"></slot>
                    <slot></slot>
                    <slot name="footer"></slot>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'
import Button from '@/yan-ui/components/Button.vue'
import ModalDialogCard from '@/yan-ui/components/Modal/ModalDialogCard.vue'

class Props {
    portalTarget = prop({
        type: String,
        default: 'teleport-popup',
        required: false,
    })
    hasCard = prop({
        type: Boolean,
        default: true,
        required: false,
    })

    overflow = prop({
        type: String,
        default: 'visible',
        required: false,
    })

    modalInner = prop({
        type: Boolean,
        default: true,
        required: false,
    })

    appendClass = prop({
        type: String,
        default: '',
        required: false,
    })

    active = prop({
        type: Boolean,
        default: false,
        required: false,
    })

    canCancel = prop({
        type: Boolean,
        default: true,
        required: false,
    })
    canCancelBackground = prop({
        type: Boolean,
        default: true,
        required: false,
    })
    hasAnimation = prop({
        type: Boolean,
        default: true,
        required: false,
    })

    programmatic = prop({
        type: Boolean,
        default: false,
        required: false,
    })

    spacing = prop({
        type: Boolean,
        default: true,
        required: false,
    })

    component = prop({
        type: [Object, Function],
        default: null,
        required: false,
    })

    props = prop({
        type: Object,
        default: null,
        required: false,
    })

    events = prop({
        type: Object,
        default: null,
        required: false,
    })

    footer_buttons = prop({
        type: Object,
        default: null,
        required: false,
    })

    type = prop({
        type: String,
        default: 'is-success',
        required: false,
    })

    minWidth = prop({
        type: String,
        default: '300px',
        required: false,
    })

    width = prop({
        type: String,
        default: '',
        required: false,
    })

    resizable = prop({
        type: Boolean,
        required: false,
        default: false,
    })

    should_warn_close = prop({
        type: Boolean,
        required: false,
        default: false,
    })
}

@Options({
    name: 'Modal',
    components: {
        Button,
        ModalDialogCard,
    },
    emits: ['close', 'warn-close'],
})
export default class Modal extends Vue.with(Props) {
    public hide: boolean = false

    private active_programmatic: boolean = false
    private timeout: any = -1

    mounted() {
        if (this.programmatic) {
            setTimeout(() => {
                this.open()
            }, 1)
        }
    }

    beforeUnmount() {
        clearTimeout(this.timeout)
    }

    created() {
        this.$watch('active', () => {
            if (this.active) {
                this.hide = false
            }
        })
    }

    public is_active() {
        if (this.programmatic) {
            return this.active_programmatic
        } else {
            return this.active
        }
    }

    public open() {
        this.hide = false
        if (this.programmatic) {
            this.active_programmatic = true
            this.$event.emit('open')
        } else {
            this.$emit('update:active', true)
        }
    }

    public close_check(event: any | null = null, force = true) {
        if (this.should_warn_close) {
            if (this.programmatic) {
                this.$event.emit('warn-close', (confirm: boolean = true) => {
                    console.log('??', confirm)
                    if (confirm) {
                        this.close(event, force)
                    }
                })
            } else {
                this.$emit('warn-close', (confirm: boolean = true) => {
                    console.log('??', confirm)
                    if (confirm) {
                        this.close(event, force)
                    }
                })
            }
        } else {
            this.close(event, force)
        }
    }

    public close(event: any | null = null, force = true) {
        if (this.canCancel || force) {
            if (this.programmatic) {
                this.active_programmatic = false
                this.timeout = setTimeout(() => {
                    this.$event.emit('close')
                }, 250)
            } else {
                this.$emit('update:active', false)
                this.$emit('close')
                this.timeout = setTimeout(() => {
                    if (!this.active) {
                        this.hide = true
                    }
                }, 250)
            }
        }
    }
}
</script>

<style lang="scss">
.modal-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    &.hide {
        position: absolute;
        visibility: none;
        max-height: 0;
        opacity: 0;
    }

    .modal-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.35);
        -webkit-backdrop-filter: blur(5px);
        backdrop-filter: blur(5px);

        opacity: 0;
        transition: opacity 0.2s;
    }

    .modal-content {
        transition: opacity 0.2s, transform 0.2s;
    }

    &.has-animation {
        .modal-content {
            transform: scale(0.8);
            opacity: 0;
        }
    }

    &.resizable {
        @include desktop {
            .modal-inner-content {
                display: flex;
                margin: 0 auto;
                resize: both;
                overflow: hidden;
                min-width: 350px;
                min-height: 350px;
                max-width: max-content;
            }
        }
        @include mobile {
            .modal-inner-content {
                width: 100% !important; //Sadly needed - resize will mess up the width because of style="width: XXX"
                min-width: calc(100vw - var(--padding-small) * 2);
                max-height: calc(
                    var(--app-height, 100vh) - var(--padding-small) * 2
                );
                overflow: hidden;
                height: calc(
                    var(--app-height, 100vh) - var(--padding-small) * 2
                );
            }
        }
    }

    .modal-close {
        position: absolute;
        top: 0;
        right: 0;
        transform: translate(25%, -25%);
        z-index: 100;
        .button-wrapper {
            margin-bottom: 0;
            box-shadow: var(--box-shadow);
        }
    }

    &.active {
        pointer-events: all;
        .modal-background {
            opacity: 1;
        }
        .modal-content {
            opacity: 1;
            transform: scale(1);
            pointer-events: all;
        }
    }

    &.enable-modal-inner {
        .modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            width: auto;
            height: auto;

            max-width: calc(100vw - var(--padding-normal) * 2);
            max-height: calc(
                var(--app-height, 100vh) - var(--padding-normal) * 2
            );
            @include mobile {
                min-width: 0 !important; // Ignore min-width at mobile for minWidth properties of this component
                width: max-content;
                max-width: calc(100vw - var(--padding-small) * 2);
                max-height: calc(
                    var(--app-height, 100vh) - var(--padding-small) * 2
                );
            }

            .modal-inner-content {
                max-width: calc(100vw - var(--padding-normal) * 2);
                max-height: calc(
                    var(--app-height, 100vh) - var(--padding-normal) * 2
                );
                overflow: hidden;

                @include mobile {
                    width: 100%;
                    max-width: calc(100vw - var(--padding-small) * 2);
                    max-height: calc(
                        var(--app-height, 100vh) - var(--padding-small) * 2
                    );
                }
            }
        }

        &.active {
            .modal-content {
                transform: translate(-50%, -50%) scale(1);
            }
        }
    }
}
</style>
