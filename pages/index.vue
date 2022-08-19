<template>
  <div class="page-main">
    <MainTitle></MainTitle>
    <!--MenuWrapper></MenuWrapper-->
    <div class="wallet-selector">
    <div>I use&nbsp;&nbsp;</div>
    <Dropdown origin="50% 0px">
      <template #trigger="prop">
          <Button
              type="is-success"
              :dropdown="true"
              dropdown-icon="angle-down"
              :state="prop.show ? 'active' : ''"
          >{{wallet_type_current.name}}</Button>
      </template>
      <Dropdown-Item v-for="type in wallet_types" :key="type.id" @click="choose_wallet(type)" :style="{background: wallet_type_current.id === type.id ? 'var(--color-primary-gray)' : null}">
        {{type.name}}
      </Dropdown-Item>
    </Dropdown>
    <div>&nbsp;&nbsp;as wallet.</div>
    </div>
    <br>
    
    <!--           -->
    <!--  yanSAFE  -->
    <!--           -->
    <template v-if="wallet_type_current.id === 'yansafe'">
      <div class="card">
        <h2>Requirements</h2>
        <ul>
          <li>yanSAFE v2.1.5</li>
        </ul>
      </div>
      <br>
      <div class="card">
        <h2>Step 1</h2>
        Update yanSAFE to v2.1.5 by opening the yanSAFE and auto update it or <a href="https://pacprotocol.com/network-product/yansafe" target="_blank">Download the latest version of yanSAFE in the website</a> and install it.
      </div>
      <br>
      <div class="card">
        <h2>Step 2</h2>
        Open yanSAFE, let it sync until its done and then click on Swap Process and continue the steps in yanSAFE
      </div>
    </template>

    <!--            -->
    <!--   PACapp   -->
    <!--            -->
    <template v-if="wallet_type_current.id === 'pacapp'">
      <div class="card">
        <h2>Requirements</h2>
        <ul>
          <li>PACapp v1.1.6</li>
        </ul>
      </div>
      <br>
      <div class="card">
        <h2>Step 1</h2>
        Update PACapp to v1.1.6 from App Store or Play Store.
      </div>
      <br>
      <div class="card">
        <h2>Step 2</h2>
        Open PACapp and click "Swap $PAC to new blockchain"
      </div>
    </template>

    <!--                        -->
    <!--   Legacy Wallet (QT)   -->
    <!--                        -->
    <template v-if="wallet_type_current.id === 'legacy-wallet'">
      <div class="card">
        <h2>Requirements</h2>
        <ul>
          <li>Legacy Desktop Wallet (old blockchain)</li>
          <li>yanSAFE (new blockchain)</li>
        </ul>
      </div>
      <br>
      <div class="card">
        <h2>Step 1</h2>
        Open yanSAFE and let it fully sync it. (Applying Bootstrap might help to sync quicker)
      </div>
      <br>
      <div class="card">
        <h2>Step 2</h2>
        Go to "Receive" and generate a new address called "Swap" (it can be any name) and enter this address here to generate swap address for old $PAC address
        <br><br>
        <div class="toolbar is-centered">
          <InputText
            v-model="new_pac_address" 
            type="is-white"
            icon="location"
            placeholder="PCSwapAddressGoesHerevyfft3e82UfjT"
            @input="generate_address"
            :error="!new_pac_address_valid && new_pac_address != '' ? { message: { message: 'Invalid Address', property: '' } } : null"
          ></InputText>
        </div>
      </div>
      <br>
        <div class="card" :class="{'invalid': !new_pac_address_valid}" data-step="2">
          <h2>Step 3</h2>
          Enter how much $PAC you want to swap it from old blockchain to new blockchain.
          <br>
          It needs to be minimum 1 $PAC.
          <br><br>
          <div class="toolbar is-centered">
            <InputText
              v-model="swap_pac_amount"
              icon="coin"
              placeholder="1500.00005001"
              @input="generate_address"
            ></InputText>
          </div>
          <br>
          <div style="text-align: center; font-size: 1.4em">{{swap_pac_amount ? formatBalance(swap_pac_amount) : 0}} $PAC will be swapped over.</div>
        </div>
        <br>
        <div class="card" :class="{'invalid': !new_pac_address_valid || Number(swap_pac_amount) < 1}" data-step="3">
          <h2>Step 4</h2>
          In Legacy Wallet - go to Debug Log
        </div>
        <br>
        <div class="card" :class="{'invalid': !new_pac_address_valid || Number(swap_pac_amount) < 1}" data-step="3">
          <h2>Step 5</h2>
          Copy & paste this into the Debug log:
          <br><br>
          <textarea :readonly="true" style="width: 100%">sendmany "" "{\"{{first_swap_address}}\": {{(Number(swap_pac_amount) - 1).toString()}}, \"{{second_swap_address}}\": 1}"</textarea>
        </div>
        <br>
        <div class="card" :class="{'invalid': !new_pac_address_valid || Number(swap_pac_amount) < 1}" data-step="3">
          <h2>Step 6</h2>
          Now you're done. It can up to X hours to appear the $PAC in new blockchain at yanSAFE side.
        </div>
    </template>

    <!--            -->
    <!--   Daemon   -->
    <!--            -->
  </div>
</template>

<script setup lang="ts">
import {Utils} from '@/assets/scripts/utils'
import Button from "@/yan-ui/components/Button.vue"
import InputText from "../yan-ui/components/InputText.vue"
import base58 from 'b58';
import jsSHA from "jssha";

import Dropdown from "@/yan-ui/components/Dropdown/Dropdown.vue"
import DropdownItem from "@/yan-ui/components/Dropdown/DropdownItem.vue"

import crossaddr from "@/class/crossaddr";
import axios from 'axios';

let wallet_types = [
  {
    id: "yansafe",
    name: "yanSAFE"
  },
  {
    id: "pacapp",
    name: "PACapp"
  },
  {
    id: "legacy-wallet",
    name: "Legacy Wallet (QT)"
  },
  {
    id: "daemon",
    name: "Daemon"
  }
];
let wallet_type_current = ref(wallet_types[0]);

let new_pac_address_valid = ref(false);
let new_pac_address = ref("")
let swap_pac_amount = ref("0")
let first_swap_address = ref("");
let second_swap_address = ref("");
let entry: any = reactive({});
const { $yanui } = useNuxtApp()

definePageMeta({
  layout: "main"
})

onMounted(async () => {
  const [first_address, second_address] = await crossaddr("PTLz7PaUiSx4AHbk5F1UaiBZg5FmFctWDP");
  if (first_address === "PFuvCVsqgkfdoybd9Axf9rHmWYyegCfmuA" && second_address === "PEzKZ9tpWoARDJJuzFN7vwY46ZRrDDsgwN") {
    console.log("EQUAL!!!!");
  } else {
    console.error("NOT EQUAL");
    console.error("FIRST:", first_address, "!= PFuvCVsqgkfdoybd9Axf9rHmWYyegCfmuA");
    console.error("SECOND:", second_address, "!= PEzKZ9tpWoARDJJuzFN7vwY46ZRrDDsgwN");
  }

  const route = useRoute();
  if (route.query.wallet) {
    for (let i = 0; i < wallet_types.length; i++){
      if (wallet_types[i].id === route.query.wallet) {
        wallet_type_current.value = wallet_types[i]
      }
    }
  }
})

watch([new_pac_address], () => {
  console.log("???");
  new_pac_address_valid.value = validateAddress(new_pac_address.value);
});

const router = useRouter();

const choose_wallet = (type) => {
  wallet_type_current.value = type;
  router.push({
    query: {
      wallet: type.id
    }
  })
}

const toggle_theme = () => {
    if ($yanui?.theme.value == 'light') {
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

let generate_address_timeout = null;
const generate_address = () => {
  if (generate_address_timeout) {
    clearTimeout(generate_address_timeout);
  }
  generate_address_timeout = setTimeout(async () => {
    const result = await axios.get(`https://utils.pacprotocol.com/swap-api?mergeaddress=${new_pac_address.value}&version=37`);
    const [first_address, second_address] =  result.data;
    first_swap_address.value = first_address
    second_swap_address.value = second_address
    console.log("FIRST ADDRESS", first_address);
    console.log("SECOND ADDRESS", second_address);
  }, 100)

  //first_swap_address.value =  "PFuvCVsqgkfdoybd9Axf9rHmW6WQWsrvas" //first_address;
  //second_swap_address.value = "PEzKZ9tpWoARDJJuzFN7vwY47H6187emG8" //second_address;
}

const formatBalance = (x, options: any = {  maximumFractionDigits: 8 }) => {
  if (Number(Number(x).toFixed(8)) == 0) {
    x = 0;
  }
  return new Intl.NumberFormat("en-US", options).format(Number(x));
}

const handlePACAmount = (e: any) => {
  if (e.inputType == "deleteContentBackward") {
    return;
  }
  swap_pac_amount.value = parseFloat(e.target.value).toFixed(8);
}

  const numberToHex = (number: number) => {
    let hex = Math.round(number).toString(16);
    if (hex.length === 1) {
      hex = "0" + hex;
    }
    return hex;
  }

  const toHex = (arrayOfBytes: number[]) => {
    let hex = "";
    for (let i = 0; i < arrayOfBytes.length; i++) {
      hex += numberToHex(arrayOfBytes[i]);
    }
    return hex;
  }

  const sha256 = (hexString: string) => {
    const sha = new jsSHA("SHA-256", "HEX");
    sha.update(hexString);
    return sha.getHash("HEX");
  }

const validateAddress = (address: string) => {
    let decoded: any;
    try {
      decoded = base58.decode(address);
    } catch (e) {
      // if decoding fails, assume invalid address
      return null;
    }

    const length = decoded.length;

    // should be 25 bytes per pac address spec
    if (length !== 25) {
      return null;
    }

    const checksum = toHex(decoded.slice(length - 4, length));
    const body = toHex(decoded.slice(0, length - 4));
    const goodChecksum = sha256(sha256(body))
      .substr(0, 8);

    return (
      ["37","0a"].indexOf(
        checksum === goodChecksum ? toHex(decoded.slice(0, 1)) : ""
      ) >= 0
    );
}

</script>w


<style lang="scss" scoped>

.page-main{
  //padding-top: calc(50vh - 237px);

  .wallet-selector{
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.toolbar-link {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  margin-bottom: var(--padding-small);  
  
  .button-wrapper{
      margin-bottom: 0;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .button-wrapper{
    margin-bottom: 0;
    margin-left: 0.5em;
  }
}

.invalid{
  user-select: none;
  position: relative;
  overflow: hidden;
  &::after{
    content: "Please complete Step " attr(data-step) " first";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(3px);
    background: var(--color-black-transparent);
    color: var(--color-white);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2em;
  }
}

</style>