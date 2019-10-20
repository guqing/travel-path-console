<template>
  <div class="account-settings-info-view">
    <a-row :gutter="16">
      <a-col :md="24" :lg="16">

        <a-form layout="vertical">
          <a-form-item
            :required="true"
            label="原始密码"
          >
            <a-input-password placeholder="" v-model="user.oldPassword"/>
          </a-form-item>
          <a-form-item
            :required="true"
            label="新密码"
          >
            <a-input-password placeholder="" v-model="user.newPassword"/>
          </a-form-item>

          <a-form-item
            label="确认密码"
            :required="true"
          >
            <a-input-password placeholder="" v-model="confirmPassword"/>
          </a-form-item>

          <a-form-item>
            <a-button type="primary" @click="handleUpdatePassword">确认更改</a-button>
          </a-form-item>
        </a-form>

      </a-col>
    </a-row>
  </div>
</template>

<script>
import userApi from '@/api/user'

export default {
  data () {
    return {
      user: {},
      confirmPassword: ''
    }
  },
  mounted () {
    this.user.id = this.$store.state.user.info.id
  },
  methods: {
    handleUpdatePassword () {
      if (this.user.newPassword !== this.confirmPassword) {
        this.$message.warning('两次密码不一致，请重新输入')
        return
      }

      userApi.updatePassword(this.user).then(res => {
        if (res.code === 402) {
          this.$message.warning('原始密码输入有误，请重新输入')
        } else if (res.code === 0) {
          this.$message.success('修改成功')
        }
      }).catch(err => {
        this.$message.error(`修改密码出错，error:${err}`)
      })
    }
  }
}
</script>

<style lang="less" scoped>
</style>
