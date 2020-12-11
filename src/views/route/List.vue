<template>
  <div class="container">
    <a-row :gutter="[16, 16]" type="flex">
      <a-col :span="4" :order="0">
        <div class="editor-wrapper">
          <div class="editor-panel">
            <div class="editor-content">中文</div>
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

export default {
  name: 'RouteList',
  components: {
    LeafletMap
  },
  data() {
    return {
      map: {},
      mapMark: {
        isOpen: false,
        cursorStyle: null
      }
    }
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
