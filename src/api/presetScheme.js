import { axios } from '@/utils/request'

const api = {
  list: '/preset/list',
  role: '/role',
  service: '/service',
  permission: '/permission',
  permissionNoPager: '/permission/no-pager',
  orgTree: '/org/tree'
}

export default api

export function listScheme (parameter) {
  return axios({
    url: api.list,
    method: 'get',
    params: parameter
  })
}
