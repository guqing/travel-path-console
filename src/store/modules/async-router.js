/**
 * 向后端请求用户的菜单，动态生成路由
 */
import { constantRouterMap } from '@/config/router.config'
import { generatorDynamicRouter } from '@/router/generator-routers'
import menuApi from '@/api/menu'

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    GenerateRoutes({ commit }) {
      return new Promise((resolve, reject) => {
        menuApi.listRouterMap().then(res => {
          generatorDynamicRouter(res.data)
            .then(routers => {
              commit('SET_ROUTERS', routers)
              resolve(routers)
            })
            .catch(err => {
              reject(err)
            })
        })
      })
    }
  }
}

export default permission
