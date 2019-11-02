import { axios } from '@/utils/request'

const mailApi = {}

mailApi.get = function () {
  return axios({
    url: '/mail/get',
    method: 'get',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}
export default mailApi
