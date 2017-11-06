// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import router from './router'
import Chrome from './components/chrome/chrome'

require('./styles/index.css')

Vue.config.productionTip = false

if (document.getElementById('chrome'))
  /* eslint-disable no-new */
  new Vue({
    el: '#chrome',
    router,
    render: h => h(Chrome, {
      props: {
        sidebar: false
      }
    })
  })
