import { axios } from '@/utils/request'

const api = {
  list: '/actual/list',
  save: '/actual/save',
  getScheme: '/actual/get',
  trash: '/actual/trash',
  batchTrash: '/actual/batch-trash',
  update: '/actual/update',
  downloadScheme: '/actual/download',
  uploadScheme: '/actual/upload'
}

const layoutBayonetApi = {}

layoutBayonetApi.listScheme = parameter => {
  return axios({
    url: api.list,
    method: 'get',
    params: parameter
  })
}

layoutBayonetApi.saveScheme = parameter => {
  return axios({
    url: api.save,
    method: 'post',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

layoutBayonetApi.getScheme = id => {
  return axios({
    url: api.getScheme + '/' + id,
    method: 'get'
  })
}

layoutBayonetApi.trash = id => {
  return axios({
    url: api.trash + '/' + id,
    method: 'post'
  })
}

layoutBayonetApi.batchTrash = ids => {
  return axios({
    url: api.batchTrash,
    method: 'post',
    data: ids,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

layoutBayonetApi.updateScheme = parameter => {
  return axios({
    url: api.update,
    method: 'put',
    data: parameter,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })
}

layoutBayonetApi.downloadScheme = parameter => {
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

layoutBayonetApi.uploadScheme = (formDatas, uploadProgress, cancelToken) => {
  return axios({
    url: api.uploadScheme,
    timeout: 600000, // 10 minutes
    data: formDatas, // form data
    onUploadProgress: uploadProgress,
    cancelToken: cancelToken,
    method: 'post'
  })
}

export default layoutBayonetApi
