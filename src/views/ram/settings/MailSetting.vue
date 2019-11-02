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
                    <a-input v-model="options.email_host" />
                  </a-form-item>
                  <a-form-item
                    label="发送协议："
                    :wrapper-col="wrapperCol"
                  >
                    <a-input v-model="options.email_protocol" />
                  </a-form-item>
                  <a-form-item
                    label="SSL 端口："
                    :wrapper-col="wrapperCol"
                  >
                    <a-input v-model="options.email_ssl_port" />
                  </a-form-item>
                  <a-form-item
                    label="邮箱账号："
                    :wrapper-col="wrapperCol"
                  >
                    <a-input v-model="options.email_username" />
                  </a-form-item>
                  <a-form-item
                    label="邮箱密码："
                    :wrapper-col="wrapperCol"
                  >
                    <a-input-password
                      v-model="options.email_password"
                      placeholder="部分邮箱可能是授权码"
                    />
                  </a-form-item>
                  <a-form-item
                    label="发件人："
                    :wrapper-col="wrapperCol"
                  >
                    <a-input v-model="options.email_from_name" />
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
// import mailApi from '@/api/mail'
export default {
  data () {
    return {
      wrapperCol: {
        xl: { span: 14 },
        lg: { span: 14 },
        sm: { span: 12 },
        xs: { span: 24 }
      },
      options: {},
      mailParam: {}
    }
  },
  methods: {
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
      console.log('提交')
      // mailApi.testMail(this.mailParam).then(response => {
      //   this.$message.info(response.data.message)
      // })
    },
    handleSaveOptions () {

    }
  }
}
</script>
