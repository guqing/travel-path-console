import { axios } from '@/utils/request'

const presetPlanApi = {}

presetPlanApi.create = function(parameter) {
  return axios({
    url: '/preset',
    method: 'post',
    data: parameter
  })
}

presetPlanApi.updateById = function(id, parameter) {
  return axios({
    url: `/preset/${id}`,
    method: 'put',
    data: parameter
  })
}

presetPlanApi.list = function(parameter) {
  return axios({
    url: '/preset/list',
    method: 'get',
    params: parameter
  })
}

presetPlanApi.getById = function(parameter) {
  return axios({
    url: `/preset/${parameter}`,
    method: 'get'
  })
}

presetPlanApi.deleteByIds = function(parameter) {
  return axios({
    url: '/preset',
    method: 'delete',
    data: parameter
  })
}
presetPlanApi.deleteById = function(parameter) {
  return axios({
    url: '/preset',
    method: 'delete',
    data: [parameter]
  })
}

export default presetPlanApi
