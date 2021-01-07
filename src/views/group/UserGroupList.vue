<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="15">
          <a-col :md="4" :sm="24">
            <a-form-item>
              <a-input placeholder="名称" v-model="queryParam.name" />
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="handleSearch">查询</a-button>
              <a-button style="margin-left: 8px;" @click="handleSearchReset">
                重置
              </a-button>
              <a-dropdown v-show="checkedGroupKeys.length > 0">
                <a-menu slot="overlay">
                  <a-menu-item
                    key="1"
                    v-action:delete
                    @click="handleDeleteInBatch"
                  >
                    <a-icon type="delete" />删除
                  </a-menu-item>
                </a-menu>
                <a-button style="margin-left: 8px;">
                  批量操作 <a-icon type="down" />
                </a-button>
              </a-dropdown>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <a-row :gutter="8" type="flex" justify="center">
      <a-col :lg="12" :md="24" :order="isMobile ? 1 : 0">
        <a-spin tip="Loading..." :spinning="treeDataLoading">
          <a-tree
            v-model="checkedGroupKeys"
            checkable
            blockNode
            :expanded-keys="expandedGroupKeys"
            :auto-expand-parent="autoExpandParent"
            :selected-keys="selectedKeys"
            :tree-data="userGroupTreeData"
            @expand="onTreeGroupExpand"
            @select="onSelect"
            @check="onTreeGroupCheck"
          />
          <a-empty v-if="userGroupTreeData.length == 0" />
        </a-spin>
      </a-col>
      <a-col :lg="12" :md="24">
        <a-form :label-col="labelCol" :wrapper-col="wrapperCol">
          <a-form-item label="上级组">
            <a-tree-select
              allowClear
              v-model="userGroupForm.parentId"
              style="width: 100%"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              :tree-data="userGroupTreeData"
              tree-default-expand-all
            >
            </a-tree-select>
          </a-form-item>
          <a-form-item label="组名称">
            <a-input
              v-model="userGroupForm.groupName"
              placeholder="例如：默认用户组"
            />
          </a-form-item>
          <a-form-item label="排序">
            <a-tooltip
              :trigger="['focus']"
              placement="topLeft"
              overlay-class-name="numeric-input"
            >
              <template slot="title"> 请输入整数数字 </template>
              <a-input
                v-model.number="userGroupForm.sortIndex"
                type="number"
                placeholder="只能输入数字"
                :max-length="25"
              />
            </a-tooltip>
          </a-form-item>
          <a-form-item :wrapper-col="groupFormButtonWrapperCol">
            <a-button
              type="primary"
              v-limitclick="handleSaveOrUpdate"
              v-action:save
            >
              保存
            </a-button>
            <a-button
              :style="{ marginLeft: '8px' }"
              @click="handleResetGroupForm"
            >
              重置
            </a-button>
          </a-form-item>
        </a-form>
      </a-col>
    </a-row>
  </a-card>
</template>

<script>
import groupApi from '@/api/group'
import { baseMixin } from '@/store/app-mixin'

export default {
  name: 'TreeList',
  mixins: [baseMixin],
  data() {
    return {
      treeDataLoading: false,
      userGroupForm: {},
      groupFormButtonWrapperCol: { span: 14, offset: 4 },
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      // 查询参数
      queryParam: {},
      expandedGroupKeys: [],
      autoExpandParent: false,
      checkedGroupKeys: [],
      selectedKeys: [],
      userGroupTreeData: []
    }
  },
  created() {
    this.listUserGroupTree()
  },
  computed: {},
  methods: {
    listUserGroupTree() {
      this.treeDataLoading = true
      groupApi
        .list(this.queryParam)
        .then(res => {
          this.userGroupTreeData = res.data
        })
        .catch(err => {
          this.userGroupTreeData = []
          this.$message.error(`查询出错:${err}`)
        })
        .finally(() => {
          this.treeDataLoading = false
        })
    },
    onTreeGroupExpand(expandedKeys) {
      console.log('onExpand', expandedKeys)
      // if not set autoExpandParent to false, if children expanded, parent can not collapse.
      // or, you can remove all expanded children keys.
      this.expandedGroupKeys = expandedKeys
      this.autoExpandParent = false
    },
    onTreeGroupCheck(checkedGroupKeys) {
      console.log('onCheck', checkedGroupKeys)
    },
    onSelect(selectedKeys, event) {
      this.handleToggleTreeMenu(selectedKeys, event)

      this.selectedKeys = selectedKeys
      var id = selectedKeys[0]
      if (id) {
        groupApi.getById(id).then(res => {
          this.userGroupForm = res.data
          if (res.data.parentId === 0) {
            this.userGroupForm.parentId = null
          }
        })
      }
    },
    handleToggleTreeMenu(selectedKeys, event) {
      // 控制树形菜单的展开与折叠
      if (event.node.dataRef.hasChildren) {
        this.expandedMenuKeys = selectedKeys
      }
    },
    handleSaveOrUpdate() {
      if (this.userGroupForm) {
        this.$message.warning('必填参数为空')
        return
      }
      groupApi.createOrUpdate(this.userGroupForm).then(res => {
        this.$message.success('保存成功')
        this.listUserGroupTree()
      })
    },
    handleResetGroupForm() {
      this.userGroupForm = {}
    },
    handleSearch() {
      this.listUserGroupTree()
    },
    handleSearchReset() {
      this.queryParam = {}
      this.listUserGroupTree()
    },
    handleClearSelect() {
      this.checkedGroupKeys = []
      this.selectedKeys = []
    },
    handleDeleteInBatch() {
      const that = this
      this.$confirm({
        title: '警告',
        content: `确定要删除所选中的组吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          that.$log.debug('批量删除用户组', that.checkedGroupKeys)
          groupApi.deleteByIds(that.checkedGroupKeys).then(res => {
            that.$message.success('删除成功')
            that.handleClearSelect()
            that.listUserGroupTree()
          })
        },
        onCancel() {
          that.$log.info('Cancel')
        }
      })
    }
  }
}
</script>

<style lang="less">
.numeric-input .ant-tooltip-inner {
  min-width: 32px;
  min-height: 37px;
}

.numeric-input .numeric-input-title {
  font-size: 14px;
}
</style>
