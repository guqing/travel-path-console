<template>
  <a-card :bordered="false">
    <div class="map-wrapper">
      <div id="mapContainer"></div>
    </div>
    <div class="table-operator operator-btn-group">
      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="openMapMark">
            <a-icon type="delete"/>手动标注</a-menu-item>
          <a-menu-item key="2" @click="uploadBtnHandle">
            <a-icon type="export" />批量上传</a-menu-item>
        </a-menu>
        <a-button type="primary" icon="plus">
          新建方案
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
      <a-button type="dashed" v-if="drawerBtnVisible" @click="showPresetSchemeDrawer">查看已选数据</a-button>

      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="3" @click="handleBatchDeleteScheme">
            <a-icon type="delete" />删除</a-menu-item>
          <!-- lock | unlock -->
          <a-menu-item key="4" @click="downloadSchemeToExcel">
            <a-icon type="export" />导出</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
    </div>

    <div>
      <a-alert
        banner
        style="margin-bottom: 16px"
        type="info">
        <template slot="message">
          <span style="margin-right: 12px">已选择: <a style="font-weight: 600">{{ this.selectedRows.length }}</a></span>
          <span style="margin-right: 12px">
            预设卡口方案数据总计
            <a style="font-weight: 600">{{ pagination.total }} 条</a>
          </span>
          <a style="margin-left: 24px" v-show="selectedRows.length > 0" @click="clearSelected">清空</a>
        </template>
      </a-alert>
      <a-table
        ref="table"
        size="default"
        rowKey="id"
        :loading="loading"
        :pagination="pagination"
        :columns="columns"
        :dataSource="presetSchemeData"
        @showSizeChange="handlePaginationChange"
        @change="handlePaginationChange"
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
            <span>
              <a class="show" @click="() => showData(record)">查看</a>
              <a-divider type="vertical" />
              <a class="edit" @click="() => handleRecodeEdit(record)">修改</a>
              <a-divider type="vertical" />
              <a class="delete" @click="() => handleRecodeDelete(record)">删除</a>
            </span>
          </div>
        </template>
      </a-table>
    </div>
    <div>
      <a-drawer
        title="预设卡口方案坐标点数据集"
        width="420"
        placement="right"
        :closable="false"
        :visible="drawerVisible"
        @close="onDrawerClose">
        <a-table
          :columns="drawTableColumns"
          rowKey="lat"
          :pagination="{pageSize: 5}"
          :dataSource="markerDataArray"
          bordered>
        </a-table>

        <a-form
          layout="vertical">
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="方案名称">
                <a-input
                  v-model="presetSchemeForm.name"
                  placeholder="请输入方案名称"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="方案描述">
                <a-input
                  v-model="presetSchemeForm.description"
                  placeholder="请输入方案描述"
                />
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
          <a-button
            style="marginRight: 8px"
            @click="onDrawerClose"
          >
            取消
          </a-button>
          <a-button
            @click="createOrUpdatePresetPointScheme"
            type="primary">
            提交
          </a-button>
        </div>
      </a-drawer>
      <a-modal
        title="上传附件"
        v-model="uploadVisible"
        :footer="null"
        :afterClose="onUploadClose"
      >
        <upload
          name="file"
          accept=".xls,.xlsx"
          :uploadHandler="uploadExcelHandler"
        >
          <p class="ant-upload-drag-icon">
            <a-icon type="inbox" />
          </p>
          <p class="ant-upload-text">点击选择文件或将文件拖拽到此处</p>
          <p class="ant-upload-hint">支持单个或批量上传</p>
        </upload>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
import * as L from 'leaflet'
import '@/mystatic/js/loadTiles'
import { HashTable } from '@/mystatic/js/HashTable'
import { tileUrl } from '@/api/tile'
import presetApi from '@/api/presetScheme'
import { presetMarkerOption, tableColums } from '@/mystatic/js/common'
import Upload from '@/components/Upload/Upload'

export default {
  name: 'PresetSchemeList',
  components: {
    Upload
  },
  data () {
    return {
      uploadExcelHandler: presetApi.uploadScheme,
      uploadVisible: false,
      loading: false,
      presetSchemeForm: {},
      drawerBtnVisible: false,
      drawerVisible: false,
      featureGroup: new L.featureGroup(), // eslint-disable-line
      markerCount: 0, // marker标记点的数量
      markerDataArray: [], // maker标记的坐标点集合
      markerHashTable: new HashTable(), // 创建一个hashTable容器
      tempPointString: '',
      map: null,
      // 高级搜索 展开/关闭
      advanced: false,
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      // 查询参数
      queryParam: {},
      // 表头
      columns: tableColums,
      // 加载数据
      presetSchemeData: [],
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
    this.loadPresetData()
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
    loadPresetData () {
      this.loading = true

      // 构建分页查询参数
      var pagination = {
        current: this.pagination.current,
        pageSize: this.pagination.pageSize
      }

      presetApi.listScheme(pagination).then(res => {
        this.presetSchemeData = res.data.list
        this.pagination.total = res.data.total
        this.loading = false
      }).catch(err => {
        this.loading = false
        this.$notification.error({
          message: '失败',
          description: '获取预设卡口方案列表失败：' + err.message
        })
      })
    },
    handlePaginationChange (pagination, filters, sorter) {
      this.pagination.current = pagination.current
      this.loadPresetData()
    },
    handleChange (value, key, column, record) {
      console.log(value, key, column)
      record[column.dataIndex] = value
    },
    handleRecodeEdit (row) {
      // 开启地图点击监听事件
      this.openMapMark()

      // 设置方案id的值,用于编辑时作为主键
      this.presetSchemeForm.id = row.id

      // 查询方案坐标点集合回显到地图
      this.getPresetPointById(row.id, true)
    },
    // eslint-disable-next-line
    handleRecodeDelete (row) {
      var that = this
      this.$confirm({
        title: '警告',
        content: `真的要删除 ${row.name} 吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          presetApi.trash(row.id).then(res => {
            if (res.code === 0) {
              // 重新加载表格数据
              that.loadPresetData()
              that.$notification.success({
                message: '成功提示',
                description: '方案已放入回收站，可前往回收站恢复记录'
              })
            }
          }).catch(err => {
            that.$notification.error({
              message: '错误提示',
              description: '抱歉方案删除失败了，请稍后再试：' + err.message
            })
          })
        },
        onCancel () {
          console.log('Cancel')
        }
      })
    },
    handleBatchDeleteScheme () {
      var that = this
      var deleteSize = this.selectedRows.length
      this.$confirm({
        title: '警告',
        content: `确定要批量删除 ${deleteSize} 条记录吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          presetApi.batchTrash(that.selectedRowKeys).then(res => {
            if (res.code === 0) {
              // 重新加载表格数据
              that.loadPresetData()
              that.$notification.success({
                message: '提示',
                description: '方案数据已批量丢进放入回收站'
              })
            }
          }).catch(err => {
            that.$notification.error({
              message: '错误',
              description: '抱歉方案删除失败了，请稍后再试：' + err.message
            })
          })
        },
        onCancel () {
          console.log('Cancel')
        }
      })
    },
    showData (row) {
      this.getPresetPointById(row.id, false)
    },
    getPresetPointById (id, eventFlag) {
      presetApi.getScheme(id).then(res => {
        if (res.code === 0) {
          var pointList = res.data.list

          // 批量将标记点绘制到地图上
          this.batchDrawMarkers(pointList, eventFlag)
        }
      }).catch(err => {
        this.$notification.error({
          message: '错误提示',
          description: '抱歉，查看方案信息失败，请稍后重试：' + err.message
        })
      })
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    clearSelected () {
      // 清空 table 已选中项
      this.selectedRows = []
      this.selectedRowKeys = []
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    openMapMark () {
      // 为地图注册点击事件，为了防止事件重复绑定，绑定前先解除先前的事件绑定
      // 但是注意，一定要指明解除什么事件的绑定，否则会解除所有绑定事件
      this.map.off('click').on('click', e => this.handleMapClick(e))

      this.$notification.info({
        message: '提示',
        description: '已开启地图标注功能，请手动点击地图标记卡口位置'
      })
    },
    handleMapClick (e) {
      var point = e.latlng
      // 返回的实际是markerLayer层
      var marker = L.marker([point.lat, point.lng], presetMarkerOption).addTo(this.map)

      // 将markerLayer添加到marker结合中
      this.handleAddMarkerToColections(marker)

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
          // 从集合中删除marker
          that.handleRemoveMarkerFromColections(point)
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
      // 将hashTable中的坐标点字符串对象数据转换为对象数组
      var array = []
      var keys = this.markerHashTable.getKeys()
      keys.forEach((item) => {
        var point = JSON.parse(item)
        array.push(point)
      })
      return array
    },
    createOrUpdatePresetPointScheme () {
      // 填充表单
      const name = this.presetSchemeForm.name
      if (name === '' || name === undefined) {
        this.$notification.error({
          message: '表单校验错误提示',
          description: '方案名称不能为空'
        })
        return
      }
      this.presetSchemeForm.presetpoints = this.markerDataArray

      // 获取id判断是修改还是保存
      var preId = this.presetSchemeForm.id
      if (preId !== null && preId !== undefined && preId !== '') {
        // 如果predi不为空则编辑方案数据
        presetApi.updateScheme(this.presetSchemeForm).then(res => {
          // 重新加载表格数据
          this.loadPresetData()
          // 更新表格数据
          this.$notification.success({
            message: '更新成功',
            description: '方案数据更新成功'
          })
          // 清除标记物
          this.resetSchemeForm()
        }).catch(err => {
          this.$notification.error({
            message: '更新失败',
            description: '抱歉，方案数据更新失败了:' + err.message
          })
        })
      } else {
        // 保存方案数据
        presetApi.saveScheme(this.presetSchemeForm).then(res => {
          // 重新加载表格数据
          this.loadPresetData()
          // 更新表格数据
          this.$notification.success({
            message: '保存成功',
            description: '方案保存成功'
          })
          // 清除标记物
          this.resetSchemeForm()
        }).catch(err => {
          this.$notification.error({
            message: '失败',
            description: '抱歉，方案保存失败了，请刷新页面后重试:' + err.message
          })
        })
      }
    },
    resetSchemeForm () {
      this.markerCount = 0
      // 清除地图标记物
      var layers = this.markerHashTable.getValues()
      layers.forEach(layer => {
        layer.remove()
      })
      this.markerDataArray = []
      this.markerHashTable.clear()
    },
    batchDrawMarkers (pointList, eventFlag) {
      // 批量绘制之前先清空地图
      this.batchRemoveLayers()
      pointList.forEach(point => {
        var markerLayer = L.marker([point.lat, point.lng], presetMarkerOption).addTo(this.map)
        if (eventFlag) {
          markerLayer.on('click', this.handleOnMarkerClick)
        }
        // 纳入到featureGroup组管理
        this.featureGroup.addLayer(markerLayer)

        // 将markerLayer添加到markerHashTable中
        this.handleAddMarkerToColections(markerLayer)

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
    downloadSchemeToExcel () {
      presetApi.downloadScheme(this.selectedRowKeys).then(res => {
        // 这里res是返回的blob对象
        // application/vnd.openxmlformats-officedocument.spreadsheetml.sheet这里表示xlsx类型
        var blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' })
        var downloadElement = document.createElement('a')
        // 创建下载的链接
        var href = window.URL.createObjectURL(blob)
        downloadElement.href = href
        // 下载后文件名
        downloadElement.download = '预设卡口方案.xlsx'
        document.body.appendChild(downloadElement)
        // 模拟点击下载
        downloadElement.click()
        // 下载完成移除元素
        document.body.removeChild(downloadElement)
        // 释放掉blob对象
        window.URL.revokeObjectURL(href)

        // 清空表格选择项
        this.clearSelected()
      }).catch(err => {
        this.$notification.error({
          message: '错误提示',
          description: '抱歉，数据导出失败，请刷新页面后重试:' + err.message
        })
      })
    },
    uploadBtnHandle () {
      this.uploadVisible = true
    },
    onUploadClose () {
      // 重新加载表格数据
      this.loadPresetData()
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
