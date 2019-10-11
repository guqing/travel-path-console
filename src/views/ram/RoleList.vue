<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="角色名称">
              <a-input placeholder="请输入"/>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="状态">
              <a-select placeholder="请选择" default-value="0">
                <a-select-option value="0">全部</a-select-option>
                <a-select-option value="1">正常</a-select-option>
                <a-select-option value="2">禁用</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary">查询</a-button>
              <a-button style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="$refs.modal.add()">新建</a-button>
    </div>

    <a-table
      ref="table"
      size="default"
      :columns="columns"
      rowKey="id"
      :dataSource="roleList"
      :pagination="pagination"
    >
      <div
        slot="expandedRowRender"
        slot-scope="record"
        style="margin: 0">
        <a-row
          :gutter="24"
          :style="{ marginBottom: '12px' }">
          <a-col :span="12" v-for="(role, index) in record.permissions" :key="index" :style="{ marginBottom: '12px' }">
            <a-col :span="4">
              <span>{{ role.permissionName }}：</span>
            </a-col>
            <a-col :span="20" v-if="role.actionEntitySet.length > 0">
              <a-tag color="cyan" v-for="(action, k) in role.actionEntitySet" :key="k">{{ action.description }}</a-tag>
            </a-col>
            <a-col :span="20" v-else>-</a-col>
          </a-col>
        </a-row>
      </div>
      <span slot="action" slot-scope="text, record">
        <a @click="$refs.modal.edit(record)">编辑</a>
        <a-divider type="vertical" />
        <a-dropdown>
          <a class="ant-dropdown-link">
            更多 <a-icon type="down" />
          </a>
          <a-menu slot="overlay">
            <a-menu-item>
              <a href="javascript:;">详情</a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;">禁用</a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;" @click="handleDeleteRole(record.id)">删除</a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </span>
    </a-table>

    <role-modal ref="modal" @ok="handleOk"></role-modal>
  </a-card>
</template>

<script>
import { getRoleList, deleteRole } from '@/api/manage'
import moment from 'moment'
import { STable } from '@/components'
import RoleModal from './modules/RoleModal'

export default {
  name: 'TableList',
  components: {
    STable,
    RoleModal
  },
  data () {
    return {
      description: '列表使用场景：后台管理中的权限管理以及角色管理，可用于基于 RBAC 设计的角色权限控制，颗粒度细到每一个操作类型。',

      visible: false,

      form: null,
      mdl: {},

      roleList: null,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      // 表头
      columns: [
        {
          title: '唯一识别码',
          dataIndex: 'id'
        },
        {
          title: '角色名称',
          dataIndex: 'name'
        },
        {
          title: '状态',
          dataIndex: 'available',
          customRender: function (text, record) {
            return text === '1' ? '正常' : '禁用'
          }
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          customRender: function (index, text, record) {
            return moment(text).format('YYYY-MM-DD')
          },
          sorter: true
        }, {
          title: '操作',
          width: '150px',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      selectedRowKeys: [],
      selectedRows: []
    }
  },
  created () {
    this.loadRoleList()
  },
  methods: {
    loadRoleList () {
      getRoleList(this.pagination).then(res => {
        this.roleList = res.data.list
      }).catch(err => {
        this.$notification.error({
          message: '错误',
          description: '获取角色列表失败，error:' + err
        })
      })
    },
    handleOk () {
      // 新增/修改 成功时，重载列表
      this.loadRoleList()
    },
    handleDeleteRole (roleId) {
      var _this = this
      this.$confirm({
        title: '确定要删除该角色吗?',
        content: '警告',
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk () {
          deleteRole(roleId).then(res => {
            _this.loadRoleList()
            _this.$notification.success({
              message: '提示',
              description: '删除成功'
            })
          }).catch(err => {
            _this.$notification.error({
              message: '错误',
              description: '删除角色失败，error:' + err
            })
          })
        }
      })
    },
    onChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    }
  }
}
</script>
