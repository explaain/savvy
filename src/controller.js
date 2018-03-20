// @TODO: Remove toggleSignIn() from everywhere
// @TODO: Remove signedIn() from everywhere

import Vue from 'vue'
import log from 'loglevel'
import Auth from './plugins/auth' // Need to concolidate this + 'auth'
import Author from './author.js'
// import * as firebase from 'firebase'
// import CardDetection from '../plugins/card-detection.js'
import ExplaainSearch from './plugins/explaain-search.js'

log.setLevel('debug')

const firebaseConfig = {
  apiKey: 'AIzaSyDbf9kOP-Mb5qroUdCkup00DFya0OP5Dls',
  authDomain: 'savvy-96d8b.firebaseapp.com',
}
const authorConfig = {
  url: 'https://' + (process.env.BACKEND_URL || 'savvy-api--live.herokuapp.com') + '/api/memories',
  // url: 'http://localhost:5000/api/memories',
  importUrl: 'https://' + (process.env.BACKEND_URL || 'savvy-api--live.herokuapp.com') + '/api/import'
}

const algoliaParams = {
  appID: 'D3AE3TSULH' // @TODO: Find a home for this!
}

// const userForcedFromUrl = window && window.location && window.location.href.search('localhost:8080') > -1 ? {
const userForcedFromUrl = window && window.location && window.location.href.search('yc.heysavvy.com') > -1 ? {
  auth: {
    apiKey: 'AIzaSyDbf9kOP-Mb5qroUdCkup00DFya0OP5Dls',
    appName: '[DEFAULT]',
    authDomain: 'savvy-96d8b.firebaseapp.com',
    createdAt: '1509293764000',
    displayName: 'Paul Graham',
    email: 'pg@ycombinator.com',
    emailVerified: true,
    isAnonymous: false,
    lastLoginAt: '1521294455000',
    photoURL: 'https://futurestartup.com/wp-content/uploads/2012/08/PaulGraham-290x290.png',
    providerData: Array[1],
    redirectEventId: null,
    stsTokenManager: {
      // apiKey: 'AIzaSyDbf9kOP-Mb5qroUdCkup00DFya0OP5Dls',
      // expirationTime: 1521307900790,
      // refreshToken: 'APyOXy0YYTudP6lMvbDebmF3nLxEI3pg7RT6J2w9JV9o2vVz3tyCMTjbhND6NrhjUXwGPNszR4Ciklhd8j5X0vEdD6lJN-1QVel1MHpzFEmOz1nfEt7DbS96W0Df5jPwVmf37xMTU0Ow-hCQpltLOP-E53uPfpNDB_zQfygsiRQpSYawKQE3XwHWH78yY2aZpdQfYMD2GixAD5Ivpz34l0D1b636RaX3QsyuLUkkxmoNBgm4A-Nx7XJXRCCCzfAH3Q4dpc0oDaJG5vch4dueyqPjqIk6E8I7JB1hyuED93Nk6jV4Pc_MxgJZ_EmUuwwafbb0pO6xn0oNdibeP7aJQ9is_TVegnGqwMbYsSgj3aJSJ_JSIMSHNR4',
    },
    firebase: 'paul_graham',
    uid: 'paul_graham',
  },
  data: {
    algoliaApiKey: '48206d80d2db24aebaac596ea87ae4db',
    firebase: '',
    first: 'Paul',
    last: 'Graham',
    objectID: '',
    organisationID: 'yc',
    role: 'admin',
    slack: '',
  },
  uid: 'paul_graham',
} : false

console.log('STARTING1')
console.log(userForcedFromUrl)
console.log(window.location.href)

class Controller {
  constructor(config) {
    console.log('Controller Constructed')
    config.firebaseConfig = firebaseConfig
    const stateChangeCallback = (state, user) => {
      const userToReturn = userForcedFromUrl || user
      const stateToReturn = userForcedFromUrl ? 'loggedIn' : state
      console.log('userForcedFromUrl', userForcedFromUrl)
      console.log('stateToReturn', stateToReturn)
      return config.stateChangeCallback(stateToReturn, userToReturn)
    }
    const newConfig = userForcedFromUrl ? {
      firebaseInstance: {
        apps: [],
        initializeApp: () => {},
        auth: () => {}
      }
    } : config
    if (!userForcedFromUrl) {
      this.Auth = new Auth(stateChangeCallback, newConfig)
      this.authState = this.Auth.authState
    }
    this.Author = new Author(authorConfig)
    if (userForcedFromUrl) {
      console.log('forceeee')
      config.stateChangeCallback('loggedIn', userForcedFromUrl)
    }
  }
  authSignIn(token) {
    console.log('❇️ CONTROLLER ❇️ - authSignIn', token)
    return this.Auth.authSignIn(token)
  }
  signIn(specialSignInFunction) {
    console.log('❇️ CONTROLLER ❇️ - signIn', specialSignInFunction)
    if (specialSignInFunction)
      return specialSignInFunction()
    else
      return this.Auth.signIn()
  }
  signOut() {
    console.log('❇️ CONTROLLER ❇️ - signOut')
    return this.Auth.signOut()
  }
  toggleSignIn() {
    console.log('❇️ CONTROLLER ❇️ - toggleSignIn')
    console.log('Replacing toggleSignIn with signIn')
    // return this.Auth.toggleSignIn()
    return this.Auth.signIn()
  }
  startSignIn() {
    console.log('❇️ CONTROLLER ❇️ - startSignIn')
    if (!this.Auth.signedIn()) {
      console.log('not yet signed in so toggling')
      return this.Auth.toggleSignIn()
    }
  }
  signedIn() {
    console.log('❇️ CONTROLLER ❇️ - signedIn')
    return this.Auth.signedIn()
  }
  async getUser() {
    console.log('❇️ CONTROLLER ❇️ - getUser')
    if (userForcedFromUrl) {
      console.log('forcing user from url')
      return userForcedFromUrl
    } else {
      console.log('NOT forcing user')
      const user = await this.Auth.getUser()
      if (!ExplaainSearch.searchCards && user)
        Vue.use(ExplaainSearch, algoliaParams, user) // Bit of hack - shouldn't be using Vue at all!
      return user
    }
  }
  getAccessToken() {
    console.log('❇️ CONTROLLER ❇️ - getAccessToken')
    return userForcedFromUrl ? '' : this.Auth.getAccessToken()
  }
  refreshUserToken() {
    console.log('❇️ CONTROLLER ❇️ - refreshUserToken')
    return this.Auth.refreshUserToken()
  }
  async saveCard(data) {
    console.log('❇️ CONTROLLER ❇️ - saveCard', data)
    const user = await this.getUser()
    const idToken = await this.getAccessToken()
    data.sender = { uid: user.uid, role: user.data.role, algoliaApiKey: user.data.algoliaApiKey, idToken: idToken, organisationID: user.data.organisationID }
    const result = await this.Author.saveCard(data)
    return result
  }
  async deleteCard(data) {
    console.log('❇️ CONTROLLER ❇️ - deleteCard', data)
    const user = await this.getUser()
    const idToken = await this.getAccessToken()
    data.sender = { uid: user.uid, role: user.data.role, algoliaApiKey: user.data.algoliaApiKey, idToken: idToken, organisationID: user.data.organisationID }
    data.organisationID = user.data.organisationID
    const result = await this.Author.deleteCard(data)
    return result
  }
  async verifyCard(data) {
    console.log('❇️ CONTROLLER ❇️ - verifyCard', data)
    const user = await this.getUser()
    const idToken = await this.getAccessToken()
    data.sender = { uid: user.uid, role: user.data.role, algoliaApiKey: user.data.algoliaApiKey, idToken: idToken, organisationID: user.data.organisationID }
    data.organisationID = user.data.organisationID
    const result = await this.Author.verifyCard(data)
    return result
  }
  async searchCards(data) {
    console.log('❇️ CONTROLLER ❇️ - searchCards', data)
    const user = await this.getUser()
    const idToken = await this.getAccessToken()
    data.includeNlp = true
    data.sender = { uid: user.uid, role: user.data.role, algoliaApiKey: user.data.algoliaApiKey, idToken: idToken, organisationID: user.data.organisationID }
    data.organisationID = user.data.organisationID
    console.log('data', data)
    console.log('ExplaainSearch', ExplaainSearch)
    console.log('ExplaainSearch.searchCards', ExplaainSearch.searchCards)
    const result = await ExplaainSearch.searchCards(data.user, data.query, data.numberOfResults, data)
    return result
  }
  async force(toForce) {
    if (toForce.user) {
      const user = await this.Auth.forceUser(toForce.user)
      return user
    } else
      return null
  }
}

export default Controller
