<template>
  <div class="map-wrapper">
    <div id="mapContainer" :style="{ cursor: cursor }"></div>
  </div>
</template>

<script>
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'

// openstreetmap地图瓦片地址
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}'

export default {
  name: 'LeafletMap',
  props: {
    cursor: {
      type: String,
      required: false,
      default: null
    },
    bounds: {
      type: Array,
      required: false,
      default: () => {
        return [
          [34.041276143397731, 108.4084198740709],
          [34.652635225618667, 109.56107192878135]
        ]
      }
    }
  },
  data() {
    return {
      map: {}
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      // 设置左上角经纬度
      var corner1 = L.latLng(this.bounds[0][0], this.bounds[0][1])
      // 设置右下点经纬度
      var corner2 = L.latLng(this.bounds[1][0], this.bounds[1][1])
      // 构建视图限制范围
      var bounds = L.latLngBounds(corner1, corner2)
      this.map = new L.Map('mapContainer', {
        maxBounds: bounds,
        center: [22.545583, 113.915731],
        zoom: 14,
        zoomControl: true
      })

      // tileUrl用来指定需要加载的瓦片服务地址,如果使用自定义瓦片服务可能需要重载L.TileLayer的getTileUrl方法
      this.L.tileLayer(tileUrl, {
        foo: 'bar',
        attribution: 'Map data &copy; <a href="https://github.com/guqing">guqing</a>',
        minZoom: 3 // 最大缩放级别
        // maxZoom: 18 // 修小缩放级别
      }).addTo(this.map)

      // 传递初始化成功事件
      this.$emit('onMapInit', this.map)
    }
  }
}
</script>

<style lang="less" scoped>
.map-wrapper {
  height: 70vh;
  margin-bottom: 24px;
}
html,
body,
#mapContainer {
  height: 100%;
  width: 100%;
  z-index: 1;
}
</style>
