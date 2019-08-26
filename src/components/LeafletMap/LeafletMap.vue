<template>
  <div class="map-wrapper">
    <div id="mapContainer"></div>
  </div>
</template>

<script>
import * as L from 'leaflet'
import { tileUrl } from '@/api/tile'

export default {
  name: 'LeafletMap',
  data () {
    return {
      map: null
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      // 设置左上角经纬度
      var corner1 = L.latLng(34.041276143397731, 108.4084198740709)
      // 设置右下点经纬度
      var corner2 = L.latLng(34.652635225618667, 109.56107192878135)
      // 构建视图限制范围
      var bounds = L.latLngBounds(corner1, corner2)
      this.map = new L.Map('mapContainer', {
        maxBounds: bounds,
        center: [34.29126107845571, 108.97509816353342],
        zoom: 14,
        zoomControl: true
      })
      // this.L.tileLayer.loadTileLayer
      this.L.tileLayer(tileUrl, {
        attribution: 'Map data &copy; <a href="https://github.com/guqing">guqing</a>',
        minZoom: 10,
        maxZoom: 18
      }).addTo(this.map)

      // 传递初始化成功事件
      this.$emit('onMapInit', this.map)
    }
  }
}
</script>

<style lang="less" scoped>
.map-wrapper {
  margin-bottom: 24px;
}

#mapContainer {
  height: 500px;
}
</style>
