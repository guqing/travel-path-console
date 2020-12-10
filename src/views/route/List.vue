<template>
  <a-card :bordered="false">
    <leaflet-map @onMapInit="initMap" />
  </a-card>
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
