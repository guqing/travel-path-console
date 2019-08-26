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
      map: null,
      featureGroup: new L.featureGroup(), // eslint-disable-line
      markerCount: 0, // marker标记点的数量
      markerDataArray: [], // maker标记的坐标点集合
      markerHashTable: new HashTable(), // 创建一个hashTable容器
      tempPointString: ''
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.map = new L.Map('mapContainer', {
        center: [40.030401, 116.225003],
        zoom: 14,
        minZoom: 11,
        maxZoom: 19,
        attributionControl: false,
        zoomControl: true
      })
      this.L.tileLayer.loadTileLayer(tileUrl, {
        attribution: 'Map data &copy;<a href="https://github.com/guqing">guqing</a>',
        minZoom: 11,
        maxZoom: 19
      }).addTo(this.map)
    },
    handleMapClick (e) {
      var point = e.latlng
      // 返回的实际是markerLayer层
      var marker = L.marker([point.lat, point.lng]).addTo(this.map)

      // 将markerLayer添加到marker集合中
      this.handleAddMarkerToColections(marker)

      // 为marker添加相应事件
      marker.on('click', e => this.handleOnMarkerClick(e))
    },
    handleOnMarkerClick (e) {
      // 标记物点击事件，获取被点击的marker的坐标
      var point = e.target.getLatLng()
      // 转为字符串作为hash表的键防止坐标精度失真
      var pointJSONString = JSON.stringify(point)
      // 根据坐标查询原型覆盖物对象circle
      var circle = this.markerHashTable.getValue(pointJSONString)
      if (circle) {
        // 将marker从HashTable中删除
        this.handleRemoveMarkerFromColections(pointJSONString)
      } else {
        // 绘制圆形标记物
        var circleMarker = this.addCicleMarkerToMap(point)

        // 以坐标点为key,原型覆盖物为value存储到HashTable中
        this.handleAddMarkerToColections(circleMarker)
        // 以坐标点为key,原型覆盖物为value存储到HashTable中
      }
    },
    addCicleMarkerToMap (point) {
      var circleMarker = L.circle([point.lat, point.lng], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 5
      }).addTo(this.map)

      return circleMarker
    },
    markerHashDataConvert () {
      // 将hashTable中的坐标点字符串对象数据转换为对象数组
      var array = []
      var keys = this.markerHashTable.getKeys()
      keys.forEach((item) => {
        var point = JSON.parse(item)
        array.push(point)
      })
      return array
    },
    batchDrawCicleMarkers (pointList) {
      console.log('绘制圆形标记物')
      pointList.forEach(point => {
        var cicleMarkerLayer = this.addCicleMarkerToMap(point)
        this.handleAddMarkerToColections(cicleMarkerLayer)
      })
    },
    batchDrawMarkers (pointList, eventFlag) {
      // 批量绘制之前先清空地图
      this.batchRemoveLayers()
      console.log('清空地图图层')
      pointList.forEach(point => {
        var markerLayer = L.marker([point.lat, point.lng]).addTo(this.map)
        if (eventFlag) {
          markerLayer.on('click', this.handleOnMarkerClick)
        }
        // 纳入到featureGroup组管理
        this.featureGroup.addLayer(markerLayer)

        // 自适应地图缩放级别
        this.map.fitBounds(this.featureGroup.getBounds())
      })
    },
    batchRemoveLayers () {
      this.featureGroup.eachLayer(layer => {
        layer.remove()
      })
      this.featureGroup.clearLayers()
    },
    handleAddMarkerToColections (markerLayer) {
      // 将marker添加到hashTable中,先转换为字符串在添加到hash否则会出现精度失真
      var pointJSONString = JSON.stringify(markerLayer.getLatLng())
      this.markerHashTable.add(pointJSONString, markerLayer)
      console.log(this.markerHashTable.getValues())
      // marker标记点数量+1
      this.markerCount++
    },
    handleRemoveMarkerFromColections (point) {
      var layer = this.markerHashTable.getValue(point)
      layer.remove()
      this.markerHashTable.remove(point)
      // marker标记点数量-1
      this.markerCount--
    },
  },
  watch: {
    markerCount (count) {
      if (count > 0) {
        this.drawerBtnVisible = true
        // 数据转换
        this.markerDataArray = this.markerHashDataConvert()
      } else {
        this.drawerBtnVisible = false
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>>
