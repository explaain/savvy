/* global chrome */

// @TODO Probably worth moving to this https://developer.chrome.com/extensions/activeTab

import log from 'loglevel'
import LogRocket from 'logrocket'
import Raven from 'raven-js'
import Controller from '../controller'

log.setLevel('debug')
LogRocket.init('cqmhn2/savvy-development')
Raven.config('https://5abb211365ca4cd9a72885762827512f@sentry.io/1187390').install()

// chrome.tabs.query({}, function(tabs) {
//   console.log('tabs', tabs)
//   tabs.forEach((tab, i) => {
//     if (tab.url.indexOf('chrome://') !== 0 && tab.url.indexOf('chrome-extension://') !== 0)
//       chrome.tabs.executeScript(tab.id, { file: 'static/chrome/contentScript.js' }, () => {
//         console.log('executed', i, tab.id)
//       })
//   })
// })

chrome.runtime.onInstalled.addListener(details => {
  if (details && details.reason === 'install')
    chrome.tabs.create({url: 'https://heysavvy.com/chrome-installed'}, tab => {
      console.log('New tab launched with https://heysavvy.com/chrome-installed')
    })
})

const stateChangeCallback = (state, user) => {
  console.log('stateChangeListener (event-page.js)', state, user)
  if (state && user && user.auth) {
    LogRocket.identify(user.uid, {
      name: user.auth.displayName,
      email: user.auth.emails ? user.auth.emails[0] : user.auth.email,
      organisation: user.data ? user.data.organisationID : null
    })
    Raven.setUserContext({
      name: user.auth.displayName,
      email: user.auth.emails ? user.auth.emails[0] : user.auth.email,
      id: user.auth.emails ? user.auth.emails[0] : (user.auth.email || user.uid),
    })
  }
  sendMessageToAllTabs({
    action: 'stateChanged',
    data: {
      state: state,
      user: user
    }
  })
}

console.log('Constructing Controller from event-page')
const config = {
  stateChangeCallback: stateChangeCallback
}
const myController = new Controller(config)

var allowContinue = true // Controller.initialise()

const sendMessageToCurrentTab = messageData => {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    if (tabs.length && tabs[0].id)
      chrome.tabs.sendMessage(tabs[0].id, messageData, response => {})
  })
}

const sendMessageToAllTabs = messageData => {
  console.log('sendMessageToAllTabs (event-page.js):', messageData)
  chrome.tabs.query({}, tabs => {
    console.log('tabs (sendMessageToAllTabs)', tabs)
    tabs.forEach(tab => {
      console.log('sending message to tab ' + tab.id + ' (event-page.js):', messageData)
      chrome.tabs.sendMessage(tab.id, messageData, response => {})
    })
  })
}

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
      }).catch(err => {
        // The OAuth token might have been invalidated. Lets' remove it from cache.
        console.log('Sign In failed with error code ' + err.code)
        if (err.code === 'auth/invalid-credential') {
          chrome.identity.removeCachedAuthToken({token: token}, () => {
            startAuth(interactive)
          })
        }
        console.error(`Couldn't sign user in (event-page.js)`, err)
        LogRocket.captureMessage(`Couldn't sign user in (event-page.js)`, {
          extra: {
            err: err,
            data: {
              interactive: interactive,
              token: token
            }
          }
        })
        Raven.captureMessage(`Couldn't sign user in (event-page.js)`, {
          extra: {
            err: err,
            data: {
              interactive: interactive,
              token: token
            }
          }
        })
        reject(new Error(err))
      })
    } else {
      console.error('The OAuth Token was null')
      LogRocket.captureMessage(`The OAuth Token was null (event-page.js)`, {
        extra: {
          err: `The OAuth Token was null (event-page.js)`,
          data: {
            interactive: interactive,
            token: token
          }
        }
      })
      Raven.captureMessage(`The OAuth Token was null (event-page.js)`, {
        extra: {
          err: `The OAuth Token was null (event-page.js)`,
          data: {
            interactive: interactive,
            token: token
          }
        }
      })
      reject(new Error('The OAuth Token was null'))
    }
  })
})

/**
 * Starts the sign-in process.
 */
const startSignIn = () => new Promise((resolve, reject) => {
  console.log('startSignIn (event-page.js)')
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
  try {
    Raven.context(() => {
      startSignIn().then(console.log).catch(console.log)
    })
  } catch (e) {
    startSignIn().then(console.log).catch(console.log)
  }

  /* ----------------------- */
  /* ----------------------- */
  /* --- Event Listeners --- */

  chrome.browserAction.onClicked.addListener(tab => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => { // Couldn't we just use 'tab' from the line above?
      const tabID = tabs[0].id
      chrome.tabs.sendMessage(tabID, {action: 'toggleDrawer'}, res => {
        console.log(res)
        if ((!res || !res.togglingDrawer) && tab.url.indexOf('chrome://') !== 0 && tab.url.indexOf('chrome-extension://') !== 0) {
          console.log('Beginning script on page', tab.id)
          chrome.tabs.executeScript(tab.id, { file: 'static/chrome/contentScript.js' }, () => {
            console.log('Begun script on page', tab.id)
            chrome.tabs.sendMessage(tabID, {action: 'toggleDrawer'}, res => {
              console.log('res2', res)
            })
          })
        }
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
    log.debug((sender.tab ? '📬 🖌  Event from a content script, tab ID ' + sender.tab.id + ': ' + sender.tab.url : '📬 ⛓  Event from the extension'), request)
    var promiseFunction
    if (request.action)
      switch (request.action) {
        // case 'startExtensionScript':
        //   promiseFunction =
        //   break
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
          promiseFunction = myController.saveCard(request.data)
          break
        case 'deleteCard':
          promiseFunction = myController.deleteCard(request.data)
          break
        case 'verifyCard':
          promiseFunction = myController.verifyCard(request.data)
          break
        case 'searchCards':
          promiseFunction = myController.searchCards(request.data)
          break
        case 'force':
          promiseFunction = myController.force(request.data)
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
