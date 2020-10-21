<template>
  <a-card :bordered="false">
    <leaflet-map @onMapInit="initMap" />

    <div class="table-operator">
      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="handleCloseMapMark" v-if="mapMark.isOpen">
            <a-icon type="undo" />撤销标注
          </a-menu-item>
          <a-menu-item key="1" @click="handleOpenModal" v-else> <a-icon type="edit" />手动标注 </a-menu-item>
          <a-menu-item key="2"> <a-icon type="export" />批量上传</a-menu-item>
        </a-menu>
        <a-button type="primary" icon="plus">
          新增
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
      <a-button @click="handleClearMap"><a-icon type="undo" />清空地图 </a-button>
      <a-dropdown v-show="tableOpsVisible">
        <a-menu slot="overlay">
          <a-menu-item key="1"><a-icon type="delete" />删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /> </a-button>
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

    <preset-modal :visible="modalVisible" @ok="handleModalOk" @cancel="modalVisible = false" />
  </a-card>
</template>
<script>
import LeafletMap from '@/components/LeafletMap'
import * as L from 'leaflet'
import { STable } from '@/components'
import presetPlanApi from '@/api/presetplan'
import PresetModal from './modules/PresetModal'
import { PresetIcon, DesignIcon } from '@/utils/leafletHelper'

export default {
  name: 'DesignList',
  components: {
    LeafletMap,
    STable,
    PresetModal
  },
  data () {
    return {
      map: {},
      modalVisible: false,
      designMarkers: [],
      mapMark: {
        isOpen: false,
        cursorStyle: null
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
    checkpoints () {
      return this.designMarkers.map(marker => {
        return marker.getLatLng()
      })
    }
  },
  methods: {
    initMap (map) {
      this.map = map
      this.markerLayerGroup = L.featureGroup().addTo(this.map)
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleOpenModal () {
      this.modalVisible = true
    },
    handleModalOk (id) {
      this.modalVisible = false
      presetPlanApi.getById(id).then(res => {
        this.handleDrawMarkers(res.data.checkpoints, true)
      })
    },
    handleDrawMarkers (checkpoints, clickable) {
      checkpoints = checkpoints || []
      checkpoints.forEach(point => {
        var marker = L.marker([point.lat, point.lng], { icon: new PresetIcon() })
        this.markerLayerGroup.addLayer(marker)
        if (clickable) {
          marker.on('click', e => this.handleOnMarkerClick(e))
        }
      })
      this.map.fitBounds(this.markerLayerGroup.getBounds())
    },
    handleOnMarkerClick (e) {
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
    clearSelected () {
      // 清空 table 已选中项
      this.selectedRows = []
      this.selectedRowKeys = []
    },
    handleClearMap () {
      this.markerLayerGroup.clearLayers()
      this.designMarkers = []
    },
    handlePreviewPlan () {
    },
    handleEditPlan () {
    },
    handleDeleteById () {
    }
  }
}
</script>
