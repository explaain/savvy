/* global chrome */

const stateChangeListeners = []

class ChromeControllerInterface {
  sendMessage(data, resFunction) {
    try {
      if (chrome) {
        console.log('chrome', chrome)
        if (chrome.runtime) {
          console.log('Sending message to chrome (chrome-controller-interface.js):', data, resFunction)
          return chrome.runtime.sendMessage(data, resFunction)
        }
      }
    } catch (e) {
      return false
    }
  }
  addStateChangeListener(listenerFunction) {
    console.log('AAAA addStateChangeListener', listenerFunction)
    stateChangeListeners.push(listenerFunction)
  }

  getUser() {
    return new Promise((resolve, reject) => {
      console.log('getUser (chrome-controller-interface.js)')
      chrome.runtime.sendMessage({ action: 'getUser' }, user => {
        resolve(user)
      })
    })
  }
}

const onAuthStateChanged = (state, user) => {
  console.log('user', user)
  stateChangeListeners.forEach(listenerFunction => {
    listenerFunction(state, user)
  })
}

window.addEventListener('message', event => {
  // console.log('event!', event)
  switch (event.data.action) {
    case 'onAuthStateChanged':
      console.log('onAuthStateChanged (chrome-controller-interface.js)', event.data)
      onAuthStateChanged(event.data.state, event.data.user)
      break
  }
}, false)

export default ChromeControllerInterface
