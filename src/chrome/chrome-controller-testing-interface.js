import ChromeController from './chrome-controller'

console.log('ChromeController')
console.log(ChromeController)

const ControllerWrapper = {
  testMe: 'tester',
  sendMessage: (data, resFunction) => {
    console.log('sendMessage in Controller')
    if (data && data.action === 'signIn1') {
      console.log('SIGN IN')
    } else {
      const extraFunctions = { // Need to sort these!
        startSignIn: null,
        sendMessageToCurrentTab: null
      }
      ChromeController.onMessage(data, resFunction, extraFunctions)
    }
    // const extraFunctions = { // Need to sort these!
    //   startSignIn: null,
    //   sendMessageToCurrentTab: null
    // }
    // ChromeController.onMessage(data, resFunction, extraFunctions)
  }
}
export default ControllerWrapper
