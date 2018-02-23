// Deprecating! Skips this and goes straight to Controller.
// @TODO: Ultimately Delete This File

import * as firebase from 'firebase'
import Controller from './controller'

class ControllerWrapper {
  constructor(config) {
    config.testing = true
    config.firebaseInstance = firebase
    this.Controller = new Controller(config)
    this.authState = this.Controller.authState
    this.signIn = this.Controller.signIn
    this.signOut = this.Controller.signOut
    this.toggleSignIn = this.Controller.toggleSignIn
    this.getUser = this.Controller.getUser
    this.getAccessToken = this.Controller.getAccessToken
    this.refreshUserToken = this.Controller.refreshUserToken
    this.addStateChangeListener = this.Controller.addStateChangeListener
    this.sendMessage = (data, resFunction) => {
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
}
export default ControllerWrapper
