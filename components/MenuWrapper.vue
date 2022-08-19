<template>
  <div class="menu-wrapper-component">
        <div class="menu-wrapper">
        <Button 
            size="is-large" 
            type="is-grey"
            :ignoremobile="true"
            to="/"
            
            >Home</Button>
        <Button size="is-large" type="is-grey" to="/stats" 
            :ignoremobile="true">Stats</Button>
        <Button 
            size="is-large" 
            type="is-grey" 
            :ignoremobile="true"
            to="https://pacprotocol.com/network-product/faq?type=Masternodes"
            :external="true"
            >
            FAQ
        </Button>
    </div>
  </div>
</template>


<script setup>
    import Button from "@/yan-ui/components/Button.vue"; 
</script>

<style lang="scss">
    .main-layout{
        max-width: 768px;
        margin: 0 auto;
        box-sizing: border-box;
        padding: var(--padding-normal);

        @include mobile{
          padding: var(--padding-small);
        }

        .menu-wrapper{
            display: flex;
            align-items: center;
            justify-content: space-around;
            padding-bottom: var(--padding-normal);
            .button-wrapper{
                margin-bottom: 0;
                display: flex;
                flex-direction: column;
                margin-right: 5px;
                &:first-child{
                    margin-left: 0;
                }
                &:last-child{
                    margin-right: 0;
                }
            }

            &:not(.ignoremobile){
                @include mobile {
                    flex-direction: column;
                    .button-wrapper{
                        &:not(.square){
                            width: 100%;
                            margin-left: 0;
                            margin-right: 0;
                            margin-bottom: var(--padding-small);
                        }
                    }
                }
            }

        }
    }
</style>