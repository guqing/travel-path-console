import { axios } from '@/utils/request'

const api = {
  queryPreset: '/preset/trash/query',
  recoverPreset: '/preset/trash/recover',
  batchDeletePreset: '/preset/trash/batchDelete',
  deletePresetById: '/preset/trash/deleteById',

  queryActualBayonetList: '/actual/trash/query',
  recoverActualBayonet: '/actual/trash/recover',
  deleteActualBayonetById: '/actual/trash/delete',
  batchDeleteActualBayonet: '/actual/trash/batch-delete',

  queryViaList: '/via/trash/query',
  recoverVia: '/via/trash/recover',
  deleteViaById: '/via/trash/delete',
  batchDeleteVia: '/via/trash/batch-delete'
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

trashApi.queryActualBayonetList = function (parameter) {
  return axios({
    url: api.queryActualBayonetList,
    method: 'get',
    params: parameter
  })
}

trashApi.recoverActualBayonetById = function (parameter) {
  return axios({
    url: api.recoverActualBayonet + `/${parameter}`,
    method: 'post'
  })
}

trashApi.deleteActualBayonetById = function (parameter) {
  return axios({
    url: api.deleteActualBayonetById + `/${parameter}`,
    method: 'post'
  })
}

trashApi.batchDeleteActualBayonet = function (parameter) {
  return axios({
    url: api.batchDeleteActualBayonet,
    method: 'post',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

trashApi.queryViaList = function (parameter) {
  return axios({
    url: api.queryViaList,
    method: 'get',
    params: parameter
  })
}

trashApi.recoverViaById = function (parameter) {
  return axios({
    url: api.recoverVia + `/${parameter}`,
    method: 'post'
  })
}

trashApi.deleteViaById = function (parameter) {
  return axios({
    url: api.deleteViaById + `/${parameter}`,
    method: 'post'
  })
}

trashApi.batchDeleteVia = function (parameter) {
  return axios({
    url: api.batchDeleteVia,
    method: 'post',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}
export default trashApi
