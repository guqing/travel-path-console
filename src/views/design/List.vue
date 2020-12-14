<template>
  <a-card :bordered="false">
    <leaflet-map @onMapInit="initMap" style="height:50vh" />

    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="handleCreate">
        新增
      </a-button>
      <a-button @click="handleClearMap" v-if="clearMapVisible">
        <a-icon type="undo" />清空地图
      </a-button>
      <a-button
        type="primary"
        @click="drawer.visible = true"
        v-if="mapOpsVisible"
      >
        <a-icon type="eye" />查看已选数据
      </a-button>
      <a-dropdown v-show="tableOpsVisible">
        <a-menu slot="overlay">
          <a-menu-item key="1"><a-icon type="delete" />删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作 <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <s-table
      ref="table"
      size="default"
      rowKey="id"
      showPagination="auto"
      :columns="columns"
      :data="loadData"
      :alert="{ show: true, clear: true }"
      :rowSelection="rowSelection"
    >
      <span slot="serial" slot-scope="text, record, index">
        {{ index + 1 }}
      </span>
      <template slot="action" slot-scope="text, record">
        <div class="editable-row-operations">
          <span>
            <a class="preview" @click="handlePreviewPlan(record)">预览</a>
            <a-divider type="vertical" />
            <a class="edit" @click="handleEditPlan(record)">编辑</a>
            <a-divider type="vertical" />
            <a-popconfirm
              title="你确定要删除这条方案吗?"
              placement="rightBottom"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDeleteById(record)"
            >
              <a class="delete" href="#">删除</a>
            </a-popconfirm>
          </span>
        </div>
      </template>
    </s-table>

    <preset-modal
      :visible="modalVisible"
      @ok="handleModalOk"
      @cancel="modalVisible = false"
    />

    <form-drawer
      ref="formDrawer"
      :title="'布设卡口方案坐标点数据集'"
      :visible="drawer.visible"
      :showFooter="!drawer.isPreview"
      :dataSource="checkpoints"
      :pagination="{ pageSize: 5, total: checkpoints.length }"
      @close="drawer.visible = false"
      @cancel="handleFormDrawerCancel"
      @ok="handleOnSave"
    />
  </a-card>
</template>
<script>
import LeafletMap from '@/components/LeafletMap'
import * as L from 'leaflet'
import { STable } from '@/components'
import presetPlanApi from '@/api/presetplan'
import designApi from '@/api/design'
import PresetModal from './modules/PresetModal'
import { PresetIcon, DesignIcon } from '@/utils/leafletHelper'
import FormDrawer from '../preset/modules/FormDrawer'

export default {
  name: 'DesignList',
  components: {
    LeafletMap,
    STable,
    PresetModal,
    FormDrawer
  },
  data() {
    return {
      map: {},
      modalVisible: false,
      clearMapVisible: false,
      designMarkers: [],
      mapMark: {
        isOpen: false,
        cursorStyle: null
      },
      drawer: {
        isPreview: false,
        visible: false
      },
      columns: [
        {
          title: 'ID',
          scopedSlots: { customRender: 'serial' }
        },
        {
          title: '方案名称',
          dataIndex: 'name'
        },
        {
          title: '方案描述',
          dataIndex: 'description'
        },
        {
          title: '方案卡口数',
          dataIndex: 'count'
        },
        {
          title: '创建时间',
          dataIndex: 'createTime'
        },
        {
          table: '操作',
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      selectedRowKeys: [],
      selectedRows: [],
      loadData: parameter => {
        const queryParam = Object.assign({}, this.queryParam)
        queryParam.current = parameter.pageNo
        queryParam.pageSize = parameter.pageSize
        return designApi
          .list(queryParam)
          .then(res => {
            this.$log.debug('布设卡口方案列表数据:', res.data)
            return {
              pageSize: res.data.pageSize,
              pageNo: res.data.current,
              totalCount: res.data.total,
              totalPage: res.data.pages,
              data: res.data.list
            }
          })
          .catch(err => {
            this.$message.error(`查询出错:${err}`)
            return {
              pageSize: 0,
              pageNo: 1,
              totalCount: 0,
              totalPage: 0,
              data: []
            }
          })
      }
    }
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    },
    tableOpsVisible() {
      return this.selectedRowKeys.length > 0
    },
    mapOpsVisible() {
      return this.checkpoints.length > 0
    },
    checkpoints() {
      return this.designMarkers.map(marker => {
        return marker.getLatLng()
      })
    }
  },
  methods: {
    initMap(map) {
      this.map = map
      this.markerLayerGroup = L.featureGroup().addTo(this.map)
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleCreate() {
      this.modalVisible = true
      this.$refs.formDrawer.reset()
    },
    handleModalOk(id) {
      this.modalVisible = false
      this.designMarkers = []
      presetPlanApi.getById(id).then(res => {
        this.handleDrawMarkers(res.data.checkpoints, true)
      })
    },
    handleDrawMarkers(checkpoints, clickable) {
      this.clearMapVisible = true
      if (checkpoints.length === 0) {
        return
      }
      checkpoints.forEach(point => {
        const marker = this.drawPresetMarker(point)
        this.markerLayerGroup.addLayer(marker)
        if (clickable) {
          marker.on('click', e => this.handleOnMarkerClick(e))
        }
      })
      this.map.fitBounds(this.markerLayerGroup.getBounds())
    },
    drawPresetMarker(point) {
      return L.marker(point, {
        icon: new PresetIcon()
      })
    },
    handleOnMarkerClick(e) {
      const marker = e.target
      var index = this.designMarkers.indexOf(marker)
      if (index > -1) {
        this.designMarkers.splice(index, 1)
        e.target.setIcon(new PresetIcon())
      } else {
        this.designMarkers.push(e.target)
        e.target.setIcon(new DesignIcon())
      }
    },
    clearSelected() {
      // 清空 table 已选中项
      this.selectedRows = []
      this.selectedRowKeys = []
    },
    handleClearMap() {
      this.markerLayerGroup.clearLayers()
      this.designMarkers = []
      this.clearMapVisible = false
    },
    handlePreviewPlan(record) {
      this.drawer.isPreview = true
      designApi.getById(record.id).then(res => {
        var checkpoints = res.data.checkpoints || []
        this.handleDrawMarkers(checkpoints, false)
      })
    },
    handleEditPlan(record) {
      this.handleClearMap()
      this.drawer.isPreview = false
      // 获取预设卡口方案数据
      const presetPromise = presetPlanApi.getById(record.id)
      const designPromise = designApi.getById(record.id)
      Promise.all([presetPromise, designPromise]).then(values => {
        const preset = values[0].data
        const design = values[1].data
        this.$refs.formDrawer.edit(design)
        // 绘制预设卡口
        const presetPoints = preset.checkpoints.map(item => [
          item.lat,
          item.lng
        ])
        this.handleDrawMarkers(presetPoints, true)

        const designNodes = design.checkpoints || []
        this.markerLayerGroup.eachLayer(layer => {
          const latlng = layer.getLatLng()
          const hasValue = designNodes.some(item => {
            return item.lat === latlng.lat && item.lng === latlng.lng
          })
          if (hasValue) {
            this.designMarkers.push(layer)
            layer.setIcon(new DesignIcon())
          }
        })
      })
    },
    handleDeleteById() {},
    handleResetForm() {
      this.drawer.visible = false
      this.handleClearMap()
    },
    handleOnSave(values) {
      const params = Object.assign({}, values)
      params.checkpoints = this.checkpoints
      if (params.id) {
        this.$log.debug('编辑布设卡口', params)
        designApi.updateById(params.id, params).then(res => {
          this.$message.success('保存成功')
          this.$refs.table.refresh()
          this.handleResetForm()
        })
      } else {
        designApi.create(params).then(res => {
          this.$message.success('保存成功')
          this.$refs.table.refresh()
          this.handleResetForm()
        })
      }
    },
    handleFormDrawerCancel() {
      this.handleResetForm()
      this.$refs.formDrawer.reset()
    }
  }
}
</script>
