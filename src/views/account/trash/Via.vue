<template>
  <a-card :bordered="false">
    <div>
      <a-alert
        banner
        style="margin-bottom: 16px"
        type="info">
        <template slot="message">
          <span style="margin-right: 12px">已选择: <a style="font-weight: 600">{{ this.selectedRows.length }}</a></span>
          <span style="margin-right: 12px">
            途经卡口方案数据总计
            <a style="font-weight: 600">{{ pagination.total }} 条</a>
          </span>
          <a style="margin-left: 24px" v-show="selectedRows.length > 0" @click="clearSelected">清空</a>
          <a style="margin-left: 24px" v-show="selectedRows.length > 0" @click="handleBatchDelete">批量删除</a>
        </template>
      </a-alert>
      <a-table
        ref="table"
        size="default"
        rowKey="id"
        :loading="loading"
        :pagination="pagination"
        :columns="columns"
        :dataSource="viaSchemeData"
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
              <a class="show" @click="() => handleRecover(record)">恢复</a>
              <a-divider type="vertical" />
              <a class="delete" @click="() => handleRecodeDelete(record)">删除</a>
            </span>
          </div>
        </template>
      </a-table>
    </div>
  </a-card>
</template>

<script>
import trashApi from '@/api/trash'
import { tableColums } from '@/mystatic/js/common'

export default {
  name: 'ViaSchemeTrash',
  data () {
    return {
      loading: false,
      selectedRowKeys: [],
      selectedRows: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      columns: tableColums,
      viaSchemeData: []
    }
  },
  mounted () {
    this.loadData()
  },
  methods: {
    loadData () {
      this.loading = true

      // 构建分页查询参数
      var pagination = {
        current: this.pagination.current,
        pageSize: this.pagination.pageSize
      }

      trashApi.queryViaList(pagination).then(res => {
        this.viaSchemeData = res.data.list
        this.pagination.total = res.data.total
        this.loading = false
      }).catch(err => {
        this.loading = false
        this.$notification.error({
          message: '失败',
          description: '获取路径方案列表失败：' + err.message
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
    handleChange (value, key, column, record) {
      console.log(value, key, column)
      record[column.dataIndex] = value
    },
    handlePaginationChange (pagination, filters, sorter) {
      this.pagination.current = pagination.current
      this.loadPresetData()
    },
    handleRecodeDelete (record) {
      var id = record.id
      var that = this
      this.$confirm({
        title: '确定要彻底删除这条数据吗?',
        content: '如果彻底删除该数据，将不可恢复，请谨慎操作',
        onOk () {
          trashApi.deleteViaById(id).then(res => {
            that.$message.success(`删除成功`)
            that.loadData()
          }).catch(err => {
            that.$message.error(`操作失败，error: ${err}`)
          })
        },
        onCancel () {}
      })
    },
    handleBatchDelete () {
      var ids = this.selectedRowKeys
      var that = this
      this.$confirm({
        title: '确定要彻底删除这些数据吗?',
        content: '如果彻底删除数据，将不可恢复，请谨慎操作',
        onOk () {
          trashApi.batchDeleteVia(ids).then(res => {
            that.$message.success('删除成功')
            that.loadData()
          }).catch(err => {
            that.$message.error(`操作失败，error: ${err}`)
          })
        },
        onCancel () {}
      })
    }
  }
}
</script>
