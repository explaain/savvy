/* global chrome */

const stateChangeListeners = []

class ChromeControllerInterface {
  signIn() {
    return new Promise((resolve, reject) => {
      this.sendMessage({action: 'signIn'}, resolve)
    })
  }
  signOut() {
    console.log('No sign out option in Chrome extension yet!')
  }
  addStateChangeListener(listenerFunction) {
    console.log('AAAA addStateChangeListener', listenerFunction)
    stateChangeListeners.push(listenerFunction)
  }

  getUser() {
    return new Promise((resolve, reject) => {
      console.log('getUser (chrome-controller-interface.js)')
      chrome.runtime.sendMessage({ action: 'getUser' }, resolve)
    })
  }
  getAccessToken() {
    return new Promise((resolve, reject) => {
      console.log('getAccessToken (chrome-controller-interface.js)')
      chrome.runtime.sendMessage({ action: 'getAccessToken' }, resolve)
    })
  }
  refreshUserToken() {
    return new Promise((resolve, reject) => {
      console.log('refreshUserToken (chrome-controller-interface.js)')
      chrome.runtime.sendMessage({ action: 'refreshUserToken' }, resolve)
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
