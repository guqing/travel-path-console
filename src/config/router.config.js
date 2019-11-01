// eslint-disable-next-line
import { UserLayout, BasicLayout, RouteView, BlankLayout, PageView } from '@/layouts'

export const asyncRouterMap = [

  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: '首页' },
    redirect: '/dashboard/workplace',
    children: [
      // dashboard
      {
        path: '/dashboard/workplace',
        name: 'dashboard',
        component: () => import('@/views/dashboard/Workplace'),
        meta: { title: '仪表盘', keepAlive: true, icon: 'dashboard', permission: [ 'dashboard' ] }
      },
      // presetScheme
      {
        path: '/preset/list',
        name: 'PresetSchemeList',
        // redirect: '/preset/list',
        component: () => import('@/views/preset/List'),
        meta: { title: '预设卡口管理', keepAlive: true, icon: 'flag', permission: [ 'preset' ] }
      },
      // actualScheme 实际布设卡口方案
      {
        path: '/actual/list',
        name: 'ActualSchemeList',
        component: () => import('@/views/actual_scheme/List'),
        meta: { title: '布设卡口管理', keepAlive: true, icon: 'bg-colors', permission: [ 'actualBayonet' ] }
      },
      // RouteBayone 车辆途径卡口方案
      {
        path: '/route-bayonet/list',
        name: 'RouteBayoneList',
        component: () => import('@/views/route_bayonet/List'),
        meta: { title: '途经卡口管理', keepAlive: true, icon: 'deployment-unit', permission: [ 'via' ] }
      },
      // ram访问控制
      {
        path: '/ram',
        name: 'ram',
        component: PageView,
        redirect: '/ram/list/user',
        meta: { title: '访问控制', icon: 'table', permission: [ 'ram' ] },
        children: [
          {
            path: '/ram/list/user',
            name: 'UserList',
            hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
            component: () => import('@/views/ram/UserList'),
            meta: { title: '用户管理', keepAlive: true, permission: [ 'ram' ] }
          },
          {
            path: '/ram/list/role',
            name: 'RoleList',
            component: () => import('@/views/ram/RoleList'),
            meta: { title: '角色列表', keepAlive: true, permission: [ 'ram' ] }
          },
          {
            path: '/ram/list/permission',
            name: 'PermissionList',
            component: () => import('@/views/ram/PermissionList'),
            meta: { title: '权限列表', keepAlive: true, permission: [ 'ram' ] }
          }
        ]
      },
      // profile
      {
        path: '/profile',
        name: 'profile',
        component: RouteView,
        redirect: '/profile/basic',
        meta: { title: '详情页', icon: 'profile', permission: [ 'profile' ] },
        children: [
          {
            path: '/profile/basic',
            name: 'ProfileBasic',
            component: () => import('@/views/profile/basic/Index'),
            meta: { title: '基础详情页', permission: [ 'profile' ] }
          },
          {
            path: '/profile/advanced',
            name: 'ProfileAdvanced',
            component: () => import('@/views/profile/advanced/Advanced'),
            meta: { title: '高级详情页', permission: [ 'profile' ] }
          }
        ]
      },

      // account
      {
        path: '/account',
        component: RouteView,
        redirect: '/account/center',
        name: 'account',
        meta: { title: '个人页', icon: 'user', keepAlive: true, permission: [ 'user' ] },
        children: [
          {
            path: '/account/center',
            name: 'center',
            component: () => import('@/views/account/center/Index'),
            meta: { title: '个人中心', keepAlive: true, permission: [ 'user' ] }
          },
          {
            path: '/account/settings',
            name: 'settings',
            component: () => import('@/views/account/settings/Index'),
            meta: { title: '个人设置', hideHeader: true, permission: [ 'user' ] },
            redirect: '/account/settings/security',
            hideChildrenInMenu: true,
            children: [
              {
                path: '/account/settings/security',
                name: 'SecuritySettings',
                component: () => import('@/views/account/settings/Security'),
                meta: { title: '安全设置', hidden: true, keepAlive: true, permission: [ 'user' ] }
              },
              {
                path: '/account/settings/custom',
                name: 'CustomSettings',
                component: () => import('@/views/account/settings/Custom'),
                meta: { title: '个性化设置', hidden: true, keepAlive: true, permission: [ 'user' ] }
              },
              {
                path: '/account/settings/binding',
                name: 'BindingSettings',
                component: () => import('@/views/account/settings/Binding'),
                meta: { title: '账户绑定', hidden: true, keepAlive: true, permission: [ 'user' ] }
              },
              {
                path: '/account/settings/notification',
                name: 'NotificationSettings',
                component: () => import('@/views/account/settings/Notification'),
                meta: { title: '新消息通知', hidden: true, keepAlive: true, permission: [ 'user' ] }
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*', redirect: '/404', hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult')
      }
    ]
  },

  {
    path: '/exception/403',
    name: 'Exception403',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/403'),
    meta: { title: '403', permission: [ 'exception' ] }
  },
  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  },
  {
    path: '/exception/404',
    name: 'Exception404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404'),
    meta: { title: '404', permission: [ 'exception' ] }
  },
  {
    path: '/exception/500',
    name: 'Exception500',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/500'),
    meta: { title: '500', permission: [ 'exception' ] }
  }

]
