<template>
  <div class="container">
    <a-row :gutter="[16, 16]" type="flex" style="height:100%">
      <a-col :xs="24" :sm="24" :md="6" :lg="6" :order="0">
        <div class="editor-wrapper">
          <div class="editor-content">
            <a-steps :current="stepCurrent" size="small">
              <a-step title="选择方案" />
              <a-step title="决策权重" />
              <a-step title="点选卡口序列" />
              <a-step title="还原轨迹" />
            </a-steps>
            <div class="step-content">
              <DesignList
                v-if="stepCurrent === 0"
                @select="handlePlanSelect"
              ></DesignList>

              <div v-if="stepCurrent === 1">
                <a-alert
                  message="决策权重总和不能大于1，当前权重总和为: 1"
                  type="info"
                  show-icon
                  style="margin-bottom:15px"
                />
                <a-form
                  ref="weightForm"
                  :form="weightForm"
                  :label-col="{ span: 4 }"
                  :wrapper-col="{ span: 18 }"
                >
                  <a-form-item label="距离">
                    <a-input-number
                      :min="0"
                      :max="1"
                      v-decorator="['topsis_weight_distance']"
                      style="width:100%"
                    />
                  </a-form-item>
                  <a-form-item label="通行时间">
                    <a-input-number
                      :min="0"
                      :max="1"
                      v-decorator="['topsis_weight_time']"
                      style="width:100%"
                    />
                  </a-form-item>
                  <a-form-item label="平均速度">
                    <a-input-number
                      :min="0"
                      :max="1"
                      v-decorator="['topsis_weight_average_speed']"
                      style="width:100%"
                    />
                  </a-form-item>
                  <a-form-item label="转弯次数">
                    <a-input-number
                      :min="0"
                      :max="1"
                      v-decorator="['topsis_weight_regular_turn']"
                      style="width:100%"
                    />
                  </a-form-item>
                  <a-form-item label="急转弯次数">
                    <a-input-number
                      :min="0"
                      :max="1"
                      v-decorator="['topsis_weight_sharp_turn']"
                      style="width:100%"
                    />
                  </a-form-item>
                  <a-form-item label="掉头次数">
                    <a-input-number
                      :min="0"
                      :max="1"
                      v-decorator="['topsis_weight_u_turn']"
                      style="width:100%"
                    />
                  </a-form-item>
                </a-form>
              </div>
              <a-timeline v-if="stepCurrent === 2" style="margin-top:28px">
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
              <div v-if="stepCurrent === 3">
                <a-alert
                  :message="tipsMessage"
                  :type="tipsType"
                  show-icon
                  style="margin-bottom:8px"
                />
                <a-table
                  :columns="tracks.columns"
                  :pagination="{ pageSize: 8 }"
                  rowKey="id"
                  :loading="loading.table"
                  :currentRow="tracks.selectedRow"
                  :customRow="tracksTableRowClick"
                  :data-source="tracks.data"
                  :scroll="{ x: true }"
                >
                  <span slot="serial" slot-scope="text, record, index">
                    {{ index + 1 }}
                  </span>
                  <span slot="icon">
                    <img src="@/assets/icons/alt_route.png" alt="轨迹" />
                  </span>
                  <template slot="action" slot-scope="text, record">
                    <a
                      href="javascript:void(0)"
                      @click="handleOnSavePath(record)"
                    >
                      转存
                    </a>
                  </template>
                </a-table>
              </div>
            </div>
            <div class="editor-footer">
              <a-button v-if="stepCurrent > 0" @click="handlePrev">
                上一步
              </a-button>
              <a-button
                v-if="showNext"
                :disabled="stepNextDisable"
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

    <a-modal
      v-model="modal.visible"
      title="保存车辆出行轨迹"
      @ok="handleOnModalOk"
    >
      <a-form-model
        ref="routeForm"
        :model="modal.form"
        :rules="modal.rules"
        :label-col="modal.labelCol"
        :wrapper-col="modal.wrapperCol"
      >
        <a-form-model-item ref="carNumber" label="车牌号" prop="carNumber">
          <a-input
            v-model="modal.form.carNumber"
            @blur="
              () => {
                $refs.carNumber.onFieldBlur()
              }
            "
          />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>
<script>
import LeafletMap from '@/components/LeafletMap'
import * as L from 'leaflet'
import DesignList from './modules/DesignList'
import designApi from '@/api/design'
import userOptionApi from '@/api/userOptions'
import { createNumberedMarker, numberedDivIcon } from '@/utils/leaflet/marker'
import { add } from '@/utils/util'
import {
  startIcon,
  endIcon,
  // checkedIcon,
  uncheckedIcon
} from '@/utils/leafletHelper'
import { Empty } from 'ant-design-vue'
import routeApi from '@/api/route'
import pick from 'lodash.pick'

const polineNomalOption = { color: 'darkgrey', weight: 4, opacity: 1 }
const polineActiveOption = { color: '#f5222d', weight: 5, opacity: 0.8 }

export default {
  name: 'RouteList',
  components: {
    LeafletMap,
    DesignList
  },
  data() {
    return {
      map: {},
      routeForm: {},
      loading: {
        table: false,
        map: false
      },
      modal: {
        visible: false,
        form: {},
        rules: {
          carNumber: [
            { required: true, message: '请输入车牌号', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在3-10位之间', trigger: 'blur' }
          ]
        },
        labelCol: { span: 4 },
        wrapperCol: { span: 18 }
      },
      markerLayerGroup: {},
      tracks: {
        data: [],
        columns: [
          {
            title: 'ID',
            dataIndex: 'id'
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
          },
          {
            title: '操作',
            key: 'action',
            fixed: 'right',
            scopedSlots: { customRender: 'action' }
          }
        ],
        selectedRow: {},
        rowKeyLayerMap: [],
        checkpoints: {},
        layerGroup: null,
        markerGroup: null
      },
      selectedPlanId: null,
      checkPointMarker: [],
      stepCurrent: 0,
      weightFormValueValid: {},
      weightCheckPassed: false
    }
  },
  beforeCreate() {
    this.simpleImage = Empty.PRESENTED_IMAGE_SIMPLE
    this.weightForm = this.$form.createForm(this, {
      name: 'weightForm',
      onValuesChange: (props, values) => {
        // 拷贝属性
        Object.assign(this.weightFormValueValid, values)
        this.handleValidWeight()
      }
    })
  },
  computed: {
    showNext() {
      return this.stepCurrent > 0 && this.stepCurrent < 3
    },
    checkpoints() {
      return this.checkPointMarker.map(marker => {
        return marker.getLatLng()
      })
    },
    tipsMessage() {
      const length = this.tracks.data.length
      if (this.tracks.data.length > 0) {
        return `车辆出行轨迹还原成功,共搜寻到${length}条路径,最优解ID=1`
      }
      return '无法完成轨迹还原,请检查卡口序列之间是否可达'
    },
    tipsType() {
      return this.tracks.data.length > 0 ? 'success' : 'warning'
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
    },
    stepNextDisable() {
      return !this.weightCheckPassed
    }
  },
  methods: {
    handleValidWeight() {
      // 校验
      let weightSum = 0
      Object.keys(this.weightFormValueValid).forEach(key => {
        // 权重小数计算避免精度丢失
        weightSum = add(weightSum, this.weightFormValueValid[key])
      })
      if (weightSum === 1) {
        this.weightCheckPassed = true
      } else {
        this.weightCheckPassed = false
      }
    },
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
        const length = this.checkPointMarker.length
        // checkedIcon
        e.target.setIcon(numberedDivIcon(length))
      }
    },
    handlePlanSelect(value) {
      this.stepCurrent = 1
      this.selectedPlanId = value.id
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
    },
    handleOnNext() {
      const currentStep = this.stepCurrent + 1
      if (currentStep === 3) {
        if (this.checkpoints.length < 2) {
          this.$message.warning('请至少选择两个点')
          return
        } else {
          this.handleRoute()
        }
      }
      this.stepCurrent = currentStep
    },
    handleRoute() {
      this.loading.table = true
      this.tracks.checkpoints = this.checkpoints
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
      this.tracks.markerPoints = param
      routeApi
        .route(param)
        .then(res => {
          this.loading.table = false
          this.$log.debug('生成轨迹', res.data.length)
          // 给每条轨迹新增一个id属性用于改变样式,从1开始
          res.data.forEach((item, index) => {
            item.id = index + 1
          })
          this.tracks.data = res.data
          // 对轨迹进行相应操作
          this.handleClearMap()
          // 同步绘制
          this.handleDrawPoline(res.data)
          this.drwaPathMarker()
        })
        .finally(() => {
          setTimeout(() => {
            this.loading.table = false
          }, 1000)
        })
    },
    drwaPathMarker() {
      const { start, end, waypoints } = this.tracks.markerPoints

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
      let firstLayer = null
      paths.forEach((path, index) => {
        const points = path.points.map(item => [item.lat, item.lng])

        var polyline = L.polyline(points, polineNomalOption)
        if (index === 0) {
          // 高亮第一条轨迹
          firstLayer = polyline
          polyline.setStyle(polineActiveOption)
        }

        this.registPolylineClickEvent(polyline)
        polylines.push(polyline)

        this.tracks.rowKeyLayerMap.push({
          rowKey: path.id,
          layer: polyline
        })
      })
      this.tracks.layerGroup = L.featureGroup(polylines).addTo(this.map)
      if (firstLayer) {
        firstLayer.bringToFront()
      }
      this.map.fitBounds(this.tracks.layerGroup.getBounds())
    },
    registPolylineClickEvent(polyline) {
      const that = this
      polyline.off().on('click', function(e) {
        // 取消表格选中
        that.cancelTrackTableSelect()
        // 绘制poline样式
        that.tracks.layerGroup.eachLayer(layer => {
          if (layer === e.target) {
            layer.bringToFront()
            layer.setStyle(polineActiveOption)
          } else {
            layer.setStyle(polineNomalOption)
          }
        })
      })
    },
    cancelTrackTableSelect() {
      const selectedRows = document.querySelectorAll('.table-row-selection')
      if (selectedRows) {
        selectedRows.forEach(row => {
          row.classList.remove('table-row-selection')
        })
      }
    },
    tracksTableRowClick(record) {
      return {
        on: {
          click: e => {
            this.tracks.selectedRow = record
            // 设置表格样式
            this.cancelTrackTableSelect()

            const children = e.target.parentNode.children
            for (let i = 0; i < children.length; i++) {
              children[i].classList.add('table-row-selection')
            }

            this.handleActivePoline()
          }
        }
      }
    },
    handleActivePoline() {
      const selectedRowKey = this.tracks.selectedRow.id
      // 修改poline样式
      this.tracks.rowKeyLayerMap.forEach(item => {
        const layer = item.layer
        if (item.rowKey === selectedRowKey) {
          layer.bringToFront()
          this.map.fitBounds(layer.getBounds())
          layer.setStyle(polineActiveOption)
        } else {
          layer.setStyle(polineNomalOption)
        }
      })
    },
    handleOnSavePath(record) {
      this.routeForm = {}
      this.routeForm = pick(
        record,
        'points',
        'distance',
        'time',
        'averageSpeed',
        'regularTurnCount',
        'sharpTurnCount',
        'uturnCount'
      )
      this.routeForm.checkpoints = this.tracks.checkpoints
      this.modal.visible = true
    },
    handleOnModalOk() {
      this.routeForm.carNumber = this.modal.form.carNumber
      routeApi.save(this.routeForm).then(res => {
        this.$message.success('转存成功')
        this.routeForm = {}
        this.modal.visible = false
      })
    },
    handleListRouteWeights() {
      userOptionApi.listRoutWeights().then(res => {
        this.weightForm.setFieldsValue(res.data)
      })
    },
    handleUpdateRouteWeights() {
      this.weightForm.validateFields((err, values) => {
        if (err) {
          return
        }
        userOptionApi.updateRoutWeights(values).then(res => {
          this.$message.success('权重已更新')
        })
      })
    }
  },
  watch: {
    stepCurrent(val, old) {
      if (val === 1) {
        this.handleListRouteWeights()
      }
      if (old === 1 && val === 2) {
        this.handleUpdateRouteWeights()
      }
      if (val === 2) {
        this.handleFetchDesignPlan()
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
  overflow: hidden;
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
