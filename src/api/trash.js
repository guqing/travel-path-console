import { axios } from '@/utils/request'

const api = {
  queryPreset: '/preset/trash/query',
  recoverPreset: '/preset/trash/recover',
  batchDeletePreset: '/preset/trash/batchDelete',
  deletePresetById: '/preset/trash/deleteById'
}

const trashApi = {}

trashApi.queryPreset = function (parameter) {
  return axios({
    url: api.queryPreset,
    method: 'get',
    params: parameter
  })
}

trashApi.recoverPresetById = function (parameter) {
  return axios({
    url: api.recoverPreset + `/${parameter}`,
    method: 'post'
  })
}

trashApi.deletePresetById = function (parameter) {
  return axios({
    url: api.deletePresetById + `/${parameter}`,
    method: 'post'
  })
}

trashApi.batchDeletePreset = function (parameter) {
  return axios({
    url: api.batchDeletePreset,
    method: 'post',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export default trashApi
