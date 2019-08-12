<template>
  <a-card :bordered="false">
    <div class="map-wrapper">
      <div id="mapContainer"></div>
    </div>
    <div class="table-operator operator-btn-group">
      <a-button type="primary" icon="plus" @click="createScheme">新建方案</a-button>
      <a-button type="dashed" v-if="drawerBtnVisible" @click="showPresetSchemeDrawer">查看已选数据</a-button>

      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1">
            <a-icon type="delete" />删除</a-menu-item>
          <!-- lock | unlock -->
          <a-menu-item key="2">
            <a-icon type="export" />导出</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <s-table
      ref="table"
      size="default"
      rowKey="id"
      :columns="columns"
      :data="loadData"
      :alert="{ show: true, clear: true }"
      :rowSelection="{ selectedRowKeys: this.selectedRowKeys, onChange: this.onSelectChange }">
      <template
        v-for="(col, index) in columns"
        v-show="col.scopedSlots"
        :slot="col.dataIndex"
        slot-scope="text, record">
        <div :key="index">
          <a-input
            v-if="record.editable"
            style="margin: -5px 0"
            :value="text"
            @change="e => handleChange(e.target.value, record.key, col, record)" />
          <template v-else>{{ text }}</template>
        </div>
      </template>
      <template slot="action" slot-scope="text, record">
        <div class="editable-row-operations">
          <span v-if="record.editable">
            <a @click="() => save(record)">保存</a>
            <a-divider type="vertical" />
            <a-popconfirm title="真的放弃编辑吗?" @confirm="() => cancel(record)">
              <a>取消</a>
            </a-popconfirm>
          </span>
          <span v-else>
            <a class="show" @click="() => showData(record)">查看</a>
            <a-divider type="vertical" />
            <a class="edit" @click="() => edit(record)">修改</a>
            <a-divider type="vertical" />
            <a class="delete" @click="() => del(record)">删除</a>
          </span>
        </div>
      </template>
    </s-table>

    <div>
      <a-drawer
        title="Basic Drawer"
        width="420"
        placement="right"
        :closable="false"
        :visible="drawerVisible"
        @close="onDrawerClose">
        <a-table
          :columns="drawTableColumns"
          rowKey="lat"
          :dataSource="markerDataArray"
          bordered>
        </a-table>
      </a-drawer>
    </div>
  </a-card>
</template>

<script>
import { STable } from '@/components'
import * as L from 'leaflet'
import '@/mystatic/js/loadTiles'
import { HashTable } from '@/mystatic/js/HashTable'
import { tileUrl } from '@/api/tile'
import { presetMarkerOption } from '@/mystatic/js/common'
import moment from 'moment'

export default {
  name: 'PresetSchemeList',
  components: {
    STable
  },
  data () {
    return {
      drawerBtnVisible: false,
      drawerVisible: false,
      markerCount: 0,
      markerDataArray: [],
      markerHashTable: new HashTable(), // 创建一个hashTable容器
      tempPointString: '',
      map: null,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      // 表头
      columns: [
        {
          title: '编号',
          dataIndex: 'id',
          key: 'id',
          customRender: function (text, record, index) {
            // 行号
            return index + 1
          }
        },
        {
          title: '方案名称',
          dataIndex: 'name',
          scopedSlots: { customRender: 'name' }
        },
        {
          title: '方案备注',
          dataIndex: 'description',
          scopedSlots: { customRender: 'description' }
        },
        {
          title: '数据量',
          dataIndex: 'bayonetCount',
          sorter: true,
          scopedSlots: { customRender: 'modifyTime' }
        },
        {
          title: '创建时间',
          dataIndex: 'modifyTime',
          sorter: true,
          scopedSlots: { customRender: 'modifyTime' },
          customRender: function (text, record, index) {
            return moment(text).format('YYYY-MM-DD')
          }
        },
        {
          table: '操作',
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        return this.$http.get('/preset/list', {
          params: Object.assign(parameter, this.queryParam)
        }).then(res => {
          return res.data
        }).catch(err => {
          this.$notification.error({
            message: '失败',
            description: '获取预设卡口方案列表失败：' + err.message
          })
        })
      },
      selectedRowKeys: [],
      selectedRows: [],
      drawTableColumns: [{
        title: '维度',
        dataIndex: 'lat'
      }, {
        title: '经度',
        dataIndex: 'lng'
      }]
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
    handleChange (value, key, column, record) {
      console.log(value, key, column)
      record[column.dataIndex] = value
    },
    edit (row) {
      console.log(row)
      row.editable = true
      console.log('编辑')
      // row = Object.assign({}, row)
    },
    // eslint-disable-next-line
    del (row) {
      this.$confirm({
        title: '警告',
        content: `真的要删除 ${row.no} 吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          console.log('OK')
          // 在这里调用删除接口
          return new Promise((resolve, reject) => {
            setTimeout(Math.random() > 0.5 ? resolve : reject, 1000)
          }).catch(() => console.log('Oops errors!'))
        },
        onCancel () {
          console.log('Cancel')
        }
      })
    },
    showData (row) {
      row.editable = false
    },
    save (row) {
      // 保存编辑
      row.editable = false
      console.log('保存编辑')
    },
    cancel (row) {
      row.editable = false
      console.log('取消保存')
    },

    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    createScheme () {
      this.$notification.info({
        message: '提示',
        description: '已开启地图标注功能，请手动点击地图标记卡口位置'
      })
      // 为地图注册点击事件
      this.map.on('click', e => this.handleMapClick(e))
    },
    handleMapClick (e) {
      var point = e.latlng
      var marker = L.marker([point.lat, point.lng], presetMarkerOption).addTo(this.map)

      // 将marker添加到hashTable中,先转换为字符串在添加到hash否则会出现精度失真
      var pointJSONString = JSON.stringify(point)
      this.markerHashTable.add(pointJSONString, marker)
      // marker标记点数量+1
      this.markerCount++

      // 为marker添加相应事件
      marker.on('click', e => this.handleOnMarkerClick(e))
      marker.on('dragstart', e => this.handleOnMarkerDragstart(e))
      marker.on('moveend', e => this.handlerOnMarkerMoveEnd(e))
    },
    handleOnMarkerClick (e) {
      // 标记物点击事件
      var point = JSON.stringify(e.target.getLatLng())
      // 保存this对象
      var that = this
      this.$confirm({
        title: '你确定要删除该预设卡口点吗?',
        onOk () {
          var marker = that.markerHashTable.getValue(point)
          that.map.removeLayer(marker)
          // marker标记点数量-1
          this.markerCount--
        },
        onCancel () { }
      })
    },
    handleOnMarkerDragstart (e) {
      // 标记点开始被拖拽时记录下被拖拽的标记，用于修改hash中的记录
      var tempPoint = e.target.getLatLng()
      this.tempPointString = JSON.stringify(tempPoint)
    },
    handlerOnMarkerMoveEnd (e) {
      var point = e.target.getLatLng()
      var pointJSONString = JSON.stringify(point)
      if (this.tempPointString) {
        // 删除原来的marker
        this.markerHashTable.remove(this.tempPointString)
        // 插入移动后的新marker
        this.markerHashTable.add(pointJSONString, e.target)
      }
      // 置空，防止产生脏数据
      this.tempPointString = ''
    },
    showPresetSchemeDrawer () {
      // 打开抽屉
      this.drawerVisible = true
    },
    onDrawerClose () {
      // 关闭抽屉
      this.drawerVisible = false
    },
    markerHashDataConvert () {
      var array = []
      var keys = this.markerHashTable.getKeys()
      keys.forEach((item) => {
        var point = JSON.parse(item)
        array.push(point)
      })
      return array
    }
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
    /*
      'selectedRows': function (selectedRows) {
        this.needTotalList = this.needTotalList.map(item => {
          return {
            ...item,
            total: selectedRows.reduce( (sum, val) => {
              return sum + val[item.dataIndex]
            }, 0)
          }
        })
      }
      */
  }
}
</script>

<style lang="less" scoped>
.search {
  margin-bottom: 54px;
}

.fold {
  width: calc(100% - 216px);
  display: inline-block;
}

.operator {
  margin-bottom: 18px;
}

@media screen and (max-width: 900px) {
  .fold {
    width: 100%;
  }
}

.map-wrapper {
  margin-bottom: 24px;
}

#mapContainer {
  height: 500px;
}

.operator-btn-group {
  margin-bottom: 16px;
  button {
    margin-right: 8px;
  }
}
</style>
