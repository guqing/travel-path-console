import { axios } from '@/utils/request'

const userApi = {}

userApi.getBaseUserInfo = function () {
  return axios({
    url: '/user/baseInfo',
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

userApi.updateUserInfo = function (parameter) {
  return axios({
    url: '/user/updateInfo',
    method: 'put',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

userApi.uploadAvatar = function (parameter) {
  return axios({
    url: '/attachment/uploadImage',
    method: 'post',
    data: parameter,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
}

userApi.updatePassword = function (parameter) {
  return axios({
    url: '/user/updatePassword',
    method: 'put',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export default userApi
