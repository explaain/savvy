/* global chrome */

const stateChangeListeners = []

/* Gets called when the auth state changes, and proceeds to call every listenerFunction */
const stateChanged = (state, user) => {
  console.log('stateChangeCallback (chrome-controller-interface.js)', state, user)
  console.log('stateChangeListeners to call (chrome-controller-interface.js):', stateChangeListeners)
  stateChangeListeners.forEach(listenerFunction => {
    listenerFunction(state, user)
  })
}

class ChromeControllerInterface {
  signIn() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'signIn' }, resolve)
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
  saveCard(data) {
    return new Promise((resolve, reject) => {
      console.log('saveCard (chrome-controller-interface.js)')
      chrome.runtime.sendMessage({ action: 'saveCard', data: data }, resolve)
    })
  }
  deleteCard(data) {
    return new Promise((resolve, reject) => {
      console.log('deleteCard (chrome-controller-interface.js)')
      chrome.runtime.sendMessage({ action: 'deleteCard', data: data }, resolve)
    })
  }
  verifyCard(data) {
    return new Promise((resolve, reject) => {
      console.log('verifyCard (chrome-controller-interface.js)')
      chrome.runtime.sendMessage({ action: 'verifyCard', data: data }, resolve)
    })
  }
  searchCards(data) {
    return new Promise((resolve, reject) => {
      console.log('searchCards (chrome-controller-interface.js)')
      chrome.runtime.sendMessage({ action: 'searchCards', data: data }, resolve)
    })
  }
  getCard(data) {
    return new Promise((resolve, reject) => {
      console.log('getCard (chrome-controller-interface.js)')
      chrome.runtime.sendMessage({ action: 'getCard', data: data }, resolve)
    })
  }
  force(toForce) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'force', data: toForce }, resolve)
    })
  }
}

window.addEventListener('message', event => {
  switch (event.data.action) {
    case 'stateChanged':
      console.log('stateChanged (chrome-controller-interface.js)', event.data)
      console.log('should we use this...', event.data.state, event.data.user)
      console.log('...or this?', event.data.data.state, event.data.data.user)
      stateChanged(event.data.state, event.data.user)
      break
  }
}, false)

export default ChromeControllerInterface
