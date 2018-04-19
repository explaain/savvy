/* global window, chrome */
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import LogRocket from 'logrocket'
import Raven from 'raven-js'
import Airship from 'airship-js'
import Vue from 'vue'
// import router from './router'
import Dashboard from './dashboard'
import Chrome from './components/chrome/chrome'
import ConnectPage from './components/connect-page'
import ChromeControllerInterface from './chrome/chrome-controller-interface'
import ControllerInterface from './controller-interface' // Ideally this is only imported if we're testing

// import Popup from './components/explorer/popup'

require('./styles/index.css')

LogRocket.init('cqmhn2/savvy-development')

// Create an instance with webApiKey and envKey
let airship = new Airship({webApiKey: 'yqfb07697ad5lak33tu75docb2duty5f', envKey: 'ky4t3nn8vp56n169'})
// Should be used as a singleton

Vue.config.productionTip = false

const errorToPassDown = {
  message: null
}

// if (chrome && chrome.processes && chrome.processes.getProcessInfo) {
//   console.log('Fetching Process Info')
//   chrome.processes.getProcessInfo([], true, processes => {
//     console.log('Fetched Process Info!')
//     console.log(processes)
//     console.log(JSON.stringify(processes))
//   })
// }

class Main {
  constructor(props) {
    const mainSelf = this
    // @TODO: This should choose Controller not just for testing but also for webapp
    console.log('props')
    console.log(props)
    const ControllerInterfaceClass = (props.mode === 'chrome' && props.env !== 'testing') ? ChromeControllerInterface : ControllerInterface
    console.log('ControllerInterfaceClass')
    console.log(ControllerInterfaceClass)
    mainSelf.Controller = new ControllerInterfaceClass({ mode: props.mode })

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
      // router,
      render(h) {
        return h(props.mode === 'connect' ? ConnectPage : props.plugin || props.mode === 'demo' ? Chrome : Dashboard, {
          props: {
            Controller: mainSelf.Controller,
            authState: this.authState,
            user: this.user,
            sidebar: props.sidebar,
            mode: props.mode || false,
            parentError: errorToPassDown,
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
        console.log(111)
        LogRocket.identify(user.uid, {
          name: user.auth.displayName,
          email: user.auth.emails ? user.auth.emails[0] : user.auth.email,
          organisation: user.data ? user.data.organisationID : null
        })
        Raven.setUserContext({
          name: user.auth.displayName,
          email: user.auth.emails ? user.auth.emails[0] : user.auth.email,
          id: user.auth.emails ? user.auth.emails[0] : (user.auth.email || user.uid),
        })
        console.log(222)
        if (user.data) {
          // Identifty the user, returns a Promise.
          airship.identify({
            type: 'User',
            id: user.uid,
            displayName: user.auth.emails ? user.auth.emails[0] : user.auth.email,
            attributes: {
              organisationID: user.data ? user.data.organisationID : '0',
            },
            // group: {
            //   type: 'Organisation',
            //   id: user.data ? user.data.organisationID : '0',
            //   displayName: 'SF Homeowners Club'
            // }
          }).then(() => {
            console.log(333)
            console.log('airship.isEnabled(\'new-design-ideas\')')
            console.log(airship.isEnabled('new-design-ideas'))
          })
        }
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
    }).catch(err => {
      console.error('Failed to Log In', err)
      LogRocket.captureMessage('Failed to Log In', {
        extra: {
          err: err,
          data: {
            authState: v.authState,
            user: v.user,
            sidebar: v.sidebar,
            mode: v.mode,
            parentError: v.parentError,
          }
        }
      })
      Raven.captureMessage('Failed to Log In', {
        extra: {
          err: err,
          data: {
            authState: v.authState,
            user: v.user,
            sidebar: v.sidebar,
            mode: v.mode,
            parentError: v.parentError,
          }
        }
      })
    })

    // Just in case something went wron with login, try again after 6 seconds!
    setTimeout(() => {
      if (!v.authState || !v.user || !v.user.auth || !v.user.data) {
        console.log('Having to resort to a backup login attempt')
        LogRocket.captureMessage('Having to resort to a backup login attempt', {
          extra: {
            data: {
              authState: v.authState,
              user: v.user,
              sidebar: v.sidebar,
              mode: v.mode,
              parentError: v.parentError,
            }
          }
        })
        Raven.captureMessage('Having to resort to a backup login attempt', {
          extra: {
            data: {
              authState: v.authState,
              user: v.user,
              sidebar: v.sidebar,
              mode: v.mode,
              parentError: v.parentError,
            }
          }
        })
        this.Controller.getUser()
        .then(user => {
          const authState = user && user.uid && user.data.organisationID ? 'loggedIn' : null
          console.log('Forcing onAuthStateChanged()')
          onAuthStateChanged(authState, user)
        }).catch(err => {
          console.error('Failed to Log In (even on the backup attempt)', err)
          LogRocket.captureMessage('Failed to Log In (even on the backup attempt)', {
            extra: {
              err: err,
              data: {
                authState: v.authState,
                user: v.user,
                sidebar: v.sidebar,
                mode: v.mode,
                parentError: v.parentError,
              }
            }
          })
          Raven.captureMessage('Failed to Log In (even on the backup attempt)', {
            extra: {
              err: err,
              data: {
                authState: v.authState,
                user: v.user,
                sidebar: v.sidebar,
                mode: v.mode,
                parentError: v.parentError,
              }
            }
          })
        })
      }
    }, 6000)

    window.addEventListener('message', function(event) {
      switch (event.data.action) {
        case 'stateChanged':
          console.log('stateChanged', event.data)
          onAuthStateChanged(event.data.data.state, event.data.data.user)
          break
      }
    })

    if (chrome && chrome.runtime && chrome.runtime.onMessage) {
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
}

export default Main
