<template>
  <a-modal
    :visible="visible"
    :width="680"
    title="选择预设卡口方案"
    @ok="handleOk"
    @cancel="
      () => {
        $emit('cancel')
      }
    "
  >
    <a-table
      :columns="columns"
      row-key="id"
      :customRow="customRow"
      :pagination="pagination"
      :loading="loading"
      :data-source="data"
      :rowSelection="rowSelection"
    >
    </a-table>
  </a-modal>
</template>
<script>
import presetPlanApi from '@/api/presetplan'
export default {
  name: 'PresetModal',
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      modalVisible: false,
      data: [],
      queryParam: {},
      pagination: {},
      loading: false,
      columns: [
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
        }
      ],
      selectedRowKeys: [],
      selectedRows: []
    }
  },
  computed: {
    rowSelection() {
      return {
        type: 'radio',
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    loadData() {
      presetPlanApi.list(this.queryParam).then(res => {
        const pagination = { ...this.pagination }
        pagination.total = res.data.total
        this.loading = false
        this.data = res.data.list
        this.pagination = pagination
      })
    },
    customRow(record, index) {
      return {
        on: {
          // 鼠标单击行
          click: () => {
            this.selectedRowKeys = [record.id]
            this.selectedRows = [record]
          }
        }
      }
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    handleOk() {
      if (this.selectedRowKeys.length > 0) {
        this.$emit('ok', this.selectedRowKeys[0])
      }
    }
  }
}
</script>
