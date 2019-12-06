<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="48">
          <a-col :md="8" :sm="24">
            <a-form-item label="角色ID">
              <a-input placeholder="请输入" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item label="状态">
              <a-select placeholder="请选择" default-value="2">
                <a-select-option value="2">全部</a-select-option>
                <a-select-option value="1">正常</a-select-option>
                <a-select-option value="0">禁用</a-select-option>
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

    <a-table size="default" rowKey="id" :pagination="pagination" :columns="columns" :dataSource="userData">
      <div slot="expandedRowRender" slot-scope="record" style="margin: 0">
        <a-row :gutter="24" :style="{ marginBottom: '12px' }">
          <a-col
            :span="12"
            v-for="(role, index) in record.role.permissions"
            :key="index"
            :style="{ marginBottom: '12px' }"
          >
            <a-col :lg="4" :md="24">
              <span>{{ role.permissionName }}：</span>
            </a-col>
            <a-col :lg="20" :md="24" v-if="role.actionEntitySet.length > 0">
              <a-tag color="cyan" v-for="(action, k) in role.actionEntitySet" :key="k">{{ action.description }}</a-tag>
            </a-col>
            <a-col :span="20" v-else>-</a-col>
          </a-col>
        </a-row>
      </div>
      <span slot="action" slot-scope="text, record">
        <a @click="handleEdit(record)">编辑</a>
        <a-divider type="vertical" />
        <a-dropdown>
          <a class="ant-dropdown-link"> 更多 <a-icon type="down" /> </a>
          <a-menu slot="overlay">
            <a-menu-item>
              <a href="javascript:;">详情</a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;">禁用</a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;">删除</a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </span>
    </a-table>

    <a-modal title="操作" style="top: 20px;" :width="800" v-model="visible" @ok="handleOk">
      <a-form :form="form" :layout="isMobile() ? 'vertical' : 'horizontal'">
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="唯一识别码"
          hasFeedback
          validateStatus="success"
        >
          <a-input placeholder="唯一识别码" v-model="mdl.id" id="no" disabled="disabled" />
        </a-form-item>

        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="角色名称"
          hasFeedback
          validateStatus="success"
        >
          <a-select v-model="mdl.roleInfo">
            <a-select-option v-for="role in selectRoleOptions" :key="role.roleId + '::' + role.roleName">
              {{ role.roleName }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="状态" hasFeedback validateStatus="warning">
          <a-select v-model="mdl.status">
            <a-select-option value="1">正常</a-select-option>
            <a-select-option value="0">禁用</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="描述" hasFeedback>
          <a-textarea :rows="5" v-model="mdl.description" placeholder="..." id="describe" />
        </a-form-item>

        <a-divider />

        <!-- <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label="拥有权限" hasFeedback>
          <a-row :gutter="16" v-for="(permission, index) in mdl.permissions" :key="index">
            <a-col :span="4"> {{ permission.permissionName }}： </a-col>
            <a-col :span="20">
              <a-checkbox-group :options="permission.actionsOptions" />
            </a-col>
          </a-row>
        </a-form-item> -->
      </a-form>
    </a-modal>
  </a-card>
</template>

<script>
import moment from 'moment'
import userApi from '@/api/user'
import { mixinDevice } from '@/utils/mixin'
import { getUserList, getRoleList } from '@/api/manage'
export default {
  name: 'UserList',
  mixins: [mixinDevice],
  data () {
    return {
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      userData: [],
      description: '列表使用场景：后台管理中的权限管理以及角色管理，可用于基于 RBAC 设计的角色权限控制，颗粒度细到每一个操作类型。',
      visible: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      form: this.$form.createForm(this),
      mdl: {}, // 权限
      roleList: [], // 数据库中所有角色
      selectRoleOptions: [],
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      // 表头
      columns: [
        {
          title: '唯一识别码',
          dataIndex: 'id'
        },
        {
          title: '用户名',
          dataIndex: 'username'
        },
        {
          title: '昵称',
          dataIndex: 'name'
        },
        {
          title: '角色名称',
          dataIndex: 'role.name'
        },
        {
          title: '状态',
          dataIndex: 'status',
          customRender: function (text, record, index) {
            return text === 1 ? '正常' : '禁用'
          }
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          sorter: true,
          customRender: function (text, record, index) {
            return moment(text).format('YYYY-MM-DD')
          }
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
    this.loadUserList()
  },
  methods: {
    loadUserList () {
      getUserList().then(res => {
        this.userData = res.data.list
        this.pagination.total = res.data.total
        console.log('getUserList.call()', res)
      })
    },
    handleEdit (record) {
      this.loadRoleList()
      this.mdl = Object.assign({}, {
        id: record.id,
        description: record.role.description,
        roleName: record.role.name,
        status: record.status,
        roleInfo: record.role.name
      })
      // this.mdl.permissions.forEach(permission => {
      //   permission.actionsOptions = permission.actionEntitySet.map(action => {
      //     return { label: action.description, value: action.action, defaultCheck: action.defaultCheck }
      //   })
      // })
      this.visible = true
    },
    handleOk () {
      var userRoleParam = this.mdl
      var roleInfo = this.mdl.roleInfo.split('::')
      userRoleParam.roleId = parseInt(roleInfo[0])
      userRoleParam.roleName = roleInfo[1]
      userRoleParam.roleInfo = null
      // 更新数据
      userApi.updateUserRole(userRoleParam).then(res => {
        if (res.code === 0) {
          this.visible = false
          this.loadUserList()
          this.$message.success('更新成功')
        } else {
          this.$message.error(`更新信息失败，error:${res.message}`)
        }
      }).catch(err => {
        this.$message.error(`更新信息失败，error:${err}`)
      })
    },
    onChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    loadRoleList () {
      getRoleList(this.pagination).then(res => {
        this.roleList = res.data.list
        this.selectRoleOptions = this.roleList.map(role => {
          return {
            roleId: role.id,
            roleName: role.name
          }
        })
      }).catch(err => {
        this.$notification.error({
          message: '错误',
          description: '获取角色列表失败，error:' + err
        })
      })
    }
  }
}
</script>
