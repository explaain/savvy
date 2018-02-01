/* global firebase */
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

class Controller {
  constructor(config) {
    this.Auth = new Auth(onAuthStateChanged, config)
    this.authState = this.Auth.authState
    console.log('this.Auth')
    console.log(this.Auth)
    setTimeout(function() {
      console.log('this.Auth')
      console.log(this.Auth)
    }, 2)
    try {
      if (firebase && firebase.apps && firebase.apps.length) {
        console.log('initialising')
        firebase.initializeApp(config.firebase)
      }
    } catch (e) {
      console.log('1 this.Auth')
      console.log(this.Auth)
    }
    console.log('2 this.Auth')
    console.log(this.Auth)
  }
  addStateChangeListener(listenerFunction) {
    console.log('AAA addStateChangeListener', listenerFunction)
    stateChangeListeners.push(listenerFunction)
  }
  authSignIn(token) {
    console.log('AAA authSignIn', token)
    return new Promise((resolve, reject) => {
      var credential = firebase.auth.GoogleAuthProvider.credential(null, token)
      firebase.auth().signInWithCredential(credential)
      .then(res => {
        // console.log('Auth starting')
        // this.Auth.initApp(false, onAuthStateChanged, { firebase: firebase, organisation: organisation })
        // console.log('Auth done')
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    })
  }
  toggleSignIn() {
    console.log('AAA toggleSignIn')
    console.log('this.Auth')
    console.log('this.Auth')
    console.log(this.Auth)
    return this.Auth.toggleSignIn()
  }
  signedIn() {
    console.log('AAA signedIn')
    return !!firebase.auth().currentUser
  }
  getUser() {
    console.log('AAA getUser')
    return this.Auth.getUser()
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
              const user = this.Auth.getUser()
              axios.post('http://localhost:5000/parse', {
                // axios.post('//savvy-nlp--staging.herokuapp.com/parse', {
                organisationID: organisation.id,
                user: user,
                content: request.data.pageText,
                url: request.data.url
              })
              // CardDetection.getPageResults(organisation.id, this.Auth.getUser(), request.data)
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
            console.log(this.Auth)
            sendResponse(this.Auth.getUser())
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
