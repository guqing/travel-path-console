<template>
  <a-list itemLayout="horizontal" :dataSource="data">
    <a-list-item slot="renderItem" slot-scope="item, index" :key="index">
      <a-list-item-meta>
        <a slot="title">{{ item.title }}</a>
        <span slot="description">
          <span class="security-list-description">{{ item.description }}</span>
        </span>
      </a-list-item-meta>
      <template>
        <a-switch v-model="item.option" />
      </template>

    </a-list-item>
  </a-list>
</template>

<script>
export default {
  data () {
    return {
      data: [
        { title: '用户注册服务', description: '是否开启用户注册功能,如果关闭将不会显示用户注册按钮', option: true }
      ]
    }
  }
}
</script>
