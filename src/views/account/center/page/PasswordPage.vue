<template>
  <div class="account-settings-info-view">
    <a-row :gutter="16">
      <a-col :md="24" :lg="16">

        <a-form layout="vertical">
          <a-form-item
            :required="true"
            label="原始密码"
          >
            <a-input placeholder="" />
          </a-form-item>
          <a-form-item
            :required="true"
            label="新密码"
          >
            <a-input rows="4" placeholder=""/>
          </a-form-item>

          <a-form-item
            label="确认密码"
            :required="true"
          >
            <a-input placeholder=""/>
          </a-form-item>

          <a-form-item>
            <a-button type="primary">确认更改</a-button>
          </a-form-item>
        </a-form>

      </a-col>
    </a-row>
  </div>
</template>

<script>
export default {
  data () {
    return {
      password: {}
    }
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
</style>
