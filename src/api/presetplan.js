import { axios } from '@/utils/request'

const presetPlanApi = {}

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
export default presetPlanApi
