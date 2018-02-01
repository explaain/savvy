import Controller from './controller'

class ControllerWrapper {
  constructor(config) {
    this.Controller = new Controller(config)
    this.authState = this.Controller.authState
  }
  toggleSignIn() {
    return this.Controller.toggleSignIn()
  }
  addStateChangeListener(listenerFunction) {
    return this.Controller.addStateChangeListener(listenerFunction)
  }
  sendMessage(data, resFunction) {
    console.log('sendMessage in Controller')
    if (data && data.action === 'signIn1') {
      console.log('SIGN IN1')
    } else {
      console.log('MESSAGE')
      const extraFunctions = { // Need to sort these!
        startSignIn: this.Controller.toggleSignIn,
        // startSignIn: () => { console.log('startSignInstartSignIn') },
        // startSignIn: null,
        sendMessageToCurrentTab: null
      }
      this.Controller.onMessage(data, resFunction, extraFunctions)
    }
    // const extraFunctions = { // Need to sort these!
    //   startSignIn: null,
    //   sendMessageToCurrentTab: null
    // }
    // this.Controller.onMessage(data, resFunction, extraFunctions)
  }
}
export default ControllerWrapper
