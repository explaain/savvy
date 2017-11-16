/* global chrome */
/* global firebase */
import Vue from 'vue'
import log from 'loglevel'
import Auth from '../plugins/auth2' // Need to concolidate this + 'auth'
import CardDetection from '../plugins/card-detection.js'
import ExplaainSearch from '../plugins/explaain-search.js'

log.setLevel('debug')

console.log('STARTING')

const organisation = {
  name: 'explaain'
}

var config = {
  apiKey: 'AIzaSyDbf9kOP-Mb5qroUdCkup00DFya0OP5Dls',
  authDomain: 'savvy-96d8b.firebaseapp.com',
  databaseURL: 'https://chrometest-5cd53.firebaseio.com',
  storageBucket: ''
}
var allowContinue = true

try {
  console.log('initialising')
  firebase.initializeApp(config)
} catch (e) {
  console.log(e)
  allowContinue = false
}

// var PageResults = {}
// var UserCards = []
// var LastRefresh = 0

const algoliaParams = { // Need to get these from Firebase!
  appID: 'I2VKMNNAXI',
  apiKey: '2b8406f84cd4cc507da173032c46ee7b',
  index: 'Savvy'
}
Vue.use(ExplaainSearch, algoliaParams)
Vue.use(CardDetection, { algolia: algoliaParams })

// const getCurrentPageResults = (data) => new Promise((resolve, reject) => {
//   checkRefresh()
//   .then(getCurrentTab)
//   .then(tab => {
//     if (PageResults[tab.id]) {
//       resolve(PageResults[tab.id])
//     } else {
//       if (!data) data = {tabID: tab.id}
//       getPageData(data)
//       .then(res => ExplaainSearch.getPageResults(Auth.getUser().uid, res, UserCards))
//       .then(res => {
//         addToPageResults(tab.id, res)
//         resolve(res)
//       }).catch(reject)
//     }
//   }).catch(reject)
// })

// const getCurrentTab = () => new Promise((resolve, reject) => {
//   chrome.tabs.query({active: true, currentWindow: true}, tabs => {
//     resolve(tabs[0])
//     // Need error catching here
//   })
// })
//
// const getPageData = (data) => new Promise((resolve, reject) => {
//   if (data.pageData) {
//     resolve(data.pageData)
//   } else if (data.tabID) {
//     sendMessageToTab(data.tabID, {action: 'getPageData'}) // Just fixed bug here, so maybe this shouldn't actually be working now..!
//     .then(resolve)
//     .catch(reject)
//   } else {
//     reject(new Error('No pageData or tabID found'))
//   }
// })

// const sendMessageToTab = (tabID, data) => new Promise((resolve, reject) => {
//   chrome.tabs.sendMessage(tabID, data, res => {
//     log.debug(res)
//     resolve(res)
//     // Need error catching here
//   })
// })
//
// const addToPageResults = (tabID, data) => new Promise((resolve, reject) => {
//   PageResults[tabID] = data
//   chrome.tabs.query({active: true, currentWindow: true}, tabs => {
//     Object.keys(PageResults).forEach(pageTabID => {
//       if (tabs.filter(tab => { return tab.id === pageTabID }).length === 0) delete PageResults[pageTabID]
//     })
//     log.debug(PageResults)
//   })
// })
//
// const checkRefresh = () => new Promise((resolve, reject) => {
//   const now = new Date()
//   if (now - LastRefresh > 300000) {
//     getAllUserCards()
//     .then(resolve)
//     .catch(reject)
//   } else {
//     resolve()
//   }
// })

// const getAllUserCards = () => new Promise((resolve, reject) => {
//   // LastRefresh = new Date()
//   ExplaainSearch.searchCards(Auth.getUser().uid, '', 1000)
//   .then(results => {
//     UserCards = results
//     log.debug(UserCards)
//     resolve()
//   }).catch(e => {
//     log.error(e)
//     reject(e)
//   })
// })
// getAllUserCards()

const initApp = () => { // eslint-disable-line
  firebase.auth().onAuthStateChanged(user => {
    console.log(user)
  })
}

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
      log.debug(token)
      // Authrorize Firebase with the OAuth Access Token.
      var credential = firebase.auth.GoogleAuthProvider.credential(null, token)
      firebase.auth().signInWithCredential(credential)
      .then(res => {
        console.log('Auth starting')
        Auth.initApp(false, onAuthStateChanged, { firebase: firebase, organisation: { id: 'explaain' }, getUserDataUrl: 'https://forget-me-not--staging.herokuapp.com/api/user' })
        console.log('Auth done')
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
  if (!firebase.auth().currentUser) {
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

const onAuthStateChanged = (user) => {
  console.log('user', user)
}

if (allowContinue) {
  console.log('Allow signin')
  startSignIn()
  .then(res => {
    log.info(res)
  }).catch(e => {
    log.info(e)
  })

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
    try {
      log.debug((sender.tab ? '📬 🖌  Event from a content script: ' + sender.tab.url : '📬 ⛓  Event from the extension'), request)

      if (request.action)
        switch (request.action) {
          case 'signIn':
            console.log('Signing in!')
            startSignIn()
            .then(sendResponse)
            .catch(e => {
              log.error(e)
              sendResponse({ error: e })
            })
            break
          case 'getPageResults':
            CardDetection.getPageResults(organisation.id, Auth.getUser(), request.data)
            .then(sendResponse)
            .catch(e => {
              log.error(e)
              sendResponse({ error: e })
            })
            break
          // case 'getCurrentPageResults':
          //   getCurrentPageResults(request.data)
          //   .then(sendResponse)
          //   .catch(e => {
          //     log.error(e)
          //     sendResponse({ error: e })
          //   })
          //   break
          // case 'checkPage':
          //   log.trace(request.data)
          //   checkRefresh()
          //   .then(ExplaainSearch.getPageResults(Auth.getUser().uid, request.data, UserCards))
          //   .then(res => {
          //     addToPageResults(sender.tab.id, res)
          //     PageResults = res
          //     sendResponse(res)
          //   }).catch(e => {
          //     log.error(e)
          //     sendResponse({ error: e })
          //   })
          //   break
          case 'getUser':
            sendResponse(Auth.getUser())
            break
          // case 'refreshCards':
          //   getAllUserCards()
          //   return true
        }
      else if (request.event)
        switch (request.event) {
          case 'popupOpened':
            chrome.tabs.query({active: true, currentWindow: true}, tabs => {
              chrome.tabs.sendMessage(tabs[0].id, {event: 'popupOpened'}, response => {})
            })
            break
        }
      return true
    } catch (e) {
      log.error(e)
    }
  })
}
