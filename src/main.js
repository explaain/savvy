// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Dashboard from './dashboard'
import router from './router'

require('./styles/index.css')
require('./styles/dashboard.css')

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#dashboard',
  router,
  template: '<Dashboard/>',
  components: { Dashboard }
})
