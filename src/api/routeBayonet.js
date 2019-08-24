import { axios } from '@/utils/request'

const api = {
  list: '/via/list',
  save: '/via/save',
  getScheme: '/via/get',
  trash: '/via/trash',
  batchTrash: '/via/batch-trash',
  update: '/via/update',
  downloadScheme: '/via/download',
  uploadScheme: '/via/upload'
}

const routeBayonetApi = {}

routeBayonetApi.listScheme = parameter => {
  return axios({
    url: api.list,
    method: 'get',
    params: parameter
  })
}

routeBayonetApi.saveScheme = parameter => {
  return axios({
    url: api.save,
    method: 'post',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

routeBayonetApi.getScheme = id => {
  return axios({
    url: api.getScheme + '/' + id,
    method: 'get'
  })
}

routeBayonetApi.trash = id => {
  return axios({
    url: api.trash + '/' + id,
    method: 'post'
  })
}

routeBayonetApi.batchTrash = ids => {
  return axios({
    url: api.batchTrash,
    method: 'post',
    data: ids,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

routeBayonetApi.updateScheme = parameter => {
  return axios({
    url: api.update,
    method: 'put',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

routeBayonetApi.downloadScheme = parameter => {
  return axios({
    url: api.downloadScheme,
    method: 'post',
    responseType: 'arraybuffer',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

routeBayonetApi.uploadScheme = (formDatas, uploadProgress, cancelToken) => {
  return axios({
    url: api.uploadScheme,
    timeout: 600000, // 10 minutes
    data: formDatas, // form data
    onUploadProgress: uploadProgress,
    cancelToken: cancelToken,
    method: 'post'
  })
}

export default routeBayonetApi
