// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import put from '101/put'
import Vue from 'vue'
import router from './router'
import Dashboard from './dashboard'
import Auth from './plugins/auth.js'
import Chrome from './components/chrome/chrome'
import chromeControllerInterface from './chrome/chrome-controller-interface'
import chromeControllerTestingInterface from './chrome/chrome-controller-testing-interface' // Ideally this is only imported if we're testing

// import Popup from './components/explorer/popup'

require('./styles/index.css')

Vue.config.productionTip = false

const firebase = {
  apiKey: 'AIzaSyBU0SEu3orHAoJ5eqxIJXS2VfyqXm1HoMU',
  authDomain: 'forgetmenot-1491065404838.firebaseapp.com',
  databaseURL: 'https://forgetmenot-1491065404838.firebaseio.com',
  projectId: 'forgetmenot-1491065404838',
  storageBucket: '',
  messagingSenderId: '400087312665'
}
const algolia = {
  appID: 'D3AE3TSULH'
}

console.log('main.js running')
console.log('Chrome')
console.log(Chrome)
console.log('chromeControllerTestingInterface')
console.log(chromeControllerTestingInterface)
console.log('chromeControllerInterface')
console.log(chromeControllerInterface)

class Main {
  constructor(props) {
    console.log('props')
    console.log(props)
    /* eslint-disable no-new */
    const v = new Vue({
      el: '#app',
      router,
      render(h) {
        return h(props.plugin ? Chrome : Dashboard, {
          props: {
            GlobalConfig: this.GlobalConfig,
            Controller: props.env === 'testing' ? chromeControllerTestingInterface : chromeControllerInterface,
            // Controller: chromeControllerInterface,
            authState: this.authState,
            sidebar: props.sidebar
          }
        })
      },
      data: {
        GlobalConfig: {
          firebase: firebase,
          algolia: algolia,
          author: {
            url: '//' + (process.env.BACKEND_URL || 'forget-me-not--staging.herokuapp.com') + '/api/memories',
            importUrl: '//' + (process.env.BACKEND_URL || 'forget-me-not--staging.herokuapp.com') + '/api/import'
          },
          organisation: {},
          auth: {
            user: {
              uid: '',
              auth: {},
              data: {}
            },
            toggleSignIn: () => {
              console.log('fake toggling')
            }
          },
        },
        authState: 'pending'
      }
    })

    const onAuthStateChanged = (state, userData) => {
      console.log('onAuthStateChanged', state, userData)
      updateGlobalConfig('auth.user', userData)
      v.authState = state
    }

    const updateGlobalConfig = (key, val) => {
      console.log('updateGlobalConfig', key, val)
      v.GlobalConfig = put(v.GlobalConfig, key, val)
    }

    const myAuth = new Auth(onAuthStateChanged) //, { firebase: firebase, getUserDataUrl: 'https://forget-me-not--staging.herokuapp.com/api/user' })
    console.log('myAuth', myAuth)
    updateGlobalConfig('auth.toggleSignIn', myAuth.toggleSignIn)
  }
}

export default Main
