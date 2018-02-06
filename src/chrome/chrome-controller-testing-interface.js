import * as firebase from 'firebase'
import Controller from './controller'

class ControllerWrapper {
  constructor(config) {
    config.testing = true
    config.firebaseInstance = firebase
    this.Controller = new Controller(config)
    this.authState = this.Controller.authState
  }
  toggleSignIn() {
    return this.Controller.toggleSignIn()
  }
  getUser() {
    return this.Controller.getUser()
  }
  addStateChangeListener(listenerFunction) {
    return this.Controller.addStateChangeListener(listenerFunction)
  }
  sendMessage(data, resFunction) {
    const self = this
    console.log('sendMessage in Controller')
    const extraFunctions = {
      startSignIn: self.Controller.startSignIn,
      sendMessageToCurrentTab: null // Need to sort these!
    }
    this.Controller.onMessage(data, resFunction, extraFunctions)
    // const extraFunctions = { // Need to sort these!
    //   startSignIn: null,
    //   sendMessageToCurrentTab: null
    // }
    // this.Controller.onMessage(data, resFunction, extraFunctions)
  }
}
export default ControllerWrapper
