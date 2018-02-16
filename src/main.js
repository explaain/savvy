// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import put from '101/put'
// import LogRocket from 'logrocket'
import Vue from 'vue'
import router from './router'
import Dashboard from './dashboard'
import Chrome from './components/chrome/chrome'
import ChromeControllerInterface from './chrome/chrome-controller-interface'
import ChromeControllerTestingInterface from './chrome/chrome-controller-testing-interface' // Ideally this is only imported if we're testing

// import Popup from './components/explorer/popup'

require('./styles/index.css')

// LogRocket.init('cqmhn2/savvy-development')

Vue.config.productionTip = false

const firebaseConfig = {
  apiKey: 'AIzaSyDbf9kOP-Mb5qroUdCkup00DFya0OP5Dls',
  authDomain: 'savvy-96d8b.firebaseapp.com',
}
const algolia = {
  appID: 'D3AE3TSULH'
}

console.log('main.js running')
console.log('Chrome')
console.log(Chrome)
// console.log('ChromeControllerTestingInterface')
// console.log(ChromeControllerTestingInterface)
// console.log('ChromeControllerInterface')
// console.log(ChromeControllerInterface)

class Main {
  constructor(props) {
    const mainSelf = this
    mainSelf.Controller = props.env === 'testing' ? new ChromeControllerTestingInterface({ firebaseConfig: firebaseConfig }) : new ChromeControllerInterface()
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
            Controller: mainSelf.Controller,
            authState: this.authState,
            sidebar: props.sidebar
          }
        })
      },
      data: {
        GlobalConfig: {
          firebase: firebaseConfig,
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
      console.log('onAuthStateChanged (main.js)', state, userData)
      updateGlobalConfig('auth.user', userData)
      v.authState = state
    }

    const updateGlobalConfig = (key, val) => {
      console.log('updateGlobalConfig', key, val)
      v.GlobalConfig = put(v.GlobalConfig, key, val)
    }

    this.Controller.addStateChangeListener(onAuthStateChanged)
    console.log('this.Controller.getUser (main.js)')
    var user = this.Controller.getUser()
    // .then(user => {
    v.GlobalConfig.auth.user = user
    if (user.uid && user.data.organisationID) {
      v.authState = 'loggedIn'
      console.log('loggedIn!!!')
      // LogRocket.identify(user.uid, {
        // name: user.auth.displayName,
        // email: user.auth.email,
        // organisation: user.data.organisationID
      // })
    }
    // })

    updateGlobalConfig('auth.toggleSignIn', this.Controller.toggleSignIn) // Doesn't yet work for ChromeControllerInterface
  }
}

export default Main
