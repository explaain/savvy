/* global chrome */

import log from 'loglevel'
import Controller from '../controller'
import axios from 'axios'

log.setLevel('debug')

console.log('Constructing Controller from event-page')
const myController = new Controller({})

var allowContinue = true // Controller.initialise()

const stateChangeListener = (state, user) => {
  console.log('stateChangeListener (event-page.js)', state, user)
  sendMessageToAllTabs({
    action: 'onAuthStateChanged',
    data: {
      state: state,
      // user: user // @TODO: Figure out whether we can include this or not (might not be a stringifyable object so may mess up the sendMessage sending)
    }
  })
}

const sendMessageToCurrentTab = messageData => {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, messageData, response => {})
  })
}

const sendMessageToAllTabs = messageData => {
  console.log('sendMessageToAllTabs (event-page.js):', messageData)
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    tabs.forEach(tab => {
      console.log('sending message to tab ' + tab.id + ' (event-page.js):', messageData)
      chrome.tabs.sendMessage(tab.id, messageData, response => {})
    })
  })
}

console.log('adding the state change listener')
myController.addStateChangeListener(stateChangeListener)

/**
 * Start the auth flow and authorizes to Firebase.
 * @param{boolean} interactive True if the OAuth flow should request with an interactive mode.
 */
const startAuth = (interactive) => new Promise((resolve, reject) => {
  // Request an OAuth token from the Chrome Identity API.
  console.log('startAuth')
  chrome.identity.getAuthToken({interactive: !!interactive}, token => {
    console.log(token)
    if (chrome.runtime.lastError && !interactive) {
      console.log('It was not possible to get a token programmatically.')
      reject(new Error('It was not possible to get a token programmatically.'))
    } else if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError)
      reject(chrome.runtime.lastError)
    } else if (token) {
      console.log('signing in')
      myController.authSignIn(token)
      .then(res => {
        resolve(res)
      }).catch(error => {
        // The OAuth token might have been invalidated. Lets' remove it from cache.
        console.log('Sign In failed with error code ' + error.code)
        if (error.code === 'auth/invalid-credential') {
          chrome.identity.removeCachedAuthToken({token: token}, () => {
            startAuth(interactive)
          })
        }
        reject(new Error())
      })
    } else {
      console.error('The OAuth Token was null')
      reject(new Error('The OAuth Token was null'))
    }
  })
})

/**
 * Starts the sign-in process.
 */
const startSignIn = () => new Promise((resolve, reject) => {
  if (!myController.signedIn()) {
    console.log('yo')
    startAuth(true)
    .then(res => {
      resolve(res)
    }).catch(e => {
      console.log(e)
      reject(e)
    })
  } else {
    console.log('hi')
    resolve()
    // firebase.auth().signOut()
  }
})

if (allowContinue) {
  console.log('Allow signin')
  // Not sure whether this should be in or not!
  // startSignIn()
  // .then(res => {
  //   log.info(res)
  // }).catch(e => {
  //   log.info(e)
  // })

  /* ----------------------- */
  /* ----------------------- */
  /* --- Event Listeners --- */

  chrome.browserAction.onClicked.addListener(tab => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => { // Couldn't we just use 'tab' from the line above?
      chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleDrawer'}, res => {
        log.info(res)
      })
    })
  })

  // chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //   log.debug((sender.tab ? '📬 🖌  Event from a content script: ' + sender.tab.url : '📬 ⛓  Event from the extension'), request)
  //   const extraFunctions = {
  //     startSignIn: startSignIn,
  //     sendMessageToCurrentTab: sendMessageToCurrentTab
  //   }
  //   return myController.onMessage(request, sendResponse, extraFunctions)
  // })
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    log.debug((sender.tab ? '📬 🖌  Event from a content script: ' + sender.tab.url : '📬 ⛓  Event from the extension'), request)
    var promiseFunction
    if (request.action)
      switch (request.action) {
        case 'signIn':
          promiseFunction = myController.signIn(startSignIn)
          break
        case 'getUser':
          promiseFunction = myController.getUser()
          break
        case 'getAccessToken':
          promiseFunction = myController.getAccessToken()
          break
        case 'refreshUserToken':
          promiseFunction = myController.refreshUserToken()
          break
        case 'saveCard':
          promiseFunction = axios.post(request.url, request.data) // Doesn't yet use Controlled because for non-chrome-extension this is already done ExplaainAuthor
          break
      }
    else if (request.event)
      switch (request.event) {
        case 'popupOpened':
          sendMessageToCurrentTab({event: 'popupOpened'})
          break
      }
    promiseFunction.then(res => {
      console.log('Responding: ', res)
      sendResponse(res)
    }).catch(e => {
      log.error(e)
      sendResponse({ error: e })
    })
    return true
  })
}
