import { axios } from '@/utils/request'

const designApi = {}

designApi.list = function(parameter) {
  return axios({
    url: '/deploy/list',
    method: 'get',
    params: parameter
  })
}

designApi.getById = function(id) {
  return axios({
    url: `/deploy/${id}`,
    method: 'get'
  })
}

designApi.createOrpdate = function(parameter) {
  return axios({
    url: '/deploy/create-update',
    method: 'post',
    data: parameter
  })
}

export default designApi
