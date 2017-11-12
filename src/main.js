// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import router from './router'
// import Dashboard from './dashboard'
import Chrome from './components/chrome/chrome'

require('./styles/index.css')

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#dashboard',
  router,
  render: h => h(Chrome, {
    props: {
      sidebar: true
    }
  })
})
