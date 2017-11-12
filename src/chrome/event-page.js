/* global chrome */
import Vue from 'vue'
import log from 'loglevel'
import Q from 'q'

import ExplaainSearch from '../plugins/explaain-search.js'

log.setLevel('debug')

const UserIDs = {
  live: {
    Jeremy: '1627888800569309',
    Matt: '1455707247850069',
    Carol: '1459068990878077',
    Harriet: '1478776232161468',
    Jonny: '1513554438729753',
  },
  staging: {
    Jeremy: '1366746370089527',
    Matt: '1528134990563202',
  },
  local: {
    Jeremy: '1300120880110773',
    Matt: '1428419100528438',
  },
  drive: {
    Jeremy: '104380110279658920175',
    ACME: '101118387301286232222'
  }
}

const UserID = UserIDs.live.ACME
var PageResults = {}
var UserCards = []
var LastRefresh = 0

const algoliaParams = { // Need to send these to app.vue to avoid duplication!
  appID: 'I2VKMNNAXI',
  apiKey: '2b8406f84cd4cc507da173032c46ee7b',
  index: 'ForgetMeNot_Context_Test'
}
Vue.use(ExplaainSearch, algoliaParams)

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleDrawer'}, function(res) {
      log.info(res)
    })
  })
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  try {
    log.debug((sender.tab ? 'From a content script: ' + sender.tab.url : 'From the extension'), request)

    if (request.action === 'getPageResults') {
      getCurrentPageResults(request.data)
      .then(function(res) {
        log.debug(res)
        sendResponse(res)
      })
      return true
    }
    if (request.action === 'checkPage') {
      log.trace(request.data)
      checkRefresh()
      .then(function() {
        return ExplaainSearch.getPageResults(UserID, request.data, UserCards)
      }).then(function(res) {
        addToPageResults(sender.tab.id, res)
        PageResults = res
        sendResponse(res)
      }).catch(function(e) {
        log.error(e)
      })
      return true
    }
    if (request.action === 'getUser') {
      console.log(UserID)
      sendResponse(UserID)
      return true
    }
    if (request.action === 'refreshCards') {
      getAllUserCards()
      return true
    }
    if (request.event === 'popupOpened') {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {event: 'popupOpened'}, function(response) {})
      })
      return true
    }
  } catch (e) {
    log.error(e)
  }
})

const getCurrentPageResults = function(data) {
  const d = Q.defer()
  var tabID
  log.debug(1)
  checkRefresh()
  .then(getCurrentTab)
  .then(function(tab) {
    log.debug(tab.id)
    tabID = tab.id
    log.debug(PageResults)
    if (PageResults[tabID]) {
      d.resolve(PageResults[tabID])
    } else {
      if (!data) data = {tabID: tabID}
      log.debug(data)
      getPageData(data)
      .then(function(res) {
        log.debug(res)
        return ExplaainSearch.getPageResults(UserID, res, UserCards)
      }).then(function(res) {
        log.debug(res)
        addToPageResults(tabID, res)
        d.resolve(res)
      }).catch(function(e) {
        d.reject(e)
      })
    }
  }).catch(function(e) {
    d.reject(e)
  })
  return d.promise
}

const getCurrentTab = function() {
  // Need error catching here
  const d = Q.defer()
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    d.resolve(tabs[0])
  })
  return d.promise
}

const getPageData = function(data) {
  const d = Q.defer()
  if (data.pageData) {
    d.resolve(data.pageData)
  } else if (data.tabID) {
    sendMessageToTab(data.tabID, {action: 'getPageData'}) // Just fixed bug here, so maybe this shouldn't actually be working now..!
    .then(function(res) {
      d.resolve(res)
    })
  } else {
    d.reject()
  }
  return d.promise
}

const sendMessageToTab = function(tabID, data) {
  // Need error catching here
  const d = Q.defer()
  chrome.tabs.sendMessage(tabID, data, function(res) {
    log.debug(res)
    d.resolve(res)
  })
  return d.promise
}

const addToPageResults = function(tabID, data) {
  PageResults[tabID] = data
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    Object.keys(PageResults).forEach(function(pageTabID) {
      if (tabs.filter(function(tab) { return tab.id === pageTabID }).length === 0) delete PageResults[pageTabID]
    })
    log.debug(PageResults)
  })
}

const checkRefresh = function() {
  const d = Q.defer()
  const now = new Date()
  if (now - LastRefresh > 300000) {
    getAllUserCards()
    .then(function() {
      d.resolve()
    }).catch(function(e) {
      log.error(e)
      d.reject(e)
    })
  } else {
    d.resolve()
  }
  return d.promise
}

const getAllUserCards = function() {
  const d = Q.defer()
  LastRefresh = new Date()
  ExplaainSearch.searchCards(UserID, '', 1000)
  .then(function(results) {
    UserCards = results
    log.debug(UserCards)
    d.resolve()
  }).catch(function(e) {
    log.error(e)
    d.reject(e)
  })
  return d.promise
}
getAllUserCards()






var config = {
  apiKey: 'AIzaSyDbf9kOP-Mb5qroUdCkup00DFya0OP5Dls',
  authDomain: 'savvy-96d8b.firebaseapp.com',
  databaseURL: 'https://chrometest-5cd53.firebaseio.com',
  storageBucket: ''
}
firebase.initializeApp(config)



/**
 * initApp handles setting up the Firebase context and registering
 * callbacks for the auth status.
 *
 * The core initialization is in firebase.App - this is the glue class
 * which stores configuration. We provide an app name here to allow
 * distinguishing multiple app instances.
 *
 * This method also registers a listener with firebase.auth().onAuthStateChanged.
 * This listener is called when the user is signed in or out, and that
 * is where we update the UI.
 *
 * When signed in, we also authenticate to the Firebase Realtime Database.
 */
function initApp() {
  firebase.auth().onAuthStateChanged(function(user) {
    console.log(user);
  });
}

/**
 * Start the auth flow and authorizes to Firebase.
 * @param{boolean} interactive True if the OAuth flow should request with an interactive mode.
 */
function startAuth(interactive) {
  // Request an OAuth token from the Chrome Identity API.
  chrome.identity.getAuthToken({interactive: !!interactive}, function(token) {
    if (chrome.runtime.lastError && !interactive) {
      console.log('It was not possible to get a token programmatically.');
    } else if(chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else if (token) {
      // Authrorize Firebase with the OAuth Access Token.
      var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
      firebase.auth().signInWithCredential(credential).catch(function(error) {
        // The OAuth token might have been invalidated. Lets' remove it from cache.
        if (error.code === 'auth/invalid-credential') {
          chrome.identity.removeCachedAuthToken({token: token}, function() {
            startAuth(interactive);
          });
        }
      });
    } else {
      console.error('The OAuth Token was null');
    }
  });
}

/**
 * Starts the sign-in process.
 */
function startSignIn() {
  // document.getElementById('quickstart-button').disabled = true;
  if (firebase.auth().currentUser) {
    firebase.auth().signOut();
  } else {
    startAuth(true);
  }
}

window.onload = function() {
  console.log('onload');
  initApp();
  setTimeout(function() {
    console.log('starting auth');
    startAuth(true);
  },3000)
};
