<template>
  <page-header-wrapper :breadcrumb="false">
    <template v-slot:content>
      <div class="page-header-content">
        <div class="avatar">
          <a-avatar size="large" :src="avatar" />
        </div>
        <div class="content">
          <div class="content-title">
            {{ timeFix }}，{{ userInfo.nickname
            }}<span class="welcome-text">，{{ welcome }}</span>
          </div>
          <div>
            <img
              src="https://v2.jinrishici.com/one.svg?font-size=16&color=gray"
              alt="今日诗词"
            />
          </div>
        </div>
      </div>
    </template>
    <a-row :gutter="24">
      <a-col :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
        <a-card :loading="loading" title="车辆轨迹" :bordered="false">
          <a-table
            :columns="path.columns"
            :data-source="path.data"
            rowKey="id"
            :pagination="path.pagination"
            @change="handlePathTableChange"
          >
          </a-table>
        </a-card>
      </a-col>
    </a-row>
    <a-row :gutter="[24, 24]">
      <a-col :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
        <a-card :loading="loading" title="操作记录" :bordered="false">
          <a-list>
            <a-list-item :key="index" v-for="(item, index) in activities">
              <a-list-item-meta :description="item.createTime">
                <span slot="title">{{ item.operation }}</span>
              </a-list-item-meta>
              <ellipsis :length="35" tooltip>{{ item.username }}</ellipsis>
            </a-list-item>
          </a-list>
          <a-pagination
            v-model="pagination.current"
            :pageSize="pagination.pageSize"
            :total="pagination.total"
            @change="handleLogPageChange"
            style="text-align: right;"
          />
        </a-card>
      </a-col>
    </a-row>
  </page-header-wrapper>
</template>

<script>
import { timeFix } from '@/utils/util'
import { mapState } from 'vuex'
import Ellipsis from '@/components/Ellipsis'
import { PageHeaderWrapper } from '@ant-design-vue/pro-layout'
import actionLogApi from '@/api/action-log'
import routeApi from '@/api/route'

export default {
  name: 'Workplace',
  components: {
    PageHeaderWrapper,
    Ellipsis
  },
  data() {
    return {
      timeFix: timeFix(),
      avatar: '',
      user: {},

      loading: false,
      activities: [],
      path: {
        data: [],
        pagination: {},
        columns: [
          {
            title: 'ID',
            dataIndex: 'id'
          },
          {
            title: '车牌号',
            dataIndex: 'carNumber'
          },
          {
            title: '距离',
            dataIndex: 'distance',
            customRender: distance => distance.toFixed(2) + '米'
          },
          {
            title: '通行时间',
            dataIndex: 'time',
            customRender: time => (time / 1000).toFixed(2) + '秒'
          },
          {
            title: '平均速度',
            dataIndex: 'averageSpeed',
            customRender: averageSpeed => averageSpeed.toFixed(2) + 'km/h'
          },
          {
            title: '缓转弯',
            dataIndex: 'regularTurnCount'
          },
          {
            title: '急转弯',
            dataIndex: 'sharpTurnCount'
          },
          {
            title: '掉头',
            dataIndex: 'uturnCount'
          },
          {
            title: '创建时间',
            dataIndex: 'createTime'
          }
        ]
      },
      pagination: {
        current: 1,
        pageSize: 5,
        total: 0
      }
    }
  },
  computed: {
    ...mapState({
      nickname: state => state.user.nickname,
      welcome: state => state.user.welcome
    }),
    currentUser() {
      return {
        name: this.userInfo.username,
        avatar: this.avatar
      }
    },
    userInfo() {
      return this.$store.getters.userInfo
    }
  },
  created() {
    this.user = this.userInfo
    this.avatar = this.userInfo.avatar
    this.handleListActivity()
    this.handleListPath()
  },
  methods: {
    handleLogPageChange(current) {
      this.pagination.current = current
      this.handleListActivity()
    },
    handleListActivity() {
      const param = {
        current: this.pagination.current,
        pageSize: this.pagination.pageSize
      }
      actionLogApi.listByUser(param).then(res => {
        this.activities = res.data.list
        this.pagination.total = res.data.total
      })
    },
    handleListPath() {
      routeApi.list().then(res => {
        const { list, total } = res.data
        this.path.data = list
        this.path.pagination.total = total
      })
    },
    handlePathTableChange(current) {
      this.path.pagination.current = current
      this.handleListPath()
    }
  }
}
</script>

<style lang="less" scoped>
@import './Workplace.less';

.project-list {
  .card-title {
    font-size: 0;

    a {
      color: rgba(0, 0, 0, 0.85);
      margin-left: 12px;
      line-height: 24px;
      height: 24px;
      display: inline-block;
      vertical-align: top;
      font-size: 14px;

      &:hover {
        color: #1890ff;
      }
    }
  }

  .card-description {
    color: rgba(0, 0, 0, 0.45);
    height: 44px;
    line-height: 22px;
    overflow: hidden;
  }

  .project-item {
    display: flex;
    margin-top: 8px;
    overflow: hidden;
    font-size: 12px;
    height: 20px;
    line-height: 20px;

    a {
      color: rgba(0, 0, 0, 0.45);
      display: inline-block;
      flex: 1 1 0;

      &:hover {
        color: #1890ff;
      }
    }

    .datetime {
      color: rgba(0, 0, 0, 0.25);
      flex: 0 0 auto;
      float: right;
    }
  }

  .ant-card-meta-description {
    color: rgba(0, 0, 0, 0.45);
    height: 44px;
    line-height: 22px;
    overflow: hidden;
  }
}

.item-group {
  padding: 20px 0 8px 24px;
  font-size: 0;

  a {
    color: rgba(0, 0, 0, 0.65);
    display: inline-block;
    font-size: 14px;
    margin-bottom: 13px;
    width: 25%;
  }
}

.members {
  a {
    display: block;
    margin: 12px 0;
    line-height: 24px;
    height: 24px;

    .member {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
      line-height: 24px;
      max-width: 100px;
      vertical-align: top;
      margin-left: 12px;
      transition: all 0.3s;
      display: inline-block;
    }

    &:hover {
      span {
        color: #1890ff;
      }
    }
  }
}

.mobile {
  .project-list {
    .project-card-grid {
      width: 100%;
    }
  }

  .more-info {
    border: 0;
    padding-top: 16px;
    margin: 16px 0 16px;
  }

  .headerContent .title .welcome-text {
    display: none;
  }
}
</style>
