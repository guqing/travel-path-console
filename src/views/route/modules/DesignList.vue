<template>
  <div>
    <a-list item-layout="horizontal" :data-source="checkpoints">
      <a-list-item slot="renderItem" slot-scope="item">
        <a-card style="width:100%" hoverable @click="handleSelect(item)">
          <!-- <a slot="actions" @click="handleView(item)">
            <a-icon type="eye" />
          </a> -->
          <a-list-item-meta :description="item.description">
            <a slot="title" href="javascript:void(0)">{{ item.name }}</a>
            <div
              slot="avatar"
              class="editor-listLayer-media u-rSpace--m js-thumbnail"
              :style="{ background: item.avatarColor, color: '#fff' }"
            >
              <p class="CDB-text CDB-size-large is-semibold u-upperCase">
                {{ item.avatarText }}
                <img src="~@/assets/icons/route.svg" />
              </p>
            </div>
          </a-list-item-meta>
        </a-card>
      </a-list-item>
    </a-list>
    <a-pagination
      size="small"
      :current="pagination.current"
      :pageSize="pagination.pageSize"
      :total="pagination.total"
      @change="onPageChange"
      hideOnSinglePage
    />
  </div>
</template>
<script>
import designApi from '@/api/design'

const colorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae']

export default {
  name: 'DesignList',
  data() {
    return {
      checkpoints: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      }
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    loadData() {
      const queryParam = {
        current: this.pagination.current,
        pageSize: this.pagination.pageSize
      }
      designApi.list(queryParam).then(res => {
        const { list, total } = res.data
        for (const index in list) {
          const element = list[index]
          element.avatarText = element.name.substring(0, 1)
          element.avatarColor = colorList[index % list.length]
        }
        this.checkpoints = list
        this.pagination.total = total
      })
    },
    onPageChange() {
      this.loadData()
    },
    handleSelect(value) {
      this.$log.debug('选择方案', value)
      this.$emit('select', value)
    },
    handleView(value) {
      console.log('查看')
      this.$emit('view', value)
    }
  }
}
</script>
<style lang="less" scoped>
.ant-list-split .ant-list-item {
  border: none;
}
.editor-listLayer-media {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 4px;
}
.CDB-text.is-semibold {
  font-weight: 600;
}
.CDB-size-large {
  font-size: 16px;
  line-height: 22px;
}
.CDB-text {
  font-family: 'Open Sans';
  margin-bottom: 0;
}
.u-upperCase {
  text-transform: uppercase;
}
</style>
