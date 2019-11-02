<template>
  <div class="page-header-index-wide">
    <a-row>
      <a-col :span="24">
        <div class="card-container">
          <div class="custom-tab-wrapper">
            <a-tabs>
              <a-tab-pane
                tab="发信设置"
                key="1"
              >
                <a-form layout="vertical">
                  <a-form-item
                    label="SMTP 地址："
                    :wrapper-col="wrapperCol"
                  >
                    <a-input v-model="options.host" />
                  </a-form-item>
                  <a-form-item
                    label="SSL 端口："
                    :wrapper-col="wrapperCol"
                  >
                    <a-input v-model="options.port" />
                  </a-form-item>
                  <a-form-item
                    label="邮箱账号："
                    :wrapper-col="wrapperCol"
                  >
                    <a-input v-model="options.username" />
                  </a-form-item>
                  <a-form-item
                    label="邮箱密码："
                    :wrapper-col="wrapperCol"
                  >
                    <a-input-password
                      v-model="options.password"
                      placeholder="部分邮箱可能是授权码"
                    />
                  </a-form-item>
                  <a-form-item>
                    <a-button
                      type="primary"
                      @click="handleSaveOptions"
                    >保存</a-button>
                  </a-form-item>
                </a-form>
              </a-tab-pane>
              <a-tab-pane
                tab="发送测试"
                key="2"
              >
                <a-form layout="vertical">
                  <a-form-item
                    label="收件人："
                    :wrapper-col="wrapperCol"
                  >
                    <a-input v-model="mailParam.to" />
                  </a-form-item>
                  <a-form-item
                    label="主题："
                    :wrapper-col="wrapperCol"
                  >
                    <a-input v-model="mailParam.subject" />
                  </a-form-item>
                  <a-form-item
                    label="内容："
                    :wrapper-col="wrapperCol"
                  >
                    <a-input
                      type="textarea"
                      :autosize="{ minRows: 5 }"
                      v-model="mailParam.content"
                    />
                  </a-form-item>
                  <a-form-item>
                    <a-button
                      type="primary"
                      :loading="sendMailLoading"
                      @click="handleTestMailClick"
                    >发送</a-button>
                  </a-form-item>
                </a-form>
              </a-tab-pane>
            </a-tabs>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script>
// import optionApi from '@/api/option'
import mailApi from '@/api/mail'
export default {
  data () {
    return {
      wrapperCol: {
        xl: { span: 14 },
        lg: { span: 14 },
        sm: { span: 12 },
        xs: { span: 24 }
      },
      sendMailLoading: false,
      options: {},
      mailParam: {}
    }
  },
  mounted () {
    this.getMailOptions()
  },
  methods: {
    getMailOptions () {
      mailApi.getMailOptions().then(res => {
        if(res.code === 0) {
          this.options = res.data
        }
      })
    },
    handleTestMailClick () {
      if (!this.mailParam.to) {
        this.$notification['error']({
          message: '提示',
          description: '收件人不能为空！'
        })
        return
      }
      if (!this.mailParam.subject) {
        this.$notification['error']({
          message: '提示',
          description: '主题不能为空！'
        })
        return
      }
      if (!this.mailParam.content) {
        this.$notification['error']({
          message: '提示',
          description: '内容不能为空！'
        })
        return
      }
      // 开启按钮加载动画
      this.sendMailLoading = true
      // 发送测试邮件
      mailApi.testMail(this.mailParam).then(response => {
        this.sendMailLoading = false
        this.$message.info(`邮件提示: ${response.message}`)
      }).catch(err => {
        this.$message.error(`发送失败, error:${err}`)
        this.sendMailLoading = false
      })
    },
    handleSaveOptions () {
      if (!this.options.host) {
        this.$notification['error']({
          message: '提示',
          description: 'SMTP地址不能为空！'
        })
        return
      }
      if (!this.options.port) {
        this.$notification['error']({
          message: '提示',
          description: 'SSL端口不能为空！'
        })
        return
      }
      if (!this.options.username) {
        this.$notification['error']({
          message: '提示',
          description: '邮箱账号不能为空！'
        })
        return
      }
       if (!this.options.password) {
        this.$notification['error']({
          message: '提示',
          description: '邮箱密码不能为空！'
        })
        return
      }
      mailApi.saveOptions(this.options).then(res => {
        this.$message.success('保存成功')
      }).catch(err => {
        this.$message.error(`保存失败：error: ${ err }`)
      })
    }
  }
}
</script>
