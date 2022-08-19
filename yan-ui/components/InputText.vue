<template>
    <div class="input-component">
        <div class="input-title" v-if="title">{{ title }}</div>
        <div
            class="input-view"
            @focusout="blur"
            @click="focusin"
            tabindex="-1"
            :class="{ 'content-open': content_visible(), focus, invalid }"
        >
            <div class="input-wrapper" @keyup.enter="onEnter">
                <Button
                    v-if="icon || textIcon"
                    class="input-icon"
                    :square="true"
                    :spacing="false"
                    size="is-small"
                    type="is-white"
                    :no-hover="!iconClickable"
                    @click="iconClickable ? onEnter($event) : () => {}"
                    :tabindex="-1"
                >
                    <template v-if="textIcon">
                        {{ textIcon }}
                    </template>
                    <template v-else-if="icon">
                        <fa-icon v-if="icon" :icon="['fal', icon]" fixed-width></fa-icon>
                    </template>
                </Button>

                <div class="input-group">
                    <input
                        :value="get_value"
                        :step="step"
                        min="0"
                        :readonly="read_only"
                        @input="typed($event.target.value)"
                        @change="typed($event.target.value)"
                        :type="password_visible ? 'text' : type"
                        @focus="settings_visible = false;"
                        class="input-field"
                        autocorrect="off"
                        autocapitalize="none"
                        autocomplete="off"
                    />
                    <div
                        v-if="placeholder"
                        class="input-placeholder"
                        :class="{ hide: get_value }"
                    >
                        {{ placeholder }}
                    </div>
                </div>

                <div class="input-tool-right" v-if="!read_only">
                    <Button
                        :square="true"
                        :spacing="false"
                        size="is-small"
                        type="is-gray"
                        class="input-cross input-icon-right"
                        :class="{ hide: !get_value }"
                        @click="clear_value"
                        :tabindex="-1"
                    >
                        <fa-icon :icon="['fal', 'times']" fixed-width></fa-icon>
                    </Button>
                    <Button
                        :square="true"
                        :spacing="false"
                        size="is-small"
                        type="is-gray"
                        class="input-settings input-icon-right"
                        id="prevent-focus"
                        v-if="$slots.settings"
                        :class="{ active: settings_visible }"
                        @click="settings_visible = !settings_visible"
                        :tabindex="-1"
                    >
                        <fa-icon :icon="['fal', 'sliders-h']" fixed-width></fa-icon>
                    </Button>
                    <Button
                        :square="true"
                        :spacing="false"
                        size="is-small"
                        type="is-gray"
                        v-if="type == 'password'"
                        @click="password_visible = !password_visible"
                        class="input-password input-icon-right"
                        :tabindex="-1"
                    >
                        <fa-icon
                            v-if="password_visible"
                            :icon="['fal', 'eye-slash']"
                            fixed-width
                        ></fa-icon>
                        <fa-icon v-else :icon="['fal', 'eye']" fixed-width></fa-icon>
                    </Button>
                </div>
            </div>

            <div class="input-content">
                <div class="input-settings-slot">
                    <DropdownCard
                        :visible="!!$slots.settings && settings_visible"
                        point-x="calc(100% - var(--padding-small) - var(--padding-nano))"
                    >
                        <slot name="settings"></slot>
                    </DropdownCard>
                </div>
                <div class="input-dropdown-slot card small">
                    <slot></slot>
                </div>
            </div>
        </div>
        <div
            class="input-rules error-check"
            v-if="error && error.message && error_message"
        >
            <div
                class="input-rule invalid"
                :class="{
                    shakeX: reshake_invalid,
                }"
            >
                <div class="input-rule-match-state">
                    <transition name="scale" mode="out-in">
                        <fa-icon
                            class="failure-icon"
                            :icon="['fal', 'times-square']"
                        ></fa-icon>
                    </transition>
                </div>
                <div class="input-rule-description-text">
                    {{ error_message }}
                </div>
            </div>
        </div>

        <div class="input-rules" v-if="rules && rules.length > 0">
            <div
                v-for="(rule, $index) in rules"
                :key="rule.description"
                class="input-rule"
                :class="{
                    success: rule_match(rule.rule),
                    invalid: invalid_rules[$index],
                    shakeX: invalid_rules[$index] && reshake_invalid,
                }"
            >
                <div class="input-rule-match-state">
                    <transition name="scale" mode="out-in">
                        <fa-icon
                            class="success-icon"
                            v-if="rule_match(rule.rule)"
                            :icon="['fal', 'check-square']"
                        ></fa-icon>
                        <fa-icon
                            class="failure-icon"
                            v-else-if="invalid_rules[$index]"
                            :icon="['fal', 'times-square']"
                        ></fa-icon>
                        <fa-icon
                            class="neutral-icon"
                            v-else
                            :icon="['fas', 'square']"
                        ></fa-icon>
                    </transition>
                </div>
                <div class="input-rule-description-text">
                    {{ rule.description }}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'

import DropdownCard from '@/yan-ui/components/Dropdown/DropdownCard.vue' // @ is an alias to /src
import Button from '@/yan-ui/components/Button.vue'

class Props {
    icon = prop({
        type: String,
        required: false,
        default: 'text',
    })

    textIcon = prop({
        type: String,
        required: false,
        default: '',
    })

    step = prop({
        type: String,
        required: false,
        default: "0.00000001"
    })

    read_only = prop({
        type: Boolean,
        required: false,
        default: false,
    })

    iconClickable = prop({
        type: Boolean,
        required: false,
        default: false,
    })

    title = prop({
        type: String,
        required: false,
        default: '',
    })

    placeholder = prop({
        type: String,
        required: false,
        default: '',
    })

    modelValue = prop({
        required: true,
    })

    type = prop({
        type: String,
        required: false,
        default: 'text',
    })

    rules = prop({
        type: Array as () => Array<any> | any,
        required: false,
        default: () => [],
    })

    required = prop({
        type: Boolean,
        required: false,
        default: false,
    })

    spacing = prop({
        type: Boolean,
        default: true,
        required: false,
    })

    error = prop({
        type: Object,
        default: () => ({}),
        required: false,
    })
    property = prop({
        type: String,
        default: '',
        required: false,
    })
}

@Options({
    components: {
        DropdownCard,
        Button,
    },
})
export default class InputText extends Vue.with(Props) {
    private password_visible = false
    private settings_visible = false
    private invalid_rules: boolean[] = []
    private focus = false
    public invalid = false
    private reshake_invalid = false

    private clear_value() {
        this.$emit('update:modelValue', '')
    }

    created() {
        if (this.property) {
            this.$watch('error', () => {
                if (this.error_message) {
                    this.invalid = true
                    this.reshake_invalid = true
                    setTimeout(() => {
                        this.reshake_invalid = false
                    }, 1200)
                } else {
                    this.invalid = false
                }
            })
        }
    }

    get error_message() {
        if (this.error.message) {
            let msg = []
            if (!Array.isArray(this.error.message)) {
                msg = [this.error.message]
            } else {
                msg = this.error.message
            }
            console.log("MSG", msg, typeof msg);
            return msg
                .filter((o: any) => o.property === this.property)
                .map((o: any) => o.message)[0]
        } else {
            return null;
        }
    }

    get get_value() {
        if (typeof this.modelValue == 'function') {
            return this.modelValue()
        } else {
            return this.modelValue
        }
    }

    private typed(new_value) {
        this.$emit('update:modelValue', new_value)
    }

    private onEnter() {
        this.$emit('submit')
    }

    private blur(event: any) {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            this.settings_visible = false
            this.focus = false
        }
        //this.settings_visible = false
    }

    private focusin(event: any) {
        if (event.target.id === 'prevent-focus') {
            this.focus = false
        } else {
            this.focus = true
        }
    }

    private content_visible() {
        return !!this.$slots.default && !this.settings_visible
    }

    private rule_match(rule: RegExp) {
        if (typeof this.modelValue == 'function') {
            return this.modelValue()?.match(rule)
        } else if (typeof this.modelValue == 'string') {
            return this.modelValue.match(rule)
        }
    }

    public validate() {
        this.invalid_rules = []
        this.invalid = false
        this.reshake_invalid = true

        for (let i = 0; i < this.rules.length; i++) {
            if (!this.rule_match(this.rules[i].rule)) {
                this.invalid_rules.push(true)
                this.invalid = true
            } else {
                this.invalid_rules.push(false)
            }
        }

        setTimeout(() => {
            this.reshake_invalid = false
        }, 1200)

        return this.invalid_rules.every((o) => !o)
    }

    public clear_validate() {
        this.invalid_rules = []
        this.invalid = false
        this.reshake_invalid = false
    }
}
</script>

<style lang="scss">
.input-component {
    width: 100%;
    padding-top: 2px;
    padding-bottom: 2px;

    .input-title {
        color: var(--color-primary-black);
        padding-bottom: var(--padding-tiny);
    }

    .input-view {
        position: relative;
        display: flex;

        .input-wrapper {
            transition: background $theme-duration,
                border-bottom-left-radius $theme-duration,
                border-bottom-right-radius $theme-duration;

            display: flex;
            justify-content: space-between;
            position: relative;
            align-items: center;
            font-size: 20px;
            min-height: 100%;
            width: 100%;
            background: var(--color-primary-white);
            border-radius: var(--border-radius);
            max-width: 100%;
            z-index: 0;

            .input-group {
                position: relative;
                display: flex;
                flex: 1;
                height: 100%;
                width: 100%;

                .input-field {
                    width: 100%;
                    height: 100%;
                    background: none;
                    outline: none;
                    border: none;
                    font-size: 16px;
                    overflow: visible;
                    transition: color $theme-duration;
                    color: var(--color-primary-black);
                }

                .input-placeholder {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    display: flex;
                    align-items: center;
                    font-size: 16px;
                    pointer-events: none;
                    transition: opacity 0.2s, color $theme-duration;
                    color: var(--color-primary-dark-gray);

                    &.hide {
                        opacity: 0;
                    }
                }

                &:focus-within {
                    .input-placeholder {
                        opacity: 0;
                    }
                }
            }

            .input-icon {
                display: flex;
                align-items: center;
                margin: var(--padding-tiny);
                text-align: center;
            }

            .input-tool-right {
                display: flex;
                align-items: center;
                padding: 0 var(--padding-small);
                padding-left: 0;
                .input-icon-right {
                    margin-left: var(--padding-micro);

                    &:first-child {
                        margin-left: 0;
                    }
                }

                .input-cross {
                    transition: opacity 0.2s;
                    &.hide {
                        opacity: 0;
                        pointer-events: none;
                    }
                }

                .input-settings {
                }
            }
        }

        overflow: visible;

        .input-content {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            width: 100%;
            font-size: 16px;
            z-index: 10;
            pointer-events: none;
            max-height: 0;

            .input-settings-slot {
                position: absolute;
                right: 0;
                top: 0px;
                width: 50%;
                max-height: 0;
                overflow: visible;
            }

            .input-dropdown-slot {
                transition: border-top $theme-duration,
                    border-top-left-radius $theme-duration,
                    border-top-right-radius $theme-duration,
                    opacity $theme-duration, transform 0.2s;

                border-top-left-radius: 0px !important;
                border-top-right-radius: 0px !important;
                border-top: 1px solid var(--color-primary-gray);
                transform-origin: 50% 0%;
                transform: scaleY(0);
                opacity: 0;
                pointer-events: none;
            }
        }

        @include mobile {
            .input-icon {
                display: flex;
                align-items: center;
                padding: var(--padding-micro);
            }
        }

        &.content-open {
            &.focus {
                .input-wrapper {
                    border-bottom-left-radius: 0px;
                    border-bottom-right-radius: 0px;
                }
                .input-content {
                    pointer-events: all;
                }
                .input-dropdown-slot {
                    opacity: 1;
                    transform: scaleY(1);
                    pointer-events: all;
                }
            }
        }

        &::before {
            position: absolute;
            top: -2px;
            bottom: -2px;
            left: -2px;
            right: -2px;
            background: var(--gradient-danger);
            content: '';
            z-index: 0;
            border-radius: calc(var(--border-radius) + 2px);
            opacity: 0;
            transition: opacity 0.2s;
        }

        &.invalid {
            &::before {
                opacity: 1;
            }
        }
    }

    .input-rules {
        padding: var(--padding-small) 0px;
        &.error-check {
            padding-bottom: 0;
        }
        .input-rule {
            display: flex;
            align-items: center;
            padding: 1px 0px;

            .input-rule-match-state {
                padding-right: var(--padding-small);
                font-size: 24px;
                position: relative;

                .success-icon {
                    path {
                        fill: url(#gradient-success);
                    }
                }

                .neutral-icon {
                    transition: color $theme-duration;
                    color: var(--color-primary-light-gray);
                }

                .failure-icon {
                    path {
                        fill: url(#gradient-danger);
                    }
                }
            }

            .input-rule-description-text {
                display: block;
                color: var(--color-primary-black);
            }
            transition: background-image 0.2s;

            &.success {
                background-image: var(--gradient-success) !important;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;

                .input-rule-description-text {
                    background-image: var(--gradient-success) !important;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            }

            &.invalid {
                background-image: var(--gradient-danger);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;

                .input-rule-description-text {
                    background-image: var(--gradient-danger);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            }
        }
    }
}
</style>
