import { axios } from '@/utils/request'

const mailApi = {}

mailApi.getMailOptions = function () {
  return axios({
    url: '/mail/get',
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

mailApi.saveOptions = function (parameter) {
  return axios({
    url: '/mail/save',
    method: 'post',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

mailApi.testMail = function (parameter) {
  return axios({
    url: '/mail/sendMail',
    method: 'post',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export default mailApi
