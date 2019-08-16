

<h1 align="center">Travel Path Console</h1>
<div align="center">
An Vehicle travel trajectory analysis platform  <a href="https://github.com/guqing/travel-path-console" target="_blank">Travel Path Console</a>
</div>


- Built on ant design pro vue

![dashboard + multi-tabs](https://static-2.loacg.com/open/static/github/20190224163345.jpg)

![dashboard + setting](https://static-2.loacg.com/open/static/github/20181126112124.png)

![user profile](https://static-2.loacg.com/open/static/github/20180916-134251.png)

![permission list](https://static-2.loacg.com/open/static/github/20180916-154937.png)


### Env and dependencies

- node
- yarn
- webpack
- eslint
- @vue/cli ~3
- [ant-design-vue](https://github.com/vueComponent/ant-design-vue) - Ant Design Of Vue 
- [vue-cropper](https://github.com/xyxiao001/vue-cropper) - Picture edit
- [@antv/g2](https://antv.alipay.com/zh-cn/index.html) - AntV G2
- [Viser-vue](https://viserjs.github.io/docs.html#/viser/guide/installation)  - Antv/G2 of Vue

> Note:  [Yarn](https://yarnpkg.com/) package management is recommended, the exact same version loaded with the demo site of this project (yarn.lock) . but you can also use npm


### Project setup

- Clone repo
```bash
git clone https://github.com/sendya/ant-design-pro-vue.git
cd ant-design-pro-vue
```

- Install dependencies
```
yarn install
```

- Compiles and hot-reloads for development
```
yarn run serve
```

- Compiles and minifies for production
```
yarn run build
```

- Lints and fixes files
```
yarn run lint
```


### Other

- **IMPORTANT : About Issue feedback !! when opening Issue read [Issue / PR Contributing](https://github.com/sendya/ant-design-pro-vue/issues/90)**

- [Vue-cli3](https://cli.vuejs.org/guide/) used by the project.
- Disable Eslint (not recommended): remove `eslintConfig`  field in `package.json`  and `vue.config.js` field `lintOnSave: false`

- Load on Demand: modify `/src/main.js` L7,  append `import './core/lazy_use'` code.

- Customize Theme:  `vue.config.js` 
eg: 
```ecmascript 6
  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          /* Less variables, required modifyVars*/

          'primary-color': '#F5222D',
          'link-color': '#F5222D',
          'border-radius-base': '4px',
        },
        javascriptEnabled: true,
      }
    }
  }
```
- **polyfill**

- remove polyfill: 
  > [Vue CLI Polyfill](https://cli.vuejs.org/zh/guide/browser-compatibility.html#usebuiltins-usage)
  
  - remove `import '@babel/polyfill'`  field in  `src/main.js`
  - `babel.conflg.js` remove
    ```ecmascript 6
    [
      '@babel/preset-env',
      {
        'useBuiltIns': 'entry'
      }
    ]
    ```

