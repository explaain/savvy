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

const onAuthStateChanged = user => {
  console.log('user', user)
  stateChangeListeners.forEach(listenerFunction => {
    listenerFunction(user)
  })
}

var myAuth

class Controller {
  constructor(config) {
    myAuth = new Auth(onAuthStateChanged, config)
    this.authState = myAuth.authState
    console.log('myAuth')
    console.log(myAuth)
    setTimeout(function() {
      console.log('3 myAuth')
      console.log(myAuth)
      console.log(myAuth)
    }, 2)
    console.log('2 myAuth')
    console.log(myAuth)
    console.log(myAuth)
  }
  addStateChangeListener(listenerFunction) {
    console.log('AAA addStateChangeListener', listenerFunction)
    stateChangeListeners.push(listenerFunction)
  }
  authSignIn(token) {
    console.log('AAA authSignIn', token)
    return myAuth.authSignIn()
  }
  toggleSignIn() {
    console.log('AAA toggleSignIn')
    console.log('myAuth')
    console.log('myAuth')
    console.log(myAuth)
    return myAuth.toggleSignIn()
  }
  signedIn() {
    console.log('AAA signedIn')
    return myAuth.signedIn()
  }
  getUser() {
    console.log('AAA getUser')
    return myAuth.getUser()
  }

  /* ----------------------- */
  /* ----------------------- */
  /* --- Event Listeners --- */

  onMessage(request, sendResponse, extraFunctions) {
    console.log('AAA onMessage', request, sendResponse, extraFunctions)
    try {
      if (request.action)
        switch (request.action) {
          case 'signIn':
            console.log('Signing in!')
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
