// @TODO: Move this out of /chrome as it's now the general controller

// import Vue from 'vue'
import log from 'loglevel'
import Auth from './plugins/auth' // Need to concolidate this + 'auth'
// import * as firebase from 'firebase'
// import CardDetection from '../plugins/card-detection.js'
// import ExplaainSearch from '../plugins/explaain-search.js'

log.setLevel('debug')

const firebaseConfig = {
  apiKey: 'AIzaSyDbf9kOP-Mb5qroUdCkup00DFya0OP5Dls',
  authDomain: 'savvy-96d8b.firebaseapp.com',
}

console.log('STARTING')

const stateChangeListeners = []

const stateChangeCallback = (state, user) => {
  console.log('stateChangeCallback (controller.js)', state, user)
  stateChangeListeners.forEach(listenerFunction => {
    console.log('a listener function')
    listenerFunction(state, user)
  })
}

var myAuth

class Controller {
  constructor(config) {
    console.log('Controller Constructed')
    config.firebaseConfig = firebaseConfig
    myAuth = new Auth(stateChangeCallback, config)
    this.authState = myAuth.authState
  }
  addStateChangeListener(listenerFunction) {
    console.log('❇️ CONTROLLER ❇️ - addStateChangeListener (controller.js)', listenerFunction)
    stateChangeListeners.push(listenerFunction)
    console.log('stateChangeListeners (controller.js):', stateChangeListeners)
  }
  authSignIn(token) {
    console.log('❇️ CONTROLLER ❇️ - authSignIn', token)
    return myAuth.authSignIn(token)
  }
  signIn(specialSignInFunction) {
    console.log('❇️ CONTROLLER ❇️ - signIn', specialSignInFunction)
    console.log(myAuth)
    if (specialSignInFunction)
      return specialSignInFunction()
    else
      return myAuth.signIn()
  }
  signOut() {
    console.log('❇️ CONTROLLER ❇️ - signOut')
    console.log(myAuth)
    return myAuth.signOut()
  }
  toggleSignIn() {
    console.log('❇️ CONTROLLER ❇️ - toggleSignIn')
    console.log(myAuth)
    console.log('Replacing toggleSignIn with signIn')
    // return myAuth.toggleSignIn()
    return myAuth.signIn()
  }
  startSignIn() {
    console.log('❇️ CONTROLLER ❇️ - startSignIn')
    if (!myAuth.signedIn()) {
      console.log('not yet signed in so toggling')
      return myAuth.toggleSignIn()
    }
  }
  signedIn() {
    console.log('❇️ CONTROLLER ❇️ - signedIn')
    return myAuth.signedIn()
  }
  getUser() {
    console.log('❇️ CONTROLLER ❇️ - getUser')
    return myAuth.getUser()
  }
  getAccessToken() {
    console.log('❇️ CONTROLLER ❇️ - getAccessToken')
    return myAuth.getAccessToken()
  }
  refreshUserToken() {
    console.log('❇️ CONTROLLER ❇️ - refreshUserToken')
    return myAuth.refreshUserToken()
  }
}

export default Controller
