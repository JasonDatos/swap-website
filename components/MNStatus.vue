<template>
    <div class="entry-wrapper">
      <div class="entry-list">
        <div 
          v-for="(value, $key) in entry.value" 
          :key="$key" 
          class="entry card is-modal"
          :class="{}"
          >
          <div class="card-title card-item">
             <div 
               class="masternode-healthcheck"
               :class="{
                 'is-operational': is_operational(value),
                 'is-warning': is_warning(value),
                 'is-not-operational': is_not_operational(value)
               }"
             >
             </div>
            <div class="title-mn">
              <div>
                {{healthcheck_text(value)}}
              </div>
              <div>
                {{$key}}
              </div>
            </div>
          </div>
          <div class="card-content card-item">
            <div class="info-wrapper">
              <div class="info-line">
                <div class="info-item center">
                  <div class="info-label">
                    Version
                  </div>
                  <div class="info-value">
                    {{value.subversion ? value.subversion.split(":")[1].replace("/", "") : "-"}}
                  </div>
                </div>
                <div class="info-item center">
                <div class="info-label">
                  Block Height (Last Seen)
                </div>
                <div class="info-value">
                  {{value.node_height ? value.node_height : "-"}}
                </div>
                </div>
                <div class="info-item center">
                <div class="info-label">
                  Status
                </div>
                <div class="info-value">
                  {{value.has_status ? value.has_status : "-"}}
                </div>
                </div>
              </div>
              <div class="info-line">
                <div class="info-item center">
                    <div class="info-label">
                      PoSe Ban Height
                    </div>
                    <div class="info-value">
                      {{value.pose_ban_height ? value.pose_ban_height === -1 ? 0 : value.pose_ban_height : "-"}}
                    </div>
                </div>
                <div class="info-item center">
                    <div class="info-label">
                      PoSe Penalty
                    </div>
                    <div class="info-value">
                      {{value.pose_ban_penalty ? value.pose_ban_penalty === -1 ? 0 : value.pose_ban_penalty : "-"}}
                    </div>
                </div>
                <div class="info-item center">
                    <div class="info-label">
                      PoSe Revived
                    </div>
                    <div class="info-value">
                      {{value.pose_ban_revived ? value.pose_ban_revived === -1 ? 0 : value.pose_ban_revived : "-"}}
                    </div>
                </div>
              </div>
              <div class="info-line">
                <div class="info-item center">
                    <div class="info-label">
                      Created
                    </div>
                    <div class="info-value">
                      {{value.created ? createdAgo(value) : "-"}}
                    </div>
                </div>
                <div class="info-item center">
                    <div class="info-label">
                      Last Paid
                    </div>
                    <div class="info-value">
                      {{value.last_paid_block ? lastPaid(value) : "-"}}
                    </div>
                </div>
                <div class="info-item center">
                    <div class="info-label">
                      Next Payment
                    </div>
                    <div class="info-value">
                      {{value.next_payment_block ? nextPayment(value) : "-"}}
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import {Utils} from '@/assets/scripts/utils'
import Button from "@/yan-ui/components/Button.vue"
import InputText from "../yan-ui/components/InputText.vue"
import axios from "axios";

const props = defineProps({
  entry: {
    required: true
  }
});

let outdated_versions: any = reactive([]);
let blockcount: any = ref(-1)

const update_blockcount = ()=>{
    axios.get( "/api/blockcount").then(res=>{
        blockcount.value = Number(res.data);
    })
}

await update_blockcount();
onMounted(async ()=>{
  outdated_versions.value = await Utils.pull_outdated_masternode_version();
  setInterval(()=>{
      update_blockcount();
  }, 1000 * 60)
})


const outdated_masternode = (subversion: string) => {
    if (outdated_versions.length <= 0){
        return false;
    }
    return outdated_versions.value.find((o) => o.version == subversion);
}

const is_not_operational = (mn: any) => {
    return mn.status == 'enabled_error' || 
           mn.status == 'enabled_timeout' ||
           mn.status == 'enabled_unexpected_disconnect' ||
           mn.status == 'pose_banned' ||
           mn.error
}

const createdAgo = (mn: any) => {
  if (blockcount.value !== -1 && !mn.error && mn.created != null && mn.created !== "0") {
    let time = new Date().getTime() - ((blockcount.value - Number(mn.created)) * 2.5 * 1000 * 60);
    return Utils.timeagoFormatOnlyDays(new Date(time).getTime() / 1000, "");
  } else {
    return "-";
  }
}

const lastPaid = (mn: any) => {
  if (blockcount.value !== -1 && !mn.error && mn.last_paid_block != null && mn.last_paid_block !== "0") {
    let time = new Date().getTime() - ((blockcount.value - Number(mn.last_paid_block)) * 2.5 * 1000 * 60);
    return Utils.timeagoFormatOnlyDays(new Date(time).getTime() / 1000, "");
  } else {
    return "-";
  }
}

const nextPayment = (mn: any) => {
  if (blockcount.value !== -1 && !mn.error && mn.next_payment_block != null && mn.next_payment_block !== "0") {
    const futureEstimatedPayment = Math.ceil(
      Date.now() / 1000 +
        (Number(mn.next_payment_block) - blockcount.value) * 150
    );
    return Utils.timeagoFormatOnlyDays(futureEstimatedPayment, "");
  } else {
    return "-";
  }
  return "";
}


const is_operational = (mn: any) => {
    return mn.status == 'enabled_in_sync'
}

const is_warning = (mn: any) => {
    return mn.status == 'enabled_out_of_sync' || outdated_masternode(mn.subversion);
}

const healthcheck_text = (mn: any) => {
    if (mn.error_type){
        if (mn.error_type === "not_in_masternode_list"){
            return "Not Masternode / Not Recognized Yet";
        }
    }

    if (mn.subversion){
        if (outdated_masternode(mn.subversion)){
            return "Outdated Version";
        }
    }

    switch (mn.status){
        case 'enabled_in_sync':
            return 'Operational';

        case 'enabled_out_of_sync':
            return 'Out of Sync';
        
        case 'enabled_error':
        case 'enabled_timeout':
        case 'enabled_unexpected_disconnect':
            return 'Not Operational';

        case 'pose_banned':
            return 'Pose Banned';
    }
}

</script>


<style lang="scss">
.info-wrapper{
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;

  .info-line{
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 1em;
    &:last-child{
        margin-bottom: 0;
    }

    .info-item{
      width: 100%;
        &:first-child{
            width: 300px;
        }
        &:last-child{
            width: 300px;
        }

      &.full{
          width: 100% !important;
      }
      &.center{
        text-align: center;
      }
      .info-label{
        font-size: var(--font-size-small);
        color: var(--color-primary-dark-gray);
      }

      .info-value{
        font-size: 1.5em;
        color: var(--color-text-primary);
      }
    }
  }
}

@include mobile {
  .info-wrapper{
      flex-direction: column !important;
      .info-line{
          flex-direction: column !important;
          margin-bottom: 0;
          .info-item{
              margin-bottom: 1em;
              width: 100% !important;
          }
      }
  }
}

.entry{
  margin-bottom: 1.5em;
}

.title-mn{
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    width: 100%;
    
    div{
        display: block;
    }
}
</style>