import * as firebaseInstance from 'firebase'
import Controller from './controller'

const stateChangeListeners = []

/* Gets called when the auth state changes, and proceeds to call every listenerFunction */
const stateChangeCallback = (state, user) => {
  console.log('stateChangeCallback (controller-interface.js)', state, user)
  console.log('stateChangeListeners to call (controller-interface.js):', stateChangeListeners)
  stateChangeListeners.forEach(listenerFunction => {
    listenerFunction(state, user)
  })
}

class ControllerInterface {
  constructor(config) {
    config.firebaseInstance = firebaseInstance
    config.stateChangeCallback = stateChangeCallback
    this.Controller = new Controller(config)
  }
  signIn() {
    return this.Controller.signIn()
  }
  signOut() {
    return this.Controller.signOut()
  }
  getUser() {
    return this.Controller.getUser()
  }
  getAccessToken() {
    return this.Controller.getAccessToken()
  }
  refreshUserToken() {
    return this.Controller.refreshUserToken()
  }
  saveCard(data) {
    return this.Controller.saveCard(data)
  }
  deleteCard(data) {
    return this.Controller.deleteCard(data)
  }
  addStateChangeListener(listenerFunction) {
    console.log('AAAA addStateChangeListener', listenerFunction)
    stateChangeListeners.push(listenerFunction)
  }
}
export default ControllerInterface
