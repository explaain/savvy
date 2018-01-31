/* global firebase */
// import Vue from 'vue'
import log from 'loglevel'
import axios from 'axios'
import Auth from '../plugins/auth2' // Need to concolidate this + 'auth'
// import CardDetection from '../plugins/card-detection.js'
// import ExplaainSearch from '../plugins/explaain-search.js'

log.setLevel('debug')

console.log('STARTING')

var organisation = {}

var config = {
  apiKey: 'AIzaSyDbf9kOP-Mb5qroUdCkup00DFya0OP5Dls',
  authDomain: 'savvy-96d8b.firebaseapp.com',
  databaseURL: 'https://chrometest-5cd53.firebaseio.com', // Should delete this?
  storageBucket: ''
}

const initApp = () => { // eslint-disable-line
  firebase.auth().onAuthStateChanged(user => {
    console.log(user)
  })
}

const selectOrganisation = organisationID => new Promise((resolve, reject) => {
  console.log('yoyoyo')
  if (firebase.auth().currentUser) {
    console.log('yoyo')
    Auth.selectOrganisation({id: organisationID})
    .then(res => {
      console.log(res)
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

const Controller = {
  initialise: () => {
    try {
      console.log('initialising')
      firebase.initializeApp(config)
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  },
  authSignIn: token => new Promise((resolve, reject) => {
    var credential = firebase.auth.GoogleAuthProvider.credential(null, token)
    firebase.auth().signInWithCredential(credential)
    .then(res => {
      console.log('Auth starting')
      Auth.initApp(false, onAuthStateChanged, { firebase: firebase, organisation: organisation, getUserDataUrl: 'https://forget-me-not--staging.herokuapp.com/api/user' })
      console.log('Auth done')
      resolve(res)
    }).catch(e => {
      reject(e)
    })
  }),
  signedIn: () => !!firebase.auth().currentUser,

  /* ----------------------- */
  /* ----------------------- */
  /* --- Event Listeners --- */

  onMessage: (request, sendResponse, extraFunctions) => {
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
          case 'selectOrganisation':
            console.log('Selecting Organisation!')
            selectOrganisation(request.data.organisationID)
            .then(res => {
              organisation = {
                id: request.data.organisationID
              }
              res.organisation = organisation
              sendResponse(res)
            })
            .catch(e => {
              log.error(e)
              sendResponse({ error: e })
            })
            break
          case 'getPageResults':
            // Stopping this from happening for now as we're not including this feature currently!
            if (false) { // eslint-disable-line
              const user = Auth.getUser()
              axios.post('http://localhost:5000/parse', {
                // axios.post('//savvy-nlp--staging.herokuapp.com/parse', {
                organisationID: organisation.id,
                user: user,
                content: request.data.pageText,
                url: request.data.url
              })
              // CardDetection.getPageResults(organisation.id, Auth.getUser(), request.data)
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
            sendResponse(Auth.getUser())
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
