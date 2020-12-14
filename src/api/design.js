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

designApi.create = function(parameter) {
  return axios({
    url: '/deploy',
    method: 'post',
    data: parameter
  })
}

designApi.updateById = function(id, parameter) {
  return axios({
    url: `/deploy/${id}`,
    method: 'put',
    data: parameter
  })
}

export default designApi
