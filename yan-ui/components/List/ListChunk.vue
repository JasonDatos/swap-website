<template>
    <div class="list-chunk-wrapper">
        <List
            @scroll="scroll_change"
            :loadBottomOffset="loadBottomOffset"
            :refresh="refresh"
            :stop-scroll="stopScroll"
            @load-more="loadMore"
        >
            <div
                class="list-chunk-area"
                :style="{ minHeight: chunk_total_height + 'px' }"
            >
                <template
                    v-for="(item_chunk, $index_chunk) in chunked_data"
                    :key="$index_chunk"
                >
                    <div
                        v-show="is_chunk_visible($index_chunk)"
                        :data-index="$index_chunk"
                        class="list-chunked"
                        :style="{
                            transform:
                                'translateY(' +
                                chunk_scroll_height * $index_chunk +
                                'px)',
                            height:
                                item_total_height * item_chunk.length + 'px',
                        }"
                    >
                        <ListItem
                            v-for="(item, $index) in item_chunk"
                            :data-index="calculate_index($index_chunk, $index)"
                            :has-card="hasCard"
                            :hoverable="hoverable"
                            :key="id ? item[id] : $index"
                        >
                            <slot
                                :item="item"
                                :index="calculate_index($index_chunk, $index)"
                            ></slot>
                        </ListItem>
                    </div>
                </template>
            </div>
        </List>
    </div>
</template>

<script lang="ts">
import { Options, Vue, prop } from 'vue-class-component'
import ResizeObserver from 'resize-observer-polyfill'
import ListItem from './ListItem.vue'
import List from './List.vue'
import { RectSize } from './../../type/types'

class Props {
    data = prop({
        type: Array as () => Array<any> | any,
        default: () => [],
        required: false,
    })

    id = prop({
        type: String,
        default: '',
        required: false,
    })

    hasCard = prop({
        type: Boolean,
        default: true,
        required: false,
    })

    hoverable = prop({
        type: Boolean,
        default: true,
        required: false,
    })

    itemHeight = prop({
        type: Number,
        default: 20,
        required: false,
    })

    itemPadding = prop({
        type: Number,
        default: 12,
        required: false,
    })

    itemSpacing = prop({
        type: Number,
        default: 8,
        required: false,
    })

    //---

    loadBottomOffset = prop({
        type: Number,
        default: 0,
        required: false,
    })

    refresh = prop({
        type: Boolean,
        default: false,
        required: false,
    })

    stopScroll = prop({
        type: Boolean,
        default: false,
        required: false,
    })
}

@Options({
    components: {
        List,
        ListItem,
    },
    emits: ['size-change', 'load-more'],
})
export default class Button extends Vue.with(Props) {
    private resizeObserver?: ResizeObserver
    private chunk_height: number = 0
    private listChunkWidth: number = 0
    private listChunkActive: number = 0
    private listChunkScrollData: any = null
    private item_total_height: number = 0
    private chunk_scroll_height: number = 0
    private item_per_chunk: number = 0
    private chunk_total_height: number = 0

    private size_cache: RectSize = {}

    private chunked_data: any = []

    declare $refs: {
        chunkScroll: HTMLInputElement
    }

    mounted() {
        this.resizeObserver = new ResizeObserver(this.process_resize)
        this.resizeObserver.observe(this.$el)

        this.$watch('data', () => {
            this.update_data()
            this.update_layout()
        })

        this.$watch('itemHeight', () => {
            this.update_data()
            this.update_layout()
        })
    }

    beforeUnmount() {
        this.resizeObserver?.disconnect()
    }

    private loadMore(done: CallableFunction) {
        this.$emit('load-more', done)
    }

    private is_chunk_visible(index: number) {
        return (
            index === this.listChunkActive || index === this.listChunkActive + 1
        )
    }

    private scroll_change(e: any) {
        this.listChunkScrollData = {
            scrollTop: e.target.scrollTop,
            scrollHeight: e.target.scrollHeight,
            scrollBottom: e.target.scrollTop + e.target.clientHeight,
        }

        this.listChunkActive = Math.floor(
            this.listChunkScrollData.scrollTop / this.chunk_scroll_height,
        )
    }

    private update_data() {
        this.chunk_data()
    }

    private chunk_data() {
        if (this.item_per_chunk !== 0) {
            //To avoid loop of death
            this.chunked_data = []
            let i = 0
            while (i < this.data.length) {
                this.chunked_data.push(
                    this.data.slice(i, (i += this.item_per_chunk)),
                )
            }
        }
    }

    private calculate_index(chunk_index: number, item_index: number) {
        return chunk_index * this.item_per_chunk + item_index
    }

    private process_resize(
        entries: ResizeObserverEntry[],
        observer: ResizeObserver,
    ) {
        const entry = entries[0]
        const { left, top, width, height } = entry.contentRect
        this.size_cache = { left, top, width, height }
        this.$emit('size-change', this.size_cache)
        this.update_layout()
        this.update_data()
    }

    private update_layout() {
        let { left, top, width, height }: any = this.size_cache
        height = Math.ceil(height)
        width = Math.ceil(width)
        if (height) this.chunk_height = height
        if (width) this.listChunkWidth = width

        // itemPadding * 2 = Top / Bottom Padding
        this.item_total_height =
            this.itemHeight + this.itemPadding * 2 + this.itemSpacing
        this.item_per_chunk = Math.ceil(
            this.chunk_height / this.item_total_height,
        )

        this.chunk_total_height = this.item_total_height * this.data.length
        this.chunk_scroll_height = this.item_total_height * this.item_per_chunk

        //console.log('--------------------------------------')
        //console.log('Item Count', this.data.length)
        //console.log('Item Height', this.item_total_height)
        //console.log('Item Per Chunk', this.item_per_chunk)
        //console.log('Chunk Height', this.chunk_height)
        //console.log('Chunk Scroll Height', this.chunk_scroll_height)
        //console.log('Chunk Total Height', this.chunk_total_height)
        //console.log('--------------------------------------')

        this.$el.style.setProperty(
            '--list-chunk-item-total-amount',
            this.data.length,
        )
        this.$el.style.setProperty(
            '--list-chunk-item-forced-height',
            this.item_total_height + 'px',
        )
        this.$el.style.setProperty(
            '--list-chunk-item-spacing',
            this.itemSpacing + 'px',
        )
    }
}
</script>

<style lang="scss">
.list-chunk-wrapper {
    --list-item-width: 100%;
    --list-item-spacing: var(--padding-small);
    --list-chunk-item-forced-height: 20px;

    height: 100%;
    max-height: var(--app-height, 100vh);

    .list-chunk-scroll {
        overflow-y: auto;
        max-height: 100%;
    }

    .list-chunk-area {
        overflow-y: visible;
        position: relative;
        height: 100%;
        .list-chunked {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 0;
            z-index: 0;
            height: 100%;
            max-height: 100%;
            overflow: visible;

            .list-item-wrapper {
                --list-item-margin-bottom: 0px !important;
                .list-item-content {
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
            }
        }
    }
}
</style>
