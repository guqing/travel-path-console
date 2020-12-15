<template>
  <div class="container">
    <a-row :gutter="[16, 16]" type="flex">
      <a-col :span="5" :order="0">
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
            </div>

            <div
              :style="{
                position: 'absolute',
                bottom: '35px',
                width: '100%',
                textAlign: 'right',
                left: 0,
                padding: '0 15px 8px 15px',
                borderRadius: '0 0 4px 4px'
              }"
            >
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
      <a-col :span="19" :order="1">
        <leaflet-map @onMapInit="initMap" style="height:76vh" />
      </a-col>
    </a-row>
  </div>
</template>
<script>
import LeafletMap from '@/components/LeafletMap'
import * as L from 'leaflet'
import DesignList from './modules/DesignList'
import designApi from '@/api/design'
import { checkPointIcon, designIcon } from '@/utils/leafletHelper'
import { Empty } from 'ant-design-vue'

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
        icon: designIcon
      })
    },
    handleOnMarkerClick(e) {
      const marker = e.target
      var index = this.checkPointMarker.indexOf(marker)
      if (index > -1) {
        this.checkPointMarker.splice(index, 1)
        e.target.setIcon(designIcon)
      } else {
        this.checkPointMarker.push(e.target)
        e.target.setIcon(checkPointIcon)
      }
    },
    handlePlanSelect(value) {
      this.stepCurrent = 1
      designApi.getById(value.id).then(res => {
        this.handleDrawMarkers(res.data.checkpoints)
      })
    },
    handleClearMap() {
      this.markerLayerGroup.clearLayers()
      this.checkPointMarker = []
    },
    handlePrev() {
      this.stepCurrent = this.stepCurrent - 1
      this.handleClearMap()
    },
    handleOnNext() {
      if (this.stepCurrent === 1) {
        if (this.checkpoints.length < 2) {
          this.$message.warning('请至少选择两个点')
        } else {
          console.log('生成轨迹')
        }
      } else {
        this.stepCurrent = this.stepCurrent + 1
      }
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
  padding: 15px 8px 0px 8px;
}
.step-content {
  margin-top: 15px;
}
</style>
