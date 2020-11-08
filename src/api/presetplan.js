import { axios } from '@/utils/request'

const presetPlanApi = {}

presetPlanApi.createOrUpdate = function (parameter) {
  return axios({
    url: '/preset/create-update',
    method: 'post',
    data: parameter
  })
}

presetPlanApi.list = function (parameter) {
  return axios({
    url: '/preset/list',
    method: 'get',
    params: parameter
  })
}

presetPlanApi.getById = function (parameter) {
  return axios({
    url: `/preset/${parameter}`,
    method: 'get'
  })
}

presetPlanApi.deleteByIds = function (parameter) {
  return axios({
    url: '/preset',
    method: 'delete',
    data: parameter
  })
}
presetPlanApi.deleteById = function (parameter) {
  return axios({
    url: '/preset',
    method: 'delete',
    data: [parameter]
  })
}

export default presetPlanApi
