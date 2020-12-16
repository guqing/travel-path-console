<template>
  <div class="container">
    <a-row :gutter="[16, 16]" type="flex" style="height:100%">
      <a-col :xs="24" :sm="24" :md="6" :lg="6" :order="0">
        <div class="editor-wrapper">
          <div class="editor-content">
            <a-steps :current="stepCurrent" size="small">
              <a-step title="选择方案" />
              <a-step title="点选卡口序列" />
              <a-step title="还原轨迹" />
            </a-steps>
            <div class="step-content">
              <DesignList
                v-if="stepCurrent === 0"
                @select="handlePlanSelect"
              ></DesignList>

              <a-timeline v-if="stepCurrent === 1" style="margin-top:28px">
                <a-timeline-item
                  v-for="(checkpoint, index) in checkpoints"
                  :key="index"
                  :color="color(index)"
                >
                  <span style="margin-right:8px">序号:{{ index + 1 }}</span>
                  <a-tag>{{ checkpoint.lat }},{{ checkpoint.lng }}</a-tag>
                </a-timeline-item>
                <a-empty :image="simpleImage" v-if="checkpoints.length === 0">
                  <span slot="description">请点选车辆卡口序列,至少两个</span>
                </a-empty>
              </a-timeline>

              <a-table
                :columns="tracks.columns"
                :pagination="{ pageSize: 10 }"
                rowKey="id"
                :currentRow="tracks.selectedRow"
                :customRow="tracksTableRowClick"
                :data-source="tracks.data"
                v-if="stepCurrent === 2"
              >
                <span slot="serial" slot-scope="text, record, index">
                  {{ index + 1 }}
                </span>
                <span slot="icon">
                  <img src="@/assets/icons/alt_route.png" alt="轨迹" />
                </span>
              </a-table>
            </div>
            <div class="editor-footer">
              <a-button v-if="stepCurrent > 0" @click="handlePrev">
                上一步
              </a-button>
              <a-button
                v-if="showNext"
                type="primary"
                style="margin-left: 8px"
                @click="handleOnNext"
              >
                下一步
              </a-button>
            </div>
          </div>
        </div>
      </a-col>
      <a-col :xs="24" :sm="24" :md="18" :lg="18" :order="1">
        <leaflet-map @onMapInit="initMap" style="height:100%" />
      </a-col>
    </a-row>
  </div>
</template>
<script>
import LeafletMap from '@/components/LeafletMap'
import * as L from 'leaflet'
import DesignList from './modules/DesignList'
import designApi from '@/api/design'
import { createNumberedMarker } from '@/utils/leaflet/marker'

import {
  startIcon,
  endIcon,
  checkedIcon,
  uncheckedIcon
} from '@/utils/leafletHelper'
import { Empty } from 'ant-design-vue'
import routeApi from '@/api/route'

export default {
  name: 'RouteList',
  components: {
    LeafletMap,
    DesignList
  },
  data() {
    return {
      map: {},
      markerLayerGroup: {},
      tracks: {
        data: [],
        columns: [
          {
            title: '#',
            scopedSlots: { customRender: 'serial' }
          },
          {
            title: '#',
            scopedSlots: { customRender: 'icon' }
          },
          {
            title: '决策评分',
            dataIndex: 'decisionValue'
          },
          {
            title: '距离',
            dataIndex: 'distance',
            customRender: distance => distance.toFixed(2) + '米'
          },
          {
            title: '耗时',
            dataIndex: 'time',
            // 毫秒转秒
            customRender: time => (time / 1000).toFixed(2) + '秒'
          },
          {
            title: '平均速度',
            dataIndex: 'averageSpeed',
            customRender: averageSpeed => averageSpeed.toFixed(2) + 'km/h'
          }
        ],
        selectedRow: {},
        checkpoints: {},
        layerGroup: null,
        markerGroup: null
      },
      selectedPlanId: null,
      checkPointMarker: [],
      stepCurrent: 0
    }
  },
  beforeCreate() {
    this.simpleImage = Empty.PRESENTED_IMAGE_SIMPLE
  },
  computed: {
    showNext() {
      return this.stepCurrent > 0 && this.stepCurrent < 2
    },
    checkpoints() {
      return this.checkPointMarker.map(marker => {
        return marker.getLatLng()
      })
    },
    color() {
      return function(index) {
        if (index === 0) {
          return 'green'
        }
        if (index === this.checkpoints.length - 1) {
          return 'red'
        }
        return 'gray'
      }
    }
  },
  methods: {
    initMap(map) {
      this.map = map
      this.markerLayerGroup = L.featureGroup().addTo(this.map)
    },
    handleDrawMarkers(checkpoints) {
      this.clearMapVisible = true
      if (checkpoints.length === 0) {
        return
      }
      checkpoints.forEach(point => {
        const marker = this.drawBaseMarker(point)
        this.markerLayerGroup.addLayer(marker)
        marker.on('click', e => this.handleOnMarkerClick(e))
      })
      this.map.fitBounds(this.markerLayerGroup.getBounds())
    },
    drawBaseMarker(point) {
      return L.marker(point, {
        icon: uncheckedIcon
      })
    },
    handleOnMarkerClick(e) {
      const marker = e.target
      var index = this.checkPointMarker.indexOf(marker)
      if (index > -1) {
        this.checkPointMarker.splice(index, 1)
        e.target.setIcon(uncheckedIcon)
      } else {
        this.checkPointMarker.push(e.target)
        e.target.setIcon(checkedIcon)
      }
    },
    handlePlanSelect(value) {
      this.stepCurrent = 1
      this.selectedPlanId = value.id
      this.handleFetchDesignPlan()
    },
    handleFetchDesignPlan() {
      designApi.getById(this.selectedPlanId).then(res => {
        this.handleDrawMarkers(res.data.checkpoints)
      })
    },
    handleClearMap() {
      this.markerLayerGroup.clearLayers()
      if (this.tracks.layerGroup) {
        this.tracks.layerGroup.clearLayers()
      }
      if (this.tracks.markerGroup) {
        this.tracks.markerGroup.clearLayers()
      }
      this.checkPointMarker = []
    },
    handlePrev() {
      this.stepCurrent = this.stepCurrent - 1
      this.handleClearMap()
      if (this.stepCurrent === 1) {
        this.handleFetchDesignPlan()
      }
    },
    handleOnNext() {
      if (this.stepCurrent === 1) {
        if (this.checkpoints.length < 2) {
          this.$message.warning('请至少选择两个点')
          return
        } else {
          this.handleRoute()
        }
      }
      this.stepCurrent = this.stepCurrent + 1
    },
    handleRoute() {
      const length = this.checkpoints.length
      const waypoints = []
      for (let i = 1; i < length - 1; i++) {
        const item = this.checkpoints[i]
        waypoints.push(item)
      }
      const param = {
        start: this.checkpoints[0],
        end: this.checkpoints[length - 1],
        waypoints: waypoints
      }
      this.tracks.checkpoints = param
      routeApi.route(param).then(res => {
        this.$log.debug('生成轨迹', res.data.length)
        // 给每条轨迹新增一个id属性用于改变样式,从1开始
        res.data.forEach((item, index) => {
          item.id = index + 1
        })
        this.tracks.data = res.data
        // 对轨迹进行相应操作
        this.handleClearMap()
        this.handleDrawPoline(res.data)
        this.drwaPathMarker()
      })
    },
    drwaPathMarker() {
      const { start, end, waypoints } = this.tracks.checkpoints

      const markers = []
      // render start point marker
      const startMarker = L.marker(start, { icon: startIcon })
      markers.push(startMarker)

      // render end point marker
      const endMarker = L.marker(end, { icon: endIcon })
      markers.push(endMarker)

      // render waypoint marker
      waypoints.forEach((waypoint, index) => {
        const waypointMarker = createNumberedMarker(waypoint, index + 1)
        markers.push(waypointMarker)
      })
      this.tracks.markerGroup = L.layerGroup(markers).addTo(this.map)
    },
    handleDrawPoline(paths) {
      var polylines = []
      paths.forEach(path => {
        const points = path.points.map(item => [item.lat, item.lng])
        var polyline = L.polyline(points, {
          color: 'red',
          weight: 3,
          opacity: 0.8
        })
        polylines.push(polyline)
      })
      this.tracks.layerGroup = L.layerGroup(polylines).addTo(this.map)
    },
    tracksTableRowClick(record) {
      return {
        on: {
          click: e => {
            this.tracks.selectedRow = record

            const selectedRows = document.querySelectorAll(
              '.table-row-selection'
            )
            if (selectedRows) {
              selectedRows.forEach(row => {
                row.classList.remove('table-row-selection')
              })
            }

            const children = e.target.parentNode.children
            for (let i = 0; i < children.length; i++) {
              children[i].classList.add('table-row-selection')
            }
          }
        }
      }
    }
  }
}
</script>
<style lang="less" scoped>
.container {
  height: 100%;
}
.editor-wrapper {
  width: 100%;
  height: 100%;
  transition: width 0.3s ease-in-out;
  background-color: #fff;
}
.editor-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 15px 8px 0px 8px;
}
.step-content {
  flex: 1;
  margin-top: 15px;
}

.editor-footer {
  height: 50px;
  line-height: 45px;
  text-align: right;
}
</style>
