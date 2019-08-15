<template>
  <div>
    <a-table
      :columns="columns"
      :rowKey="rowKey"
      :pagination="pagination"
      :dataSource="tableDataSource"
      :bordered="bordered"
      size="small"
      @showSizeChange="handlePaginationChange"
      @change="handlePaginationChange"
    >
      <template slot="action" slot-scope="text, record">
        <div class="editable-row-operations">
          <span>
            <a class="show" @click="() => showRecodeData(record)">查看</a>
          </span>
        </div>
      </template>
    </a-table>
  </div>
</template>

<script>
export default {
  name: 'ListScheme',
  props: {
    queryHandle: {
      type: Function,
      required: true
    },
    columns: {
      type: Array,
      required: true,
      default: () => []
    },
    rowKey: {
      type: String,
      required: false,
      default: 'id'
    },
    bordered: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      tableDataSource: [],
      pagination: {
        current: 1,
        pageSize: 5,
        total: 0
      }
    }
  },
  mounted () {
    this.loadTableData()
  },
  methods: {
    loadTableData () {
      this.queryHandle(this.pagination).then(res => {
        if (res.code === 0) {
          this.tableDataSource = res.data.list
          this.pagination.total = res.data.total
        }
      }).catch(err => {
        this.$notification.error({
          message: '错误提示',
          description: '抱歉，查询数据列表失败, 请稍后再试。 error:' + err.message
        })
      })
    },
    showRecodeData (record) {
      // 查看表格数据详情
      this.$emit('view', record)
    },
    handlePaginationChange (pagination, filters, sorter) {
      this.pagination.current = pagination.current
      this.loadTableData()
    }
  }
}
</script>

<style>
</style>
