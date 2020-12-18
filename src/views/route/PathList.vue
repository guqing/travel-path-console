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
            <template slot="action">
              <a href="javascript:void(0)">
                预览
              </a>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
<script>
import LeafletMap from '@/components/LeafletMap'
import routeApi from '@/api/route'
export default {
  name: 'PathList',
  components: {
    LeafletMap
  },
  data() {
    return {
      map: {},
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
    }
  }
}
</script>
