/* global window, chrome */
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import LogRocket from 'logrocket'
import Vue from 'vue'
import router from './router'
import Dashboard from './dashboard'
import Chrome from './components/chrome/chrome'
import ChromeControllerInterface from './chrome/chrome-controller-interface'
import ControllerInterface from './controller-interface' // Ideally this is only imported if we're testing

// import Popup from './components/explorer/popup'

require('./styles/index.css')

LogRocket.init('cqmhn2/savvy-development')

Vue.config.productionTip = false

class Main {
  constructor(props) {
    const mainSelf = this
    // @TODO: This should choose Controller not just for testing but also for webapp
    console.log('props')
    console.log(props)
    const ControllerInterfaceClass = (props.env === 'testing' || props.demo) ? ControllerInterface : ChromeControllerInterface
    mainSelf.Controller = new ControllerInterfaceClass({ demo: props.demo })

    Vue.filter('capitalise', (value, initial) => {
      if (!value) return ''
      const splitChar = {
        kebab: '-',
        default: ' ',
      }[initial || 'default'] || ' '
      return value.toString().split(splitChar).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    })

    /* eslint-disable no-new */
    const v = new Vue({
      el: '#app',
      router,
      render(h) {
        return h(props.plugin || props.demo ? Chrome : Dashboard, {
          props: {
            Controller: mainSelf.Controller,
            authState: this.authState,
            user: this.user,
            sidebar: props.sidebar,
            LogRocket: LogRocket,
            demo: props.demo || false
          }
        })
      },
      data: {
        authState: 'pending',
        user: {}
      },
      // created: function () {
      //   window.addEventListener('keyup', this.keyPressed)
      // },
      // methods: {
      //   keyPressed: function (event) {
      //     console.log('keyPressed', event)
      //   }
      // }
    })

    const onAuthStateChanged = (state, user) => {
      console.log('onAuthStateChanged (main.js)', state, user)
      if (state) v.authState = state
      v.user = user
      if (user && user.auth) {
        LogRocket.identify(user.uid, {
          name: user.auth.displayName,
          email: user.auth.emails ? user.auth.emails[0] : user.auth.email,
          organisation: user.data ? user.data.organisationID : null
        })
      }
      console.log('Current authState and user: ', v.authState, v.user)
    }

    this.Controller.addStateChangeListener(onAuthStateChanged)
    console.log('this.Controller.getUser (main.js)')
    this.Controller.getUser()
    .then(user => {
      const authState = user && user.uid && user.data.organisationID ? 'loggedIn' : null
      console.log('Forcing onAuthStateChanged()')
      onAuthStateChanged(authState, user)
    })

    window.addEventListener('message', function(event) {
      switch (event.data.action) {
        case 'stateChanged':
          console.log('stateChanged', event.data)
          onAuthStateChanged(event.data.data.state, event.data.data.user)
          break
      }
    })

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Request received (main.js)', request)
      if (request.action)
        switch (request.action) {
          case 'stateChanged':
            onAuthStateChanged(request.data.state, request.data.user)
            break
        }
      return true
    })
  }
}

export default Main
