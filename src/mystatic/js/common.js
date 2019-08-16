import moment from 'moment'

export const presetMarkerOption = {
  title: '预设卡口',
  draggable: true,
  autoPan: true
}

export const tableColums = [
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
]
