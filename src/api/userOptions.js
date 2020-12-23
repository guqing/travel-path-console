import { axios } from '@/utils/request'

const userOptionApi = {}

userOptionApi.listRoutWeights = function() {
  return axios({
    url: '/users/options/route/weights',
    method: 'get'
  })
}

userOptionApi.updateRoutWeights = function(parameter) {
  return axios({
    url: '/users/options/route/weights',
    method: 'put',
    data: parameter
  })
}
export default userOptionApi
