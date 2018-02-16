// @TODO: Move this out of /chrome as it's now the general controller

// import Vue from 'vue'
import log from 'loglevel'
import axios from 'axios'
import Auth from '../plugins/auth' // Need to concolidate this + 'auth'
// import CardDetection from '../plugins/card-detection.js'
// import ExplaainSearch from '../plugins/explaain-search.js'

log.setLevel('debug')

console.log('STARTING')

var organisation = {}

const stateChangeListeners = []

const stateChangeCallback = (state, user) => {
  console.log('stateChangeCallback (controller.js)', state, user)
  stateChangeListeners.forEach(listenerFunction => {
    console.log('a listener function')
    listenerFunction(state, user)
  })
}

var myAuth

class Controller {
  constructor(config) {
    console.log('controller config', config)
    myAuth = new Auth(stateChangeCallback, config)
    this.authState = myAuth.authState
    console.log('myAuth')
    console.log(myAuth)
    setTimeout(function() {
      console.log('3 myAuth')
      console.log(myAuth)
    }, 2)
    console.log('2 myAuth')
    console.log(myAuth)
  }
  addStateChangeListener(listenerFunction) {
    console.log('❇️ CONTROLLER ❇️ - addStateChangeListener (controller.js)', listenerFunction)
    stateChangeListeners.push(listenerFunction)
    console.log('stateChangeListeners (controller.js):', stateChangeListeners)
  }
  authSignIn(token) {
    console.log('❇️ CONTROLLER ❇️ - authSignIn', token)
    return myAuth.authSignIn()
  }
  toggleSignIn() {
    console.log('❇️ CONTROLLER ❇️ - toggleSignIn')
    console.log(myAuth)
    return myAuth.toggleSignIn()
  }
  startSignIn() {
    console.log('❇️ CONTROLLER ❇️ - startSignIn')
    if (!myAuth.signedIn()) {
      console.log('not yet signed in so toggling')
      return myAuth.toggleSignIn()
    }
  }
  signedIn() {
    console.log('❇️ CONTROLLER ❇️ - signedIn')
    return myAuth.signedIn()
  }
  getUser() {
    console.log('❇️ CONTROLLER ❇️ - getUser')
    return myAuth.getUser()
  }

  /* ----------------------- */
  /* ----------------------- */
  /* --- Event Listeners --- */

  onMessage(request, sendResponse, extraFunctions) {
    console.log('❇️ CONTROLLER ❇️ - onMessage', request, sendResponse, extraFunctions)
    try {
      if (request.action)
        switch (request.action) {
          case 'signIn':
            console.log('Signing in!')
            console.log(extraFunctions)
            extraFunctions.startSignIn()
            .then(sendResponse)
            .catch(e => {
              log.error(e)
              sendResponse({ error: e })
            })
            break
          case 'getPageResults':
            // Stopping this from happening for now as we're not including this feature currently!
            if (false) { // eslint-disable-line
              const user = myAuth.getUser()
              axios.post('http://localhost:5000/parse', {
                // axios.post('//savvy-nlp--staging.herokuapp.com/parse', {
                organisationID: organisation.id,
                user: user,
                content: request.data.pageText,
                url: request.data.url
              })
              // CardDetection.getPageResults(organisation.id, myAuth.getUser(), request.data)
              .then(res => {
                log.debug(res.data.results)
                return sendResponse(res.data.results)
              })
              .catch(e => {
                log.error(e)
                sendResponse({ error: e })
              })
            } else {
              sendResponse({ error: 'The "getPageResults" feature is turned off!' })
            }
            break
          case 'getUser':
            console.log(myAuth)
            sendResponse(myAuth.getUser())
            break
          case 'saveCard':
            axios.post(request.url, request.data)
            .then(response => {
              log.debug(response)
              sendResponse(response)
            }).catch(e => {
              log.error(e)
              sendResponse({ error: e })
            })
            break
          // case 'refreshCards':
          //   getAllUserCards()
          //   return true
        }
      else if (request.event)
        switch (request.event) {
          case 'popupOpened':
            extraFunctions.sendMessageToCurrentTab({event: 'popupOpened'})
            break
        }
      return true
    } catch (e) {
      log.error(e)
    }
  }
}

export default Controller
