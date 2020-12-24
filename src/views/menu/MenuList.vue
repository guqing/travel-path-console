<template>
  <a-card :bordered="false">
    <div class="table-page-search-wrapper">
      <a-form layout="inline">
        <a-row :gutter="15">
          <a-col :md="4" :sm="24">
            <a-form-item>
              <a-input placeholder="标题" v-model="queryParam.title" />
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="24">
            <span class="table-page-search-submitButtons">
              <a-button type="primary" @click="handleSearch">查询</a-button>
              <a-button style="margin-left: 8px;" @click="handleSearchReset">
                重置
              </a-button>
              <a-dropdown v-show="menuOpsVisible">
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
        <a-spin tip="加载中..." :spinning="treeDataLoading">
          <a-tree
            v-model="checkedMenuKeys"
            checkable
            blockNode
            :expanded-keys="expandedMenuKeys"
            :auto-expand-parent="autoExpandParent"
            :selected-keys="selectedKeys"
            :tree-data="menuTreeData"
            @expand="onTreeMenuExpand"
            @select="onSelect"
            @check="onTreeMenuCheck"
          />
          <a-empty v-if="menuTreeData.length == 0" />
        </a-spin>
      </a-col>
      <a-col :lg="12" :md="24">
        <a-form-model
          ref="menuForm"
          :model="menuForm"
          :rules="rules"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-form-model-item label="上级菜单">
            <a-tree-select
              allowClear
              v-model="menuForm.parentId"
              style="width: 100%"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              :tree-data="menuTreeData"
              tree-default-expand-all
            >
            </a-tree-select>
          </a-form-model-item>
          <a-form-model-item label="菜单/按钮标题" prop="title">
            <a-input placeholder="例如：用户管理" v-model="menuForm.title" />
          </a-form-model-item>
          <a-form-model-item label="资源类型">
            <a-radio-group
              default-value="0"
              button-style="solid"
              v-model="menuForm.type"
            >
              <a-radio-button value="0"> 菜单 </a-radio-button>
              <a-radio-button value="1"> 按钮 </a-radio-button>
            </a-radio-group>
          </a-form-model-item>
          <a-form-model-item
            label="访问路径"
            v-show="showMenuFormItem"
            prop="path"
          >
            <a-input
              v-model="menuForm.path"
              placeholder="以 / 开头，例如：/user/list"
            />
          </a-form-model-item>
          <a-form-model-item
            label="路由名称"
            v-show="showMenuFormItem"
            prop="name"
          >
            <a-input
              v-model="menuForm.name"
              placeholder="只能是英文，例如：UserList"
            />
          </a-form-model-item>
          <a-form-model-item
            label="组件路径"
            v-show="showMenuFormItem"
            prop="component"
          >
            <a-input
              v-model="menuForm.component"
              placeholder="相对于views下的组件，例如:user/UserList"
            />
          </a-form-model-item>
          <a-form-model-item>
            <span slot="label">
              权限标识&nbsp;
              <a-tooltip
                title="user:list中user表示组件名称,list表示按钮操作标识"
              >
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </span>
            <a-input
              v-model="menuForm.perms"
              placeholder="使用冒号分割层级，例如user:list"
            />
          </a-form-model-item>
          <a-form-model-item label="图标">
            <a-input
              v-model="menuForm.icon"
              @click="handleSelectIcon"
              placeholder="选择一个图标可以展示在菜单标题左侧"
            >
              <a-icon
                slot="suffix"
                :type="menuForm.icon"
                v-if="menuForm.icon"
              />
            </a-input>
          </a-form-model-item>
          <a-col :style="{ display: moreFormItem ? 'block' : 'none' }">
            <a-form-model-item label="重定向地址" v-show="showMenuFormItem">
              <a-input
                v-model="menuForm.redirect"
                placeholder="如果填写，点击时会重定向到该地址"
              />
            </a-form-model-item>
            <a-form-model-item label="是否缓存组件" v-show="showMenuFormItem">
              <a-switch
                v-model="menuForm.keepAlive"
                checked-children="是"
                un-checked-children="否"
                default-checked
              />
            </a-form-model-item>
            <a-form-model-item v-show="showMenuFormItem">
              <span slot="label">
                是否隐藏菜单栏&nbsp;
                <a-tooltip
                  title="当菜单类型为菜单时如果开启了隐藏则始终不会显示"
                >
                  <a-icon type="question-circle-o" />
                </a-tooltip>
              </span>
              <a-switch
                v-model="menuForm.hidden"
                checked-children="隐藏"
                un-checked-children="显示"
              />
            </a-form-model-item>
            <a-form-model-item label="排序">
              <a-input
                v-model="menuForm.sortIndex"
                placeholder="菜单显示排序"
              />
            </a-form-model-item>
          </a-col>
          <a-form-model-item :wrapper-col="menuFormButtonWrapperCol">
            <a-button
              type="primary"
              @click="handleSaveOrUpdateMenu"
              :loading="loadingState.save"
              v-action:save
            >
              保存
            </a-button>
            <a-button
              :style="{ marginLeft: '8px' }"
              @click="handleResetMenuForm"
              :loading="loadingState.reset"
            >
              重置
            </a-button>
            <a
              :style="{ marginLeft: '8px' }"
              @click="moreFormItem = !moreFormItem"
            >
              更多 <a-icon :type="moreFormItem ? 'up' : 'down'" />
            </a>
          </a-form-model-item>
        </a-form-model>

        <a-modal
          title="选择图标"
          :visible="iconSelect.visible"
          @cancel="iconSelect.visible = false"
          @ok="handleIconSelectOk"
        >
          <icon-selector
            v-model="iconSelect.selected"
            @change="handleChangeIcon"
          />
        </a-modal>
      </a-col>
    </a-row>
  </a-card>
</template>

<script>
import menuApi from '@/api/menu'
import { baseMixin } from '@/store/app-mixin'
import IconSelector from '@/components/IconSelector'

const validatePath = (rule, value, callback) => {
  if (value !== '') {
    var result = /^[A-Za-z0-9/]+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/.test(
      value
    )
    if (result) {
      callback()
    } else {
      callback(new Error('请输入合法的访问url'))
    }
  }
  callback()
}

const validateComponentPath = (rule, value, callback) => {
  if (value !== '') {
    var result = /^[A-Za-z0-9/]+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/.test(
      value
    )
    if (result) {
      callback()
    } else {
      callback(new Error('请输入合法的组件路径'))
    }
  }
  callback()
}
export default {
  name: 'TreeList',
  mixins: [baseMixin],
  components: {
    IconSelector
  },
  data() {
    return {
      iconSelect: {
        visible: false,
        selected: ''
      },
      iconSelectorVisible: false,
      loadingState: {
        save: false,
        reset: false
      },
      menuForm: {},
      treeDataLoading: false,
      rules: {
        title: [
          {
            required: true,
            message: '请输入菜单或按钮的名称',
            trigger: 'blur'
          },
          { max: 150, message: '长度不能超过150字符', trigger: 'blur' }
        ],
        path: [{ validator: validatePath, trigger: 'change' }],
        name: [
          {
            validator: (rule, value, callback) => {
              if (!this.menuForm.type || this.menuForm.type === '0') {
                if (!value) {
                  callback(new Error('资源类型为菜单时不能为空'))
                } else if (value !== '') {
                  if (/^[A-Za-z0-9]+$/.test(value)) {
                    callback()
                  } else {
                    callback(new Error('只能输入字母或数字'))
                  }
                } else {
                  callback()
                }
              }
            },
            trigger: 'blur'
          }
        ],
        component: [{ validator: validateComponentPath, trigger: 'change' }]
      },
      moreFormItem: false,
      menuFormButtonWrapperCol: { span: 14, offset: 4 },
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      // 查询参数
      queryParam: {},
      expandedMenuKeys: [],
      autoExpandParent: false,
      checkedMenuKeys: [],
      selectedKeys: [],
      menuTreeData: []
    }
  },
  created() {
    this.listTreeMenu()
  },
  computed: {
    showMenuFormItem() {
      return (this.menuForm.type || '0') === '0'
    },
    menuOpsVisible() {
      return this.checkedMenuKeys.length > 0
    }
  },
  methods: {
    handleChangeIcon(type) {
      this.iconSelect.selected = type
    },
    handleSelectIcon() {
      this.iconSelect.visible = true
    },
    handleIconSelectOk() {
      this.menuForm.icon = this.iconSelect.selected
      this.iconSelect.visible = false
    },
    handleRoleEdit(role) {
      var menuIdArray = role.menuIds
      var menuIdStringArray = menuIdArray.map(String)
      this.checkedMenuKeys = menuIdStringArray
      this.expandedMenuKeys = menuIdStringArray
    },
    listTreeMenu() {
      this.treeDataLoading = true
      menuApi
        .listTreeMenu(this.queryParam)
        .then(res => {
          this.menuTreeData = res.data
        })
        .catch(err => {
          this.menuTreeData = []
          this.$message.error(`查询出错:${err}`)
        })
        .finally(() => {
          this.treeDataLoading = false
        })
    },
    onTreeMenuExpand(expandedKeys) {
      this.$log.debug('onExpand', expandedKeys)
      // if not set autoExpandParent to false, if children expanded, parent can not collapse.
      // or, you can remove all expanded children keys.
      this.expandedMenuKeys = expandedKeys
      this.autoExpandParent = false
    },
    onTreeMenuCheck(checkedMenuKeys) {
      this.$log.debug('onCheck', checkedMenuKeys)
    },
    onSelect(selectedKeys, event) {
      this.handleToggleTreeMenu(selectedKeys, event)

      this.selectedKeys = selectedKeys
      var id = selectedKeys[0]
      if (id) {
        menuApi.getById(id).then(res => {
          this.menuForm = res.data
          this.handleMenuFormValueConvert()
          if (res.data.parentId === 0) {
            this.menuForm.parentId = null
          }
        })
      }
    },
    handleMenuFormValueConvert() {
      if (this.menuForm.keepAlive === 1) {
        this.menuForm.keepAlive = true
      } else {
        this.menuForm.keepAlive = false
      }
      if (this.menuForm.hidden === 1) {
        this.menuForm.hidden = true
      } else {
        this.menuForm.hidden = false
      }
      if (this.menuForm.parentId === 0) {
        this.menuForm.parentId = null
      }
    },
    handleToggleTreeMenu(selectedKeys, event) {
      // 控制树形菜单的展开与折叠
      if (event.node.dataRef.hasChildren) {
        this.expandedMenuKeys = selectedKeys
      }
    },
    handleSaveOrUpdateMenu() {
      this.loadingState.save = true
      this.$refs['menuForm'].validate(valid => {
        if (valid) {
          this.menuForm.type = '0'
          menuApi
            .saveOrUpdate(this.menuForm)
            .then(res => {
              this.$message.success('保存成功')
              this.listTreeMenu()
              this.handleReset()
            })
            .finally(() => {
              setTimeout(() => {
                this.loadingState.save = false
              }, 1000)
            })
        } else {
          setTimeout(() => {
            this.loadingState.save = false
          }, 1500)
        }
      })
    },
    handleReset() {
      this.menuForm = {}
      this.checkedMenuKeys = []
      this.expandedMenuKeys = []
    },
    handleResetMenuForm() {
      this.$log.debug('清除表单执行')
      this.loadingState.reset = true
      this.handleReset()
      setTimeout(() => {
        this.loadingState.reset = false
      }, 1500)
    },
    handleSearch() {
      this.listTreeMenu()
    },
    handleSearchReset() {
      this.queryParam = {}
      this.listTreeMenu()
    },
    handleDeleteInBatch() {
      const that = this
      this.$confirm({
        title: '警告',
        content: `确定要删除所选中的菜单吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          that.$log.debug('批量删除菜单或按钮', that.checkedMenuKeys)
          menuApi.deleteByIds(that.checkedMenuKeys).then(res => {
            that.$message.success('删除成功')
            that.handleReset()
            that.listTreeMenu()
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
.custom-tree {
  /deep/ .ant-menu-item-group-title {
    position: relative;
    &:hover {
      .btn {
        display: block;
      }
    }
  }

  /deep/ .ant-menu-item {
    &:hover {
      .btn {
        display: block;
      }
    }
  }

  /deep/ .btn {
    display: none;
    position: absolute;
    top: 0;
    right: 10px;
    width: 20px;
    height: 40px;
    line-height: 40px;
    z-index: 1050;

    &:hover {
      transform: scale(1.2);
      transition: 0.5s all;
    }
  }
}
</style>
