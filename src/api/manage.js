import { axios } from '@/utils/request'

const api = {
  user: '/user',
  schemeOverview: '/dashboard/scheme-overview',
  ramOverview: '/dashboard/ram-overview',
  listLog: '/log/list',
  permission: '/permission',
  permissionNoPager: '/permission/no-pager',
  orgTree: '/org/tree'
}

export default api

export function getUserList (parameter) {
  return axios({
    url: api.user,
    method: 'get',
    params: parameter
  })
}

export function getSchemeOverviewData () {
  return axios({
    url: api.schemeOverview,
    method: 'get'
  })
}

export function getRAMOverView () {
  return axios({
    url: api.ramOverview,
    method: 'get'
  })
}

export function getLog (parameter) {
  return axios({
    url: api.listLog,
    method: 'get',
    params: parameter
  })
}

export function getPermissions (parameter) {
  return axios({
    url: api.permissionNoPager,
    method: 'get',
    params: parameter
  })
}

export function getOrgTree (parameter) {
  return axios({
    url: api.orgTree,
    method: 'get',
    params: parameter
  })
}

// id == 0 add     post
// id != 0 update  put
export function saveService (parameter) {
  return axios({
    url: api.service,
    method: parameter.id === 0 ? 'post' : 'put',
    data: parameter
  })
}
