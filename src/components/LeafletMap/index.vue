<template>
  <div class="map-wrapper">
    <div id="mapContainer" :style="{ cursor: cursor }"></div>
  </div>
</template>

<script>
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import 'leaflet-loading/src/Control.Loading.js'
import 'leaflet-loading/src/Control.Loading.css'

// openstreetmap地图瓦片地址
// const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}'
const mapboxTileUrl =
  'https://api.mapbox.com/styles/v1/guqing/ckis880630pby19ohlzsqtuki/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3VxaW5nIiwiYSI6ImNqdmtmNGh4bjBxdmg0OXFyMDI0dHc3emQifQ.AAGR_XTCwYALRFQmtAwmHA'

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
          [32.948, 107.708],
          [37.139, 113.161]
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
        center: [34.26099394982405, 108.94237697124483],
        zoom: 14,
        zoomControl: true,
        loadingControl: true
      })

      // tileUrl用来指定需要加载的瓦片服务地址
      this.L.tileLayer(mapboxTileUrl, {
        foo: 'bar',
        attribution:
          'Map data &copy; <a href="https://github.com/guqing">guqing</a>',
        minZoom: 3
      }).addTo(this.map)

      // 绘制地图边界
      L.rectangle(bounds, {
        width: 2,
        color: '#000',
        opacity: 0.3,
        fill: false
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
  width: 100%;
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
