import { axios } from '@/utils/request'

const api = {
  list: '/preset/list',
  save: '/preset/save',
  getScheme: '/preset/getScheme',
  trash: '/preset/trash',
  batchTrash: '/preset/batch-trash',
  update: '/preset/update',
  downloadScheme: '/preset/download',
  permissionNoPager: '/permission/no-pager',
  orgTree: '/org/tree'
}

const presetApi = {}

presetApi.listScheme = parameter => {
  return axios({
    url: api.list,
    method: 'get',
    params: parameter
  })
}

presetApi.saveScheme = parameter => {
  return axios({
    url: api.save,
    method: 'post',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

presetApi.getScheme = id => {
  return axios({
    url: api.getScheme + '/' + id,
    method: 'get'
  })
}

presetApi.trash = id => {
  return axios({
    url: api.trash + '/' + id,
    method: 'post'
  })
}

presetApi.batchTrash = ids => {
  return axios({
    url: api.batchTrash,
    method: 'post',
    data: ids,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

presetApi.updateScheme = parameter => {
  return axios({
    url: api.update,
    method: 'put',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

presetApi.downloadScheme = parameter => {
  return axios({
    url: api.downloadScheme,
    method: 'post',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

export default presetApi
