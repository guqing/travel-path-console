<template>
  <div class="container">
    <a-row :gutter="[16, 16]" type="flex">
      <a-col :span="4" :order="0">
        <div class="editor-wrapper">
          <div class="editor-content">
            <a-list item-layout="horizontal" :data-source="checkpoints">
              <a-list-item slot="renderItem" slot-scope="item">
                <a slot="actions">
                  <a-icon type="eye" />
                </a>
                <a-list-item-meta :description="item.description">
                  <a slot="title" href="#">{{ item.name }}</a>
                  <div
                    slot="avatar"
                    class="editor-listLayer-media u-rSpace--m js-thumbnail"
                    :style="{ background: item.avatarColor, color: '#fff' }"
                  >
                    <p class="CDB-text CDB-size-large is-semibold u-upperCase">
                      {{ item.avatarText }}
                      <img src="~@/assets/icons/route.svg" />
                    </p>
                  </div>
                </a-list-item-meta>
              </a-list-item>
            </a-list>
            <a-pagination
              size="small"
              :current="pagination.current"
              :pageSize="pagination.pageSize"
              :total="pagination.total"
              @change="onPageChange"
              hideOnSinglePage
            />
          </div>
        </div>
      </a-col>
      <a-col :span="20" :order="1">
        <leaflet-map @onMapInit="initMap" style="height:76vh" />
      </a-col>
    </a-row>
  </div>
</template>
<script>
import LeafletMap from '@/components/LeafletMap'
import * as L from 'leaflet'
import designApi from '@/api/design'
const colorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae']
export default {
  name: 'RouteList',
  components: {
    LeafletMap
  },
  data() {
    return {
      checkpoints: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      map: {},
      mapMark: {
        isOpen: false,
        cursorStyle: null
      }
    }
  },
  created() {
    this.loadDesignPlanData()
  },
  methods: {
    initMap(map) {
      this.map = map
      this.markerLayerGroup = L.featureGroup().addTo(this.map)
    },
    handleClearMap() {
      // 从集合中删除marker
      // this.markerLayerGroup.clearLayers()
      this.map.off('click')
      // this.mapMark.isOpen = false
      // this.checkpoints = []
    },
    onPageChange() {
      this.loadData()
    },
    loadDesignPlanData() {
      const queryParam = {
        current: this.pagination.current,
        pageSize: this.pagination.pageSize
      }
      designApi.list(queryParam).then(res => {
        const { list, total } = res.data
        for (const index in list) {
          const element = list[index]
          element.avatarText = element.name.substring(0, 1)
          element.avatarColor = colorList[index % list.length]
        }
        this.checkpoints = list
        this.pagination.total = total
      })
    }
  }
}
</script>
<style lang="less" scoped>
.editor-wrapper {
  width: 100%;
  height: 76vh;
  transition: width 0.3s ease-in-out;
  background-color: #fff;
}
.editor-content {
  padding: 0 8px;

  .editor-listLayer-media {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 4px;
  }
  .CDB-text.is-semibold {
    font-weight: 600;
  }
  .CDB-size-large {
    font-size: 16px;
    line-height: 22px;
  }
  .CDB-text {
    font-family: 'Open Sans';
    margin-bottom: 0;
  }
  .u-upperCase {
    text-transform: uppercase;
  }
}
</style>
