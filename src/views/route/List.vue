<template>
  <div class="container">
    <a-row :gutter="[16, 16]" type="flex">
      <a-col :span="4" :order="0">
        <div class="editor-wrapper">
          <div class="editor-content">
            <a-list item-layout="horizontal" :data-source="checkpoints">
              <a-list-item slot="renderItem" slot-scope="item">
                <a-list-item-meta
                  description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                >
                  <a slot="title" href="https://www.antdv.com/">{{ item.title }}</a>
                  <a-avatar slot="avatar" src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
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
    this.loadData()
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
    loadData() {
      const queryParam = {
        current: this.pagination.current,
        pageSize: this.pagination.pageSize
      }
      designApi.list(queryParam).then(res => {
        this.checkpoints = res.data.list
        this.pagination.total = res.data.total
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
</style>
