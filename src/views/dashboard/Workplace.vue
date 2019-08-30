
<template>
  <page-view
    :avatar="avatar"
    :title="false"
  >
    <div slot="headerContent">
      <div class="title">
        {{ timeFix }}，{{ user.name }}
        <span class="welcome-text">，{{ welcome() }}</span>
      </div>
      <div><img src="http://v2.jinrishici.com/one.svg"/></div>
    </div>
    <!-- <div slot="extra">
      <a-row class="more-info">
        <a-col :span="8">
          <head-info title="项目数" content="56" :center="false" :bordered="false"/>
        </a-col>
        <a-col :span="8">
          <head-info title="团队排名" content="8/24" :center="false" :bordered="false"/>
        </a-col>
        <a-col :span="8">
          <head-info title="项目访问" content="2,223" :center="false" />
        </a-col>
      </a-row>
    </div> -->

    <div>
      <a-row :gutter="24">
        <a-col
          :xl="24"
          :lg="24"
          :md="24"
          :sm="24"
          :xs="24"
        >
          <a-card
            class="project-list"
            :loading="loading"
            style="margin-bottom: 24px;"
            :bordered="false"
            title="数据概览"
            :body-style="{ padding: 0 }"
          >
            <!-- <a slot="extra">全部项目</a> -->
            <div>
              <a-card-grid
                class="project-card-grid"
                :key="i"
                v-for="(item, i) in dataOverview"
              >
                <a-card
                  :bordered="false"
                  :body-style="{ padding: 0 }"
                >
                  <a-card-meta>
                    <div slot="title" class="card-description">
                      {{ item.count }}
                    </div>
                    <div
                      slot="title"
                      class="card-title"
                    >
                      <a>
                        <img :src="item.icon" class="card-title-icon"/>
                        {{ item.title }}
                      </a>
                    </div>
                  </a-card-meta>
                </a-card>
              </a-card-grid>
            </div>
          </a-card>

          <a-card
            class="project-list"
            :loading="loading"
            style="margin-bottom: 24px;"
            :bordered="false"
            title="我的账户"
            :body-style="{ padding: 0 }"
          >
            <div>
              <a-card-grid
                class="project-card-grid"
                :key="i"
                v-for="(item, i) in ramOverView"
              >
                <a-card
                  :bordered="false"
                  :body-style="{ padding: 0 }"
                >
                  <a-card-meta>
                    <div slot="title" class="card-description">
                      {{ item.count }}
                    </div>
                    <div
                      slot="title"
                      class="card-title"
                    >
                      <a>
                        <img :src="item.icon" class="card-title-icon"/>
                        {{ item.title }}
                      </a>
                    </div>
                  </a-card-meta>
                </a-card>
              </a-card-grid>
            </div>
          </a-card>

          <a-card
            :loading="loading"
            title="日志"
            :bordered="false"
          >
            <a-list>
              <a-list-item
                :key="index"
                v-for="(item, index) in activities"
              >
                <a-list-item-meta>
                  <a-avatar
                    slot="avatar"
                    :src="item.user.avatar"
                  />
                  <div slot="title">
                    <span>{{ item.user.nickname }}</span>&nbsp;
                    在&nbsp;
                    <a href="#">{{ item.project.name }}</a>&nbsp;
                    <span>{{ item.project.action }}</span>&nbsp;
                    <a href="#">{{ item.project.event }}</a>
                  </div>
                  <div slot="description">{{ item.time }}</div>
                </a-list-item-meta>
              </a-list-item>
            </a-list>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </page-view>
</template>

<script>
import { timeFix } from '@/utils/util'
import { mapGetters } from 'vuex'

import { PageView } from '@/layouts'
import HeadInfo from '@/components/tools/HeadInfo'

import { getSchemeOverviewData, getRAMOverView } from '@/api/manage'

export default {
  name: 'Workplace',
  components: {
    PageView,
    HeadInfo
  },
  data () {
    return {
      timeFix: timeFix(),
      avatar: '',
      user: {},
      schemeOverView: {},
      myProjects: {},

      ramOverView: [],
      dataOverview: [],
      loading: true,
      activities: [] // 日志
    }
  },
  computed: {
    userInfo () {
      return this.$store.getters.userInfo
    }
  },
  created () {
    this.user = this.userInfo
    this.avatar = this.userInfo.avatar
  },
  mounted () {
    this.getSchemeOverViewData()
    this.getRamData()
  },
  methods: {
    ...mapGetters(['nickname', 'welcome']),
    getSchemeOverviewList () {
      this.dataOverview = [
        {
          id: 1,
          title: '预设卡口方案',
          icon: '/dashboard/presetpoint.png',
          count: this.schemeOverView.presetCount
        },
        {
          id: 2,
          title: '布设卡口方案',
          icon: '/dashboard/bayonet.png',
          count: this.schemeOverView.actualCount
        },
        {
          id: 3,
          title: '途经卡口方案',
          icon: '/dashboard/via.png',
          count: this.schemeOverView.viaCount
        },
        {
          id: 4,
          title: '轨迹',
          icon: '/dashboard/route.png',
          count: this.schemeOverView.routeCount
        }
      ]
    },
    getProjects () {
      this.ramOverView = [
        {
          id: 1,
          title: '用户',
          icon: '/dashboard/user.png',
          count: this.myProjects.userCount
        },
        {
          id: 2,
          title: 'RAM角色',
          icon: '/dashboard/RAM.png',
          count: this.myProjects.roleCount
        },
        {
          id: 3,
          title: '权限',
          icon: '/dashboard/usergroup.png',
          count: this.myProjects.permissionCount
        }
      ]
      this.loading = false
    },
    getRamData () {
      var myProjects = {}
      getRAMOverView().then(res => {
        this.$set(myProjects, 'userCount', res.data.userCount)
        this.$set(myProjects, 'roleCount', res.data.roleCount)
        this.$set(myProjects, 'permissionCount', res.data.permissionCount)
        console.log('workplace -> call getRamData()', res)
      })
      this.myProjects = myProjects
    },
    getSchemeOverViewData () {
      var schemeOverView = {}
      getSchemeOverviewData().then(res => {
        console.log(res)
        this.$set(schemeOverView, 'presetCount', res.data.presetCount)
        this.$set(schemeOverView, 'actualCount', res.data.actualCount)
        this.$set(schemeOverView, 'viaCount', res.data.viaCount)
        this.$set(schemeOverView, 'routeCount', res.data.routeCount)
        console.log('workplace -> call getSchemeOverViewData()', res)
      })
      this.schemeOverView = schemeOverView
    }
  },
  watch: {
    myProjects (val) {
      this.getProjects()
    },
    schemeOverView (val) {
      this.getSchemeOverviewList()
    }
  }
}
</script>

<style lang="less" scoped>
.project-list {
  .card-title {
    font-size: 0;
    a {
      color: rgba(0, 0, 0, 0.85);
      line-height: 24px;
      height: 24px;
      margin-left: 12px;
      display: inline-block;
      vertical-align: top;
      font-size: 14px;

      &:hover {
        color: #1890ff;
      }
    }
  }
  .card-title-icon{
    width: 14px;
    margin-right: 8px;
  }
  .card-description {
    color: #262626;
    font-size: 28px;
    margin-left: 12px;
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
