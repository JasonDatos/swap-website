<template>
  <div class="main-layout">
    <div class="menu-wrapper ignoremobile">
        <div></div>
        <Button
            :square="true"
            :spacing="false"
            size="is-large"
            type="is-grey"
            @click="toggle_theme"
        >
            <transition name="scale" mode="out-in">
                <fa-icon
                    v-if="$yanui?.theme.value == 'light'"
                    :icon="['fal', 'moon']"
                ></fa-icon>
                <fa-icon
                    v-else-if="$yanui?.theme.value == 'dark'"
                    :icon="['fal', 'sun']"
                ></fa-icon>
            </transition>
        </Button>
    </div>

    <slot />

    <div class="footer">
        <div class="footer-link">
            <a href="https://pacprotocol.com/terms-conditions" target="_blank">Terms & Conditions</a>|
            <a href="https://pacprotocol.com/privacy-policy" target="_blank">Privacy Policy</a>
        </div>
        <div class="footer-link">
            © {{year}} PAC Protocol. All Rights Reserved.
        </div>
    </div>
  </div>
</template>


<script setup>
import { Utils } from "~~/assets/scripts/utils";
import Button from "@/yan-ui/components/Button.vue"; 

const last_updated_format = (time) => {
  if (time) {
    time = new Date(time).getTime() / 1000;
    return Utils.timeagoFormatOnlyHours(new Date(time), "");
  } else {
    return "-";
  }
}

let last_updated = ref("");
const year = ref(new Date().getFullYear());
const { $yanui } = useNuxtApp()
const toggle_theme = () => {
    if ($yanui.theme.value == 'light') {
      localStorage.setItem('theme', 'dark')
      document.documentElement.classList.add('theme-dark')
      document.documentElement.classList.remove('theme-light')
      $yanui.theme.value = 'dark'
  } else if ($yanui) {
      localStorage.setItem('theme', 'light')
      document.documentElement.classList.add('theme-light')
      document.documentElement.classList.remove('theme-dark')
      $yanui.theme.value = 'light'
  }
}

</script>

<style lang="scss">
    .main-layout{
        max-width: 768px;
        margin: 0 auto;
        box-sizing: border-box;
        padding: var(--padding-normal);

        @include mobile{
          padding: var(--padding-normal);
        }

        .menu-wrapper{
            padding-bottom: var(--padding-normal);
            .button-wrapper{
                margin-bottom: 0;
                display: flex;
                flex-direction: column;
                &:not(.square){
                    flex-grow: 1;
                }
            }

            display: flex;
            align-items: center;
            justify-content: space-between;

        }

        .footer{
            display: flex;
            align-items: center;
            flex-direction: column;
            padding-top: 3em;
            .footer-link{
                padding-top: 1em;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                a{
                    margin-left: var(--padding-small);
                    margin-right: var(--padding-small);
                }
            }
        }
    }
</style>