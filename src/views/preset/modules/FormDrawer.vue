<template>
  <a-drawer
    :title="title"
    :width="width"
    placement="right"
    :closable="false"
    :visible="visible"
    @close="handleOnClose"
  >
    <a-table
      :columns="columns"
      :rowKey="rowKey"
      :pagination="pagination"
      :dataSource="dataSource"
      bordered
    >
    </a-table>
    <a-form
      :form="form"
      :label-col="formItemLayout.labelCol"
      :wrapper-col="formItemLayout.wrapperCol"
    >
      <a-form-item label="方案名称">
        <a-input
          v-decorator="[
            'name',
            { rules: [{ required: true, message: '请输入方案名称' }] }
          ]"
        />
      </a-form-item>
      <a-form-item label="方案名称">
        <a-textarea
          :rows="4"
          v-decorator="[
            'description',
            { rules: [{ max: 240, message: '方案描述必须在240字以内' }] }
          ]"
        >
        </a-textarea>
      </a-form-item>
    </a-form>

    <div
      v-show="showFooter"
      :style="{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        borderTop: '1px solid #e8e8e8',
        padding: '10px 16px',
        textAlign: 'right',
        left: 0,
        background: '#fff',
        borderRadius: '0 0 4px 4px'
      }"
    >
      <a-button style="margin-right: 8px" @click="handleOnClose">
        取消
      </a-button>
      <a-button type="primary" @click="handleOnSave"> 保存 </a-button>
    </div>
  </a-drawer>
</template>
<script>
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 }
}
const columns = [
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
]
export default {
  name: 'FormDrawer',
  props: {
    title: {
      type: String,
      required: true
    },
    width: {
      type: Number,
      required: false,
      default: 450
    },
    visible: {
      type: Boolean,
      required: false,
      default: false
    },
    dataSource: {
      type: Array,
      required: true
    },
    columns: {
      type: Array,
      default: () => {
        return columns
      }
    },
    rowKey: {
      type: String,
      required: true
    },
    pagination: {
      type: Object,
      default: () => {
        return { pageSize: 5 }
      }
    },
    showFooter: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formItemLayout: formItemLayout,
      form: this.$form.createForm(this, { name: 'planForm' })
    }
  },
  methods: {
    handleOnClose() {
      this.form.resetFields()
      this.$emit('close')
    },
    handleOnSave() {
      this.form.validateFields((err, values) => {
        if (err) {
          return
        }
        this.$emit('ok', values)
      })
    }
  }
}
</script>
