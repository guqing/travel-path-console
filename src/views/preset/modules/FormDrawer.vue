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
      :rowKey="
        (record, index) => {
          return index
        }
      "
      :pagination="pagination"
      :dataSource="dataSource"
      bordered
    >
      <span slot="serial" slot-scope="text, record, index">
        {{ index + 1 }}
      </span>
    </a-table>
    <a-form-model
      ref="form"
      :model="form"
      :rules="rules"
      :label-col="formItemLayout.labelCol"
      :wrapper-col="formItemLayout.wrapperCol"
    >
      <a-form-model-item label="方案名称">
        <a-input v-model="form.name" />
      </a-form-model-item>
      <a-form-model-item label="方案名称">
        <a-textarea v-model="form.description" :rows="4"> </a-textarea>
      </a-form-model-item>
    </a-form-model>

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
      <a-button style="margin-right: 8px" @click="handleCancel">
        取消
      </a-button>
      <a-button type="primary" @click="handleOnSave"> 保存 </a-button>
    </div>
  </a-drawer>
</template>
<script>
import pick from 'lodash.pick'

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
    title: '纬度',
    dataIndex: 'lat'
  },
  {
    title: '经度',
    dataIndex: 'lng'
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
    pagination: {
      type: Object,
      default: () => {
        return { pageSize: 5, total: 0 }
      }
    },
    showFooter: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {},
      rules: {
        name: [{ required: true, message: '请输入方案名称' }],
        description: [{ max: 240, message: '方案描述必须在240字以内' }]
      },
      formItemLayout: formItemLayout
    }
  },
  methods: {
    edit(values) {
      this.form = pick(values, 'id', 'name', 'description')
    },
    reset() {
      this.form = {}
    },
    handleCancel() {
      this.reset()
      this.$emit('cancel')
    },
    handleOnClose() {
      this.$emit('close')
    },
    handleOnSave() {
      this.$refs.form.validate(err => {
        if (err) {
          return
        }
        this.$emit('ok', this.form)
      })
    }
  }
}
</script>
