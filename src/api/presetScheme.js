import { axios } from '@/utils/request'

const api = {
  list: '/preset/list',
  save: '/preset/save',
  getScheme: '/preset/getScheme',
  trash: '/preset/trash',
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

export default presetApi
