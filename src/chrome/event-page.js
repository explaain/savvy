/* global chrome */

import log from 'loglevel'
import Controller from './chrome/controller'

log.setLevel('debug')

var allowContinue = Controller.initializeApp()

/**
 * Start the auth flow and authorizes to Firebase.
 * @param{boolean} interactive True if the OAuth flow should request with an interactive mode.
 */
const startAuth = (interactive) => new Promise((resolve, reject) => {
  // Request an OAuth token from the Chrome Identity API.
  chrome.identity.getAuthToken({interactive: !!interactive}, token => {
    console.log(token)
    if (chrome.runtime.lastError && !interactive) {
      console.log('It was not possible to get a token programmatically.')
      reject(new Error('It was not possible to get a token programmatically.'))
    } else if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError)
      reject(chrome.runtime.lastError)
    } else if (token) {
      Controller.authSignIn(token)
      .then(res => {
        resolve(res)
      }).catch(error => {
        // The OAuth token might have been invalidated. Lets' remove it from cache.
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
  if (!Controller.signedIn()) {
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

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    log.debug((sender.tab ? '📬 🖌  Event from a content script: ' + sender.tab.url : '📬 ⛓  Event from the extension'), request)
    const extraFunctions = {
      startSignIn: startSignIn,
      sendMessageToCurrentTab: messageData => {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
          chrome.tabs.sendMessage(tabs[0].id, messageData, response => {})
        })
      }
    }
    return Controller.onMessage(request, sendResponse, extraFunctions)
  })
}
