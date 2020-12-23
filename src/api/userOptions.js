import { axios } from '@/utils/request'

const userOptionApi = {}

userOptionApi.listRoutWeights = function() {
  return axios({
    url: '/users/options/route/weights',
    method: 'get'
  })
}

export default userOptionApi
