// import Vue from 'vue'
import * as firebase from 'firebase'
import axios from 'axios'
// import VueAxios from 'vue-axios'

// Vue.use(VueAxios, axios)

class Auth {
  constructor(callback) {
    const self = this
    self.firebase = {}
    self.options = {} // ???
    self.organisation = {}
    self.user = {}
    self.stateChangeCallback = callback || function() {}
    self.updateAuthState = function(state) {
      console.log('self.updateAuthState', state)
      self.authState = state
      self.stateChangeCallback(state, self.user)
    }
    /**
    * initApp handles setting up UI event listeners and registering Firebase auth listeners:
    *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
    *    out, and that is where we update the UI.
    *  - firebase.auth().getRedirectResult(): This promise completes when the user gets back from
    *    the auth redirect flow. It is where you can get the OAuth access token from the IDP.
    */
    console.log('🔏⛏  Initialising Auth')
    var config = {
      apiKey: 'AIzaSyDbf9kOP-Mb5qroUdCkup00DFya0OP5Dls',
      authDomain: 'savvy-96d8b.firebaseapp.com',
    }
    if (!firebase.apps.length)
      firebase.initializeApp(config)

    // this.updateAuthState(firebase.auth().currentUser ? 'loggedIn' : 'pending') // Is this correct?

    // Result from Redirect auth flow.
    // [START getidptoken]
    firebase.auth().getRedirectResult().then(function(result) {
      // if (result.credential) {
      //   // This gives you a Google Access Token. You can use it to access the Google API.
      //   var token = result.credential.accessToken
      // }
      console.log('redirectResult', result)
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code
      // var errorMessage = error.message
      // // The email of the user's account used.
      // var email = error.email
      // // The firebase.auth.AuthCredential type that was used.
      // var credential = error.credential
      // [START_EXCLUDE]
      if (errorCode === 'auth/account-exists-with-different-credential')
        alert('You have already signed up with a different auth provider for that email.')
      // If you are using multiple auth providers on your app you should handle linking
      // the user's accounts here.
      else
      console.error(error)
    })
    // [END getidptoken]

    firebase.auth().onAuthStateChanged(function(userAuth) {
      self.onFirebaseAuthStateChange(userAuth)
    })

    self.toggleSignIn = () => {
      return new Promise((resolve, reject) => { // Maybe should separate this into signIn() and signOut() to avoid accidentally double taetc
        console.log('🔐  Toggling Sign in')
        self.updateAuthState('pending')
        if (!firebase.auth().currentUser) {
          var provider = new firebase.auth.GoogleAuthProvider()
          // provider.addScope('https://www.googleapis.com/auth/userinfo.email') // Experimenting with Gmail API
          // provider.addScope('https://www.googleapis.com/auth/gmail.readonly')
          firebase.auth().signInWithRedirect(provider)
        } else {
          firebase.auth().signOut()
        }
        firebase.auth().onAuthStateChanged(userAuth => {
          self.onFirebaseAuthStateChange(userAuth)
          .then(user => {
            resolve(user)
          }).catch(user => {
            reject(user)
          })
        })
      })
    }
    self.onFirebaseAuthStateChange = userAuth => {
      return new Promise((resolve, reject) => {
        if (userAuth) {
          userAuth = JSON.parse(JSON.stringify(userAuth))
          console.log('🖌👤  Setting user', userAuth)
          self.user = {
            uid: userAuth.uid,
            lastRefreshed: new Date(),
            auth: userAuth,
            getAccessToken: self.getAccessToken
          }
          self.getUserData(userAuth)
          .then(userData => {
            console.log('👤  User data!', userData)
            self.user.data = userData
            self.updateAuthState('loggedIn')
            resolve(self.user)
          }).catch(e => {
            self.updateAuthState('loggedOut') // Could have another state for this scenario?
            resolve(self.user)
          })
        } else {
          console.log('Calling back but with no user')
          self.updateAuthState('loggedOut')
          resolve()
        }
      })
    }
    self.refreshUserToken = async () => {
      var idToken
      try {
        idToken = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
      } catch (e) {
        console.log(e)
        return null
      }
      console.log('New User Token!')
      return idToken
    }
    self.getUserData = async userAuth => {
      console.log('getUserData')
      const idToken = await self.refreshUserToken()
      if (idToken) {
        const response = await axios.post('//savvy-nlp--staging.herokuapp.com/get-user', { idToken: idToken })
        console.log('📪  The response data!', response.data)
        return response.data.results
      } else {
        console.log('📛  Error! Couldn\'t get user data')
        return false
      }
    }
    self.getUser = () => { // Not often used now!
      console.log('self.getUser', self.user)
      const user = JSON.parse(JSON.stringify(self.user))
      if (user.lastRefreshed && new Date() - user.lastRefreshed > 1000 * 60 * 30) { // Refreshes every 30 mins, since auth token expires every 60 mins
        console.log('♻️  Refreshing User Token!')
        Auth.refreshUserToken()
        .then(token => {
          user.auth.stsTokenManager.accessToken = token
          user.lastRefreshed = new Date()
          console.log('self.user', self.user)
        }).catch(e => {
          console.log(e)
        })
      }
      user.getAccessToken = this.getAccessToken
      user.refreshUserToken = this.refreshUserToken
      self.user = user
      return user
    }
    self.joinOrg = organisationID => {
      return new Promise(function(resolve, reject) {
        console.log('Joining Org!')
        try {
          self.updateAuthState('pending')
          self.refreshUserToken()
          .then(idToken => {
            return axios.post('//forget-me-not--staging.herokuapp.com/api/user/add', {
              organisationID: self.organisation.id,
              user: { uid: self.user.auth.uid, idToken: idToken },
              verifiedEmails: [ self.user.auth.email ] // Only working for Google Auth for now
            })
          }).then(res => {
            console.log(res)
            self.user.data = res.data
            self.updateAuthState('loggedIn')
            resolve(self.user)
          }).catch(e => {
            self.updateAuthState('readyToJoinOrg')
            console.log(e)
            reject(e)
          })
        } catch (e) {
          console.log(e)
        }
      })
    }
    self.getAccessToken = () => self.user.auth.stsTokenManager.accessToken
  }
}

export default Auth
