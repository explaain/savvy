// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import router from './router'
import Dashboard from './dashboard'
// import Auth from './plugins/auth.js'
// import Chrome from './components/chrome/chrome'
// import Popup from './components/explorer/popup'

require('./styles/index.css')

Vue.config.productionTip = false

const GlobalConfig = { // eslint-disable-line
  firebase: {
    apiKey: 'AIzaSyBU0SEu3orHAoJ5eqxIJXS2VfyqXm1HoMU',
    authDomain: 'forgetmenot-1491065404838.firebaseapp.com',
    databaseURL: 'https://forgetmenot-1491065404838.firebaseio.com',
    projectId: 'forgetmenot-1491065404838',
    storageBucket: '',
    messagingSenderId: '400087312665'
  },
  algolia: {
    appID: 'I2VKMNNAXI',
    apiKey: '2b8406f84cd4cc507da173032c46ee7b',
    index: 'Savvy'
  },
  author: {
    url: '//' + (process.env.BACKEND_URL || 'forget-me-not--staging.herokuapp.com') + '/api/memories',
    importUrl: '//' + (process.env.BACKEND_URL || 'forget-me-not--staging.herokuapp.com') + '/api/import'
  },
  organisation: {

  },
  auth: {

  }
}

/* eslint-disable no-new */
new Vue({
  el: '#dashboard',
  router,
  render: h => h(Dashboard, {
    props: {
      GlobalConfig: GlobalConfig,
      sidebar: true
    }
  })
})
