// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import put from '101/put'
import LogRocket from 'logrocket'
import Vue from 'vue'
import router from './router'
import Dashboard from './dashboard'
import Chrome from './components/chrome/chrome'
import ChromeControllerInterface from './chrome/chrome-controller-interface'
import Controller from './controller' // Ideally this is only imported if we're testing
import * as firebase from 'firebase'

// import Popup from './components/explorer/popup'

require('./styles/index.css')

LogRocket.init('cqmhn2/savvy-development')

Vue.config.productionTip = false

const algolia = {
  appID: 'D3AE3TSULH'
}

class Main {
  constructor(props) {
    const mainSelf = this
    // @TODO: This should choose Controller not just for testing but also for webapp
    const ControllerClass = props.env === 'testing' ? Controller : ChromeControllerInterface
    const ControllerConfig = props.env === 'testing' ? { firebaseInstance: firebase } : {}
    mainSelf.Controller = new ControllerClass(ControllerConfig)
    /* eslint-disable no-new */
    const v = new Vue({
      el: '#app',
      router,
      render(h) {
        return h(props.plugin ? Chrome : Dashboard, {
          props: {
            GlobalConfig: this.GlobalConfig,
            Controller: mainSelf.Controller,
            authState: this.authState || 'notfound',
            sidebar: props.sidebar,
            LogRocket: LogRocket,
          }
        })
      },
      data: {
        // @TODO: Eventually deprecate GlobalConfig and use Controller for all global things
        GlobalConfig: {
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
            signIn: () => {
              console.log('fake signin')
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
      if (userData && userData.auth) {
        LogRocket.identify(userData.uid, {
          name: userData.auth.displayName,
          email: userData.auth.email,
          organisation: userData.data ? userData.data.organisationID : null
        })
      }
    }

    const updateGlobalConfig = (key, val) => {
      console.log('updateGlobalConfig', key, val)
      v.GlobalConfig = put(v.GlobalConfig, key, val)
    }

    this.Controller.addStateChangeListener(onAuthStateChanged)
    console.log('this.Controller.getUser (main.js)')
    this.Controller.getUser()
    .then(user => {
      v.GlobalConfig.auth.user = user
      if (user && user.uid && user.data.organisationID) {
        v.authState = 'loggedIn'
        console.log('loggedIn!!!')
        LogRocket.identify(user.uid, {
          name: user.auth.displayName,
          email: user.auth.email,
          organisation: user.data.organisationID
        })
      }

      updateGlobalConfig('auth.signIn', this.Controller.signIn) // Doesn't yet work for ChromeControllerInterface
      updateGlobalConfig('auth.signOut', this.Controller.signOut) // Doesn't yet work for ChromeControllerInterface
      updateGlobalConfig('auth.toggleSignIn', this.Controller.toggleSignIn) // Doesn't yet work for ChromeControllerInterface
    })
  }
}

export default Main
