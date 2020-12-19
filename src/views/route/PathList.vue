<template>
  <div style="height:100%">
    <a-row :gutter="[16, 16]" style="height:100%">
      <a-col :xs="24" :sm="24" :md="24" style="height:60%">
        <leaflet-map @onMapInit="initMap" style="height:100%" />
      </a-col>
      <a-col :xs="24" :sm="24" :md="24" style="height:40%">
        <a-card :bordered="false">
          <a-table
            :columns="columns"
            :data-source="data"
            rowKey="id"
            :pagination="pagination"
            @change="handleTableChange"
          >
            <template slot="action" slot-scope="text, record">
              <a href="javascript:void(0)" @click="handlePreview(record)">
                预览
              </a>
              <a-divider type="vertical" />
              <a-popconfirm
                title="确定要删除这条轨迹吗?"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record)"
              >
                <a href="javascript:void(0)">
                  删除
                </a>
              </a-popconfirm>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
<script>
import * as L from 'leaflet'
import LeafletMap from '@/components/LeafletMap'
import routeApi from '@/api/route'
import { startIcon, endIcon } from '@/utils/leafletHelper'
import { createNumberedMarker } from '@/utils/leaflet/marker'

const polineActiveOption = { color: '#f5222d', weight: 5, opacity: 0.8 }

export default {
  name: 'PathList',
  components: {
    LeafletMap
  },
  data() {
    return {
      map: {},
      layerGroup: {},
      data: [],
      pagination: {},
      columns: [
        {
          title: 'ID',
          dataIndex: 'id'
        },
        {
          title: '车牌号',
          dataIndex: 'carNumber'
        },
        {
          title: '距离',
          dataIndex: 'distance',
          customRender: distance => distance.toFixed(2) + '米'
        },
        {
          title: '通行时间',
          dataIndex: 'time',
          customRender: time => (time / 1000).toFixed(2) + '秒'
        },
        {
          title: '平均速度',
          dataIndex: 'averageSpeed',
          customRender: averageSpeed => averageSpeed.toFixed(2) + 'km/h'
        },
        {
          title: '缓转弯',
          dataIndex: 'regularTurnCount'
        },
        {
          title: '急转弯',
          dataIndex: 'sharpTurnCount'
        },
        {
          title: '掉头',
          dataIndex: 'uturnCount'
        },
        {
          title: '创建时间',
          dataIndex: 'createTime'
        },
        {
          title: '操作',
          key: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ]
    }
  },
  created() {
    this.handleLoadData()
  },
  methods: {
    initMap(map) {
      this.map = map
    },
    handleLoadData() {
      routeApi.list().then(res => {
        const { list, total } = res.data
        this.data = list
        this.pagination.total = total
      })
    },
    handleTableChange(pagination) {
      const pager = { ...this.pagination }
      pager.current = pagination.current
      this.pagination = pager
      this.handleLoadData()
    },
    handlePreview(record) {
      routeApi.getById(record.id).then(res => {
        const { points, checkpoints } = res.data
        this.drwaPath(points, checkpoints)
      })
    },
    drwaPath(points, checkpoints) {
      let waypointIndex = 1
      const layers = []
      for (let i = 0; i < checkpoints.length; i++) {
        const point = checkpoints[i]
        if (i === 0) {
          const startMarker = L.marker(point, { icon: startIcon })
          layers.push(startMarker)
        } else if (i === checkpoints.length - 1) {
          const endMarker = L.marker(point, { icon: endIcon })
          layers.push(endMarker)
        } else {
          // 绘制途径点
          const waypointMarker = createNumberedMarker(point, waypointIndex)
          layers.push(waypointMarker)
          waypointIndex++
        }
      }
      // 绘制轨迹
      var polyline = L.polyline(points, polineActiveOption)
      layers.push(polyline)

      this.layerGroup = L.featureGroup(layers).addTo(this.map)
      this.map.fitBounds(this.layerGroup.getBounds())
    },
    handleDelete(record) {
      routeApi.deleteById(record.id).then(res => {
        this.$message.success('删除成功')
        this.handleLoadData()
      })
    }
  }
}
</script>
