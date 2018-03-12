// @TODO: Remove toggleSignIn() from everywhere
// @TODO: Remove signedIn() from everywhere

// import Vue from 'vue'
import log from 'loglevel'
import Auth from './plugins/auth' // Need to concolidate this + 'auth'
import Author from './author.js'
// import * as firebase from 'firebase'
// import CardDetection from '../plugins/card-detection.js'
// import ExplaainSearch from '../plugins/explaain-search.js'

log.setLevel('debug')

const firebaseConfig = {
  apiKey: 'AIzaSyDbf9kOP-Mb5qroUdCkup00DFya0OP5Dls',
  authDomain: 'savvy-96d8b.firebaseapp.com',
}
const authorConfig = {
  // url: 'https://' + (process.env.BACKEND_URL || 'savvy-api--live.herokuapp.com') + '/api/memories',
  url: 'http://localhost:5000/api/memories',
  importUrl: 'https://' + (process.env.BACKEND_URL || 'savvy-api--live.herokuapp.com') + '/api/import'
}

console.log('STARTING')

class Controller {
  constructor(config) {
    console.log('Controller Constructed')
    config.firebaseConfig = firebaseConfig
    this.Auth = new Auth(config.stateChangeCallback, config)
    this.Author = new Author(authorConfig)
    this.authState = this.Auth.authState
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
  getUser() {
    console.log('❇️ CONTROLLER ❇️ - getUser')
    return this.Auth.getUser()
  }
  getAccessToken() {
    console.log('❇️ CONTROLLER ❇️ - getAccessToken')
    return this.Auth.getAccessToken()
  }
  refreshUserToken() {
    console.log('❇️ CONTROLLER ❇️ - refreshUserToken')
    return this.Auth.refreshUserToken()
  }
  async saveCard(data) {
    console.log('❇️ CONTROLLER ❇️ - saveCard', data)
    const user = await this.Auth.getUser()
    const idToken = await this.getAccessToken()
    data.sender = { uid: user.uid, role: user.data.role, algoliaApiKey: user.data.algoliaApiKey, idToken: idToken }
    const result = await this.Author.saveCard(data)
    return result
  }
  async deleteCard(data) {
    console.log('❇️ CONTROLLER ❇️ - deleteCard', data)
    const user = await this.Auth.getUser()
    const idToken = await this.getAccessToken()
    data.sender = { uid: user.uid, role: user.data.role, algoliaApiKey: user.data.algoliaApiKey, idToken: idToken }
    data.organisationID = user.data.organisationID
    const result = await this.Author.deleteCard(data)
    return result
  }
  async verifyCard(data) {
    console.log('❇️ CONTROLLER ❇️ - verifyCard', data)
    const user = await this.Auth.getUser()
    const idToken = await this.getAccessToken()
    data.sender = { uid: user.uid, role: user.data.role, algoliaApiKey: user.data.algoliaApiKey, idToken: idToken }
    data.organisationID = user.data.organisationID
    const result = await this.Author.verifyCard(data)
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
