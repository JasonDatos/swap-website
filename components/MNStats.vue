<template>
    <div class="mn-stats">
      <div class="entry-wrapper">
          <div class="info-wrapper">
            <div class="info-line">
              <div class="info-item center">
                <div class="info-label">
                  Operational
                </div>
                <div class="info-value">
                  <div class="masternode-healthcheck is-operational"></div>
                  {{operational_total}}
                </div>
              </div>
              <div class="info-item center">
              <div class="info-label"> 
                Warnings
              </div>
              <div class="info-value">
                  <div class="masternode-healthcheck is-warning"></div>
                  {{warning_total}}
              </div>
              </div>
              <div class="info-item center">
              <div class="info-label">
                Non-Operational
              </div>
              <div class="info-value">
                  <div class="masternode-healthcheck is-not-operational"></div>
                  {{non_operational_total}}
              </div>
              </div>
            </div>
          </div>
          <br>
      </div>
    </div>
</template>

<script setup lang="ts">
    import {Utils} from '@/assets/scripts/utils'
    import axios from "axios";

    const props = defineProps({
      entry: {
        required: true
      }
    });

    let operational_total = ref(0);
    let warning_total = ref(0);
    let non_operational_total = ref(0);

    let outdated_versions: any = reactive([]);
    let blockcount: any = ref(-1)

    const update_blockcount = ()=>{
        axios.get( "/api/blockcount").then(res=>{
            blockcount.value = Number(res.data);
        })
    }

    await update_blockcount();
    onMounted(async ()=>{
      update_counter();
      outdated_versions.value = await Utils.pull_outdated_masternode_version();
      console.log(outdated_versions);
      setInterval(()=>{
          update_blockcount();
      }, 1000 * 60)
    })

    watch([props.entry],
        (value: any[], valueBefore)=>{
            update_counter();
            console.log("????");
        }
    )

    const update_counter = ()=>{
        operational_total.value = 0;
        warning_total.value = 0;
        non_operational_total.value = 0;
        
        const entry: any = props.entry;
        const ips = Object.keys(entry.value);
        
        //@ts-ignore
        for(let i = 0; i < ips.length; i++){
            console.log("MN", entry.value[ips[i]]);
            if (is_operational(entry.value[ips[i]])){
                operational_total.value++;
            } else if (is_warning(entry.value[ips[i]])){
                warning_total.value++;
            } else if (is_not_operational(entry.value[ips[i]])) {
                non_operational_total.value++;
            }
        }
    }

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

    const is_operational = (mn: any) => {
        return mn.status == 'enabled_in_sync'
    }

    const is_warning = (mn: any) => {
        return mn.status == 'enabled_out_of_sync' || outdated_masternode(mn.subversion);
    }

</script>


<style lang="scss">

.mn-stats .info-wrapper{
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;

  .info-line{
    display: flex;
    flex-direction: row;
    align-items: flex-start;
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
          .masternode-healthcheck{
              margin-right: 12px;
          }
        display: flex;
        align-items: center;
        justify-content: center;
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