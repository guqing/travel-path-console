<template>
  <a-card :bordered="false">
    <div class="map-wrapper">
      <div id="mapContainer"></div>
    </div>
    <div class="table-operator operator-btn-group">
      <a-dropdown>
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="handleQueryActualPointList">
            <a-icon type="delete"/>手动标注</a-menu-item>
          <a-menu-item key="2" @click="uploadBtnHandle">
            <a-icon type="export" />批量上传</a-menu-item>
        </a-menu>
        <a-button type="primary" icon="plus">
          新建方案
          <a-icon type="down" />
        </a-button>
      </a-dropdown>
      <a-button type="dashed" v-if="drawerBtnVisible" @click="showSchemeDrawer">查看已选数据</a-button>

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
            布设卡口方案数据总计
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
        :dataSource="routeBayonetData"
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
        title="布设卡口方案坐标点数据集"
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
              <a-form-item label="车牌号" required>
                <a-input
                  v-model="routeBayonetForm.carNumber"
                  placeholder="请输入车牌号码"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="方案名称" required>
                <a-input
                  v-model="routeBayonetForm.name"
                  placeholder="请输入方案名称"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="方案描述">
                <a-textarea
                  v-model="routeBayonetForm.description"
                  placeholder="请输入方案描述，240字以内"
                  :rows="4"
                >
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
          <a-button
            style="marginRight: 8px"
            @click="onDrawerClose"
          >
            取消
          </a-button>
          <a-button
            @click="createOrUpdatePointScheme"
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
      <a-modal
        title="布设卡口方案列表"
        :footer="null"
        @cancel="handleLayoutListModalCancel"
        :visible="layoutBayonetListModalVisible"
      >
        <ListScheme
          :columns="columns"
          :queryHandle="actualQueryHandle"
          @view="handleShowModalTableRecord"
        >
        </ListScheme>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
import * as L from 'leaflet'
import '@/mystatic/js/loadTiles'
import { HashTable } from '@/mystatic/js/HashTable'
import { tileUrl } from '@/api/tile'
import actualApi from '@/api/actualScheme'
import routeBayonetApi from '@/api/routeBayonet'
import { tableColums, generateCarNumber } from '@/mystatic/js/common'
import Upload from '@/components/Upload/Upload'
import ListScheme from '@/components/ListScheme/ListScheme'
import fileDownload from 'js-file-download'

export default {
  name: 'RouteBayonetList',
  components: {
    Upload,
    ListScheme
  },
  data () {
    return {
      actualId: null,
      actualQueryHandle: actualApi.listScheme,
      layoutBayonetListModalVisible: false,
      uploadExcelHandler: routeBayonetApi.uploadScheme,
      uploadVisible: false,
      loading: false,
      routeBayonetForm: {},
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
      routeBayonetData: [],
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
    this.loadRouteBayonetData()
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
    loadRouteBayonetData () {
      this.loading = true

      // 构建分页查询参数
      var pagination = {
        current: this.pagination.current,
        pageSize: this.pagination.pageSize
      }

      routeBayonetApi.listScheme(pagination).then(res => {
        this.routeBayonetData = res.data.list
        this.pagination.total = res.data.total
        this.loading = false
      }).catch(err => {
        this.loading = false
        this.$notification.error({
          message: '失败',
          description: '获取布设卡口方案列表失败：' + err.message
        })
      })
    },
    handlePaginationChange (pagination, filters, sorter) {
      this.pagination.current = pagination.current
      this.loadRouteBayonetData()
    },
    handleChange (value, key, column, record) {
      console.log(value, key, column)
      record[column.dataIndex] = value
    },
    handleRecodeEdit (row) {
      // 设置方案id的值,用于编辑时作为主键
      this.routeBayonetForm.id = row.id
      this.$set(this.routeBayonetForm, 'name', row.name)
      this.$set(this.routeBayonetForm, 'description', row.description)

      // 根据方案中存储的布设卡口方案id即actualId查询布设卡口方案信息
      this.getActualPointById(row.actualId, true)
      // 查询方案坐标点集合回显到地图，此处第二个参数为true绘制圆形标记物
      this.getRouteBayonetPointById(row.id, true)
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
          routeBayonetApi.trash(row.id).then(res => {
            if (res.code === 0) {
              // 重新加载表格数据
              that.loadRouteBayonetData()
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
          routeBayonetApi.batchTrash(that.selectedRowKeys).then(res => {
            if (res.code === 0) {
              // 重新加载表格数据
              that.loadRouteBayonetData()
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
      this.getRouteBayonetPointById(row.id, false)
    },
    getActualPointById (id, eventFlag) {
      // 根据方案布设卡口方案id查询卡口方案信息
      actualApi.getScheme(id).then(res => {
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
    getRouteBayonetPointById (id, eventFlag) {
      routeBayonetApi.getScheme(id).then(res => {
        if (res.code === 0) {
          var pointList = res.data.list

          // 批量将标记点绘制到地图上
          if (eventFlag) {
            this.batchDrawCicleMarkers(pointList)
          } else {
            // 标记物事件开启标志为false，则使用下面的方法绘制
            this.batchDrawMarkers(pointList, eventFlag)
          }
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
    handleQueryActualPointList () {
      // 查询布设卡口方案信息而后弹出列表
      this.layoutBayonetListModalVisible = true
    },
    handleLayoutListModalCancel () {
      this.layoutBayonetListModalVisible = false
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
    showSchemeDrawer () {
      // 打开抽屉
      this.drawerVisible = true
      // 生成车牌号
      this.setCarNumber()
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
    setCarNumber () {
      // 生成车牌号
      this.$set(this.routeBayonetForm, 'carNumber', generateCarNumber())
    },
    validateBayonetForm () {
      const carNumber = this.routeBayonetForm.carNumber
      if (carNumber === '') {
        this.$notification.error({
          message: '表单校验错误提示',
          description: '车牌号码不能为空'
        })
        return false
      }

      const name = this.routeBayonetForm.name
      if (name === '' || name === undefined) {
        this.$notification.error({
          message: '表单校验错误提示',
          description: '方案名称不能为空'
        })
        return false
      }
      if (name.length > 140) {
        this.$notification.error({
          message: '表单校验错误提示',
          description: '方案名称长度不能超过140字'
        })
        return false
      }

      const description = this.routeBayonetForm.description
      if (description.length > 240) {
        this.$notification.error({
          message: '表单校验错误提示',
          description: '方案描述不能超过240字'
        })
        return false
      }
      return true
    },
    createOrUpdatePointScheme () {
      if (!this.validateBayonetForm()) {
        return
      }

      // 填充表单
      this.routeBayonetForm.bayonetPoints = this.markerDataArray

      // 获取id判断是修改还是保存
      var actualId = this.routeBayonetForm.id
      if (actualId !== null && actualId !== undefined && actualId !== '') {
        // 如果predi不为空则编辑方案数据
        routeBayonetApi.updateScheme(this.routeBayonetForm).then(res => {
          // 重新加载表格数据
          this.loadRouteBayonetData()
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
        // 保存方案需要设置布设卡口方案id
        this.routeBayonetForm.actualId = this.actualId

        // 保存方案数据
        routeBayonetApi.saveScheme(this.routeBayonetForm).then(res => {
          if (res.code === 0) {
            // 重新加载表格数据
            this.loadRouteBayonetData()
            // 更新表格数据
            this.$notification.success({
              message: '保存成功',
              description: '方案保存成功'
            })
            // 清除标记物
            this.resetSchemeForm()
          } else {
            this.$notification.warning({
              message: '警告',
              description: '抱歉，方案保存失败了，error:' + res.message
            })
          }
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
      // 关闭抽屉
      this.onDrawerClose()
      // 清除布设卡口方案
      this.batchRemoveLayers()
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
    downloadSchemeToExcel () {
      routeBayonetApi.downloadScheme(this.selectedRowKeys).then(res => {
        // 下载excel数据
        fileDownload(res, '布设卡口方案.xlsx')

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
      this.loadRouteBayonetData()
    },
    handleShowModalTableRecord (record) {
      // 点击查看预选卡口方案数据，将其坐标点集合绘制到地图上
      actualApi.getScheme(record.id).then(res => {
        if (res.code === 0) {
          var actualList = res.data.list
          // 保存预选卡口方案的id, 添加布设方案需要此参数
          this.actualId = record.id

          this.batchDrawMarkers(actualList, true)
          // 关闭预选卡口方案数据列表弹窗
          this.handleLayoutListModalCancel()
        }
      }).catch(err => {
        this.$notification.error({
          message: '错误提示',
          description: '抱歉，查看布设方案数据失败，请稍后重试:' + err.message
        })
      })
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
