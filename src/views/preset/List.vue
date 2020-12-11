<template>
  <a-card :bordered="false">
    <leaflet-map
      @onMapInit="initMap"
      :cursor="mapMark.cursorStyle"
      style="height:50vh"
    />
    <div class="table-operator">
      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item
            key="1"
            @click="handleCloseMapMark"
            v-if="mapMark.isOpen"
          >
            <a-icon type="undo" />撤销标注
          </a-menu-item>
          <a-menu-item key="1" @click="handleCreateMark" v-else>
            <a-icon type="edit" />手动标注
          </a-menu-item>
          <a-menu-item key="2"> <a-icon type="export" />批量上传</a-menu-item>
        </a-menu>
        <a-button type="primary" icon="plus">
          新增
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
      <a-button @click="handleClearMap" v-show="viewMarkedBtnVisible">
        <a-icon type="undo" />清空地图
      </a-button>
      <a-button
        type="primary"
        @click="drawer.visible = true"
        v-show="viewMarkedBtnVisible"
      >
        <a-icon type="eye" />查看已选数据
      </a-button>
      <a-dropdown v-show="tableOpsVisible">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="handleDeleteByIds">
            <a-icon type="delete" />删除
          </a-menu-item>
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

    <form-drawer
      :title="'预设卡口方案坐标点数据集'"
      :visible="drawer.visible"
      :showFooter="!drawer.isPreview"
      :dataSource="checkpoints"
      @close="drawer.visible = false"
      @ok="handleSavePresetPlan"
    />
  </a-card>
</template>
<script>
import LeafletMap from '@/components/LeafletMap'
import * as L from 'leaflet'
import { STable } from '@/components'
import presetPlanApi from '@/api/presetplan'
import pick from 'lodash.pick'
import FormDrawer from './modules/FormDrawer'
// import { CheckPointIcon } from '@/utils/leafletHelper'

export default {
  name: 'PresetPlanList',
  components: {
    LeafletMap,
    STable,
    FormDrawer
  },
  data() {
    return {
      map: {},
      markerLayerGroup: null,
      checkpoints: [],
      mapMark: {
        isOpen: false,
        cursorStyle: null
      },
      drawer: {
        isPreview: false,
        visible: false,
        tableColumns: [
          {
            title: '纬度',
            dataIndex: 'lat'
          },
          {
            title: '经度',
            dataIndex: 'lng'
          }
        ],
        presetForm: {}
      },
      // 表头
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
        return presetPlanApi
          .list(queryParam)
          .then(res => {
            this.$log.debug('预设卡口方案列表数据:', res.data)
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
    viewMarkedBtnVisible() {
      return this.checkpoints.length > 0
    }
  },
  methods: {
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    clearSelected() {
      // 清空 table 已选中项
      this.selectedRows = []
      this.selectedRowKeys = []
    },
    initMap(map) {
      this.map = map
      this.markerLayerGroup = L.featureGroup().addTo(this.map)
    },
    handleClearMap() {
      // 从集合中删除marker
      this.markerLayerGroup.clearLayers()
      this.map.off('click')
      this.mapMark.isOpen = false
      this.mapMark.cursorStyle = null
      this.checkpoints = []
    },
    handleCreateMark() {
      this.handleResetForm()
      this.handleOpenMapMark()
    },
    handlePreviewPlan(record) {
      this.drawer.isPreview = true
      this.handleResetForm()
      // 获取数据
      presetPlanApi.getById(record.id).then(res => {
        this.$log.debug('预览卡口方案:', res.data)
        var checkpoints = res.data.checkpoints || []
        // 回显表单数据
        this.handleFillPresetForm(res.data, checkpoints)
        // 绘制点
        checkpoints.forEach(point => {
          var marker = L.marker([point.lat, point.lng], { draggable: false })
          this.markerLayerGroup.addLayer(marker)
        })
        this.map.fitBounds(this.markerLayerGroup.getBounds())
      })
    },
    handleEditPlan(record) {
      this.drawer.isPreview = false
      // 先重置表单
      this.handleResetForm()
      // 获取数据
      presetPlanApi.getById(record.id).then(res => {
        this.$log.debug('编辑卡口方案:', res.data)
        var checkpoints = res.data.checkpoints || []
        // 回显表单数据
        this.handleFillPresetForm(res.data, checkpoints)
        // 绘制点
        checkpoints.forEach(point => {
          var marker = L.marker([point.lat, point.lng], { draggable: true })
          // // 为marker添加相应事件
          marker.on('click', e => this.handleOnMarkerClick(e))
          this.markerLayerGroup.addLayer(marker)
        })
        this.map.fitBounds(this.markerLayerGroup.getBounds())
      })
      // 开启地图标注
      this.handleOpenMapMark()
    },
    handleDeleteById(record) {
      presetPlanApi.deleteById(record.id).then(res => {
        this.$message.success('删除成功')
        this.handleReloadTable()
      })
    },
    handleDeleteByIds() {
      this.$confirm({
        title: '你确定要删除选中的预设卡口点吗?',
        onOk() {
          presetPlanApi.deleteByIds(this.selectedRowKeys).then(res => {
            this.$message.success('删除成功')
            this.handleReloadTable()
          })
        },
        onCancel() {}
      })
    },
    handleFillPresetForm(presetPlan, checkpoints) {
      this.checkpoints = checkpoints
      this.drawer.presetForm = pick(presetPlan, 'id', 'name', 'description')
    },
    handleOpenMapMark() {
      // 为地图注册点击事件，为了防止事件重复绑定，绑定前先解除先前的事件绑定
      // 但是注意，一定要指明解除什么事件的绑定，否则会解除所有绑定事件
      this.map.off('click').on('click', e => {
        var point = e.latlng
        this.checkpoints.push(point)
        // 返回的实际是markerLayer层
        var marker = L.marker([point.lat, point.lng], { draggable: true })
        this.markerLayerGroup.addLayer(marker)
        // // 为marker添加相应事件
        marker.on('click', e => this.handleOnMarkerClick(e))
      })

      this.mapMark.isOpen = true
      this.mapMark.cursorStyle = 'crosshair'

      this.$notification.info({
        message: '提示',
        description: '已开启地图标注功能，请手动点击地图标记卡口位置'
      })
    },
    handleCloseMapMark() {
      var that = this
      this.$confirm({
        title: '撤销标注将清除所有标记,是否继续?',
        onOk() {
          that.handleClearMap()
        },
        onCancel() {}
      })
    },
    handleOnMarkerClick(e) {
      // 保存this对象
      var that = this
      this.$confirm({
        title: '你确定要删除该预设卡口点吗?',
        onOk() {
          // 从marker map中删除
          that.checkpoints = that.checkpoints.filter(item => {
            return item.lat !== e.latlng.lat && item.lng !== e.latlng.lng
          })
          // 从集合中删除marker
          that.markerLayerGroup.removeLayer(e.target)
        },
        onCancel() {}
      })
    },
    handleSavePresetPlan(values) {
      var presetForm = Object.assign({}, values)
      presetForm.checkpoints = this.checkpoints
      presetPlanApi.createOrUpdate(presetForm).then(res => {
        this.$message.success('保存成功')
        this.handleResetForm()
        this.handleReloadTable()
      })
    },
    handleResetForm() {
      this.checkpoints = []
      this.drawer.visible = false
      this.handleClearMap()
    },
    handleReloadTable() {
      // 刷新表格
      this.$refs.table.refresh()
    }
  }
}
</script>
