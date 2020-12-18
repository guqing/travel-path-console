import { axios } from '@/utils/request'

const routeApi = {}

routeApi.route = parameter => {
  return axios({
    url: '/route',
    method: 'post',
    data: parameter
  })
}

routeApi.save = parameter => {
  return axios({
    url: '/route/save',
    method: 'post',
    data: parameter
  })
}
export default routeApi
