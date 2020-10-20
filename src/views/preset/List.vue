<template>
  <a-card :bordered="false">
    <leaflet-map @onMapInit="initMap" :cursor="mapMark.cursorStyle" />
    <div class="table-operator">
      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="handleCloseMapMark" v-if="mapMark.isOpen">
            <a-icon type="undo" />撤销标注
          </a-menu-item>
          <a-menu-item key="1" @click="handleOpenMapMark" v-else> <a-icon type="edit" />手动标注 </a-menu-item>
          <a-menu-item key="2"> <a-icon type="export" />批量上传</a-menu-item>
        </a-menu>
        <a-button type="primary" icon="plus">
          新建方案
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
      <a-button type="dashed" @click="handleClearMap" v-show="viewMarkedBtnVisible">清空地图</a-button>

      <a-dropdown v-show="tableOpsVisible">
        <a-menu slot="overlay">
          <a-menu-item key="1"><a-icon type="delete" />删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /> </a-button>
      </a-dropdown>
      <a-button type="dashed" @click="drawer.visible = true" v-show="viewMarkedBtnVisible">查看已选数据</a-button>
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
      <template slot="action" slot-scope="text, record">
        <div class="editable-row-operations">
          <span>
            <a class="preview" @click="handlePreviewPlan(record)">预览</a>
            <a-divider type="vertical" />
            <a class="delete">删除</a>
          </span>
        </div>
      </template>
    </s-table>

    <a-drawer
      title="预设卡口方案坐标点数据集"
      width="420"
      placement="right"
      :closable="false"
      :visible="drawer.visible"
      @close="drawer.visible = false"
    >
      <a-table
        :columns="drawer.tableColumns"
        rowKey="lat"
        :pagination="{ pageSize: 5 }"
        :dataSource="checkpoints"
        bordered
      >
      </a-table>

      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="方案名称" required>
              <a-input v-model="drawer.presetForm.name" placeholder="请输入方案名称" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="方案描述">
              <a-textarea v-model="drawer.presetForm.description" placeholder="请输入方案描述,240字以内" :rows="4">
              </a-textarea>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <div
        :style="{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e8e8e8',
          padding: '10px 16px',
          textAlign: 'right',
          left: 0,
          background: '#fff',
          borderRadius: '0 0 4px 4px',
        }"
      >
        <a-button style="margin-right: 8px" @click="drawer.visible = false"> 取消 </a-button>
        <a-button type="primary" @click="handleSavePresetPlan"> 提交 </a-button>
      </div>
    </a-drawer>
  </a-card>
</template>
<script>
import LeafletMap from '@/components/LeafletMap'
import * as L from 'leaflet'
import { STable } from '@/components'
import presetPlanApi from '@/api/presetplan'
import pick from 'lodash.pick'
// import { CheckPointIcon } from '@/utils/leafletHelper'

export default {
  name: 'PresetPlanList',
  components: {
    LeafletMap,
    STable
  },
  data () {
    return {
      map: {},
      markerLayerGroup: null,
      checkpoints: [],
      mapMark: {
        isOpen: false,
        cursorStyle: null
      },
      drawer: {
        visible: false,
        tableColumns: [{
          title: '纬度',
          dataIndex: 'lat'
        }, {
          title: '经度',
          dataIndex: 'lng'
        }],
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
        return presetPlanApi.list(queryParam).then(res => {
          this.$log.debug('预设卡口方案列表数据:', res.data)
          return {
            pageSize: res.data.pageSize,
            pageNo: res.data.current,
            totalCount: res.data.total,
            totalPage: res.data.pages,
            data: res.data.list
          }
        }).catch(err => {
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
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    },
    tableOpsVisible () {
      return this.selectedRowKeys.length > 0
    },
    viewMarkedBtnVisible () {
      return this.checkpoints.length > 0
    }
  },
  methods: {
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    clearSelected () {
      // 清空 table 已选中项
      this.selectedRows = []
      this.selectedRowKeys = []
    },
    initMap (map) {
      this.map = map
      this.markerLayerGroup = L.featureGroup().addTo(this.map)
    },
    handleClearMap () {
      this.markerLayerGroup.clearLayers()
      this.checkpoints = []
    },
    handlePreviewPlan (record) {
      // 先清空, 否则会叠加
      this.markerLayerGroup.clearLayers()
      // 获取数据
      presetPlanApi.getById(record.id).then(res => {
        this.$log.debug('预览卡口方案:', res.data)
        var checkpoints = res.data.checkpoints || []
        // 回显表单数据
        this.handleFillPresetForm(res.data, checkpoints)
        // 绘制点
        checkpoints.forEach(point => {
          var marker = L.marker([point.lat, point.lng], { draggable: true })
          this.markerLayerGroup.addLayer(marker)
        })
        this.map.fitBounds(this.markerLayerGroup.getBounds())
      })
    },
    handleFillPresetForm (presetPlan, checkpoints) {
      this.checkpoints = checkpoints
      this.drawer.presetForm = pick(presetPlan, 'name', 'count', 'description')
    },
    handleOpenMapMark () {
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
    handleCloseMapMark () {
      var that = this
      this.$confirm({
        title: '撤销标注将清除所有标记,是否继续?',
        onOk () {
          // 从集合中删除marker
          that.markerLayerGroup.clearLayers()
          that.map.off('click')
          that.mapMark.isOpen = false
          that.mapMark.cursorStyle = null
        },
        onCancel () { }
      })
    },
    handleOnMarkerClick (e) {
      // 保存this对象
      var that = this
      this.$confirm({
        title: '你确定要删除该预设卡口点吗?',
        onOk () {
          // 从marker map中删除
          that.checkpoints = that.checkpoints.filter(item => {
            return item.lat !== e.latlng.lat && item.lng !== e.latlng.lng
          })
          // 从集合中删除marker
          that.markerLayerGroup.removeLayer(e.target)
        },
        onCancel () { }
      })
    },
    handleSavePresetPlan () {
      var presetForm = Object.assign({}, this.drawer.presetForm)
      presetForm.checkpoints = this.checkpoints
      presetPlanApi.create(presetForm).then(res => {
        this.$message.success('添加成功')
        this.handleResetForm()
      })
    },
    handleResetForm () {
      this.checkpoints = []
      this.markerLayerGroup.clearLayers()
      this.drawer.presetForm = {}
      this.drawer.visible = false
      // 刷新表格
      this.$table.refresh()
    }
  }
}
</script>
