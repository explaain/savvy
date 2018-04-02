/* global firebase */
// import Vue from 'vue'
// import * as firebase from 'firebase'
import axios from 'axios'
// import VueAxios from 'vue-axios'

// Vue.use(VueAxios, axios)

class Auth {
  constructor(stateChangeCallback, config) {
    console.log('🔑 Auth 🔑 - Constructed', config)
    const self = this
    self.Testing = config.testing || false
    self.firstLoginAttempted = false
    self.firebase = config.firebaseInstance
    try {
      if (!self.firebase)
        self.firebase = firebase
    } catch (e) {
      console.log('Caught:', e)
    }
    self.firebaseConfig = config.firebaseConfig
    self.options = {}
    self.organisation = {}
    self.user = {}
    self.stateChangeCallback = stateChangeCallback || function() {
      console.log('🔑 Auth 🔑 - stateChangeCallback')
      console.log('no state change callback defined!')
    }
    self.updateAuthState = function(state) {
      console.log('🔑 Auth 🔑 - self.updateAuthState (auth.js)', state)
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
    if (!self.firebase.apps.length) {
      self.firebase.initializeApp(self.firebaseConfig)
    }

    // this.updateAuthState(self.firebase.auth().currentUser ? 'loggedIn' : 'pending') // Is this correct?

    // Result from Redirect auth flow.
    // [START getidptoken]
    self.firebase.auth().getRedirectResult().then(function(result) {
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
      // // The self.firebase.auth.AuthCredential type that was used.
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

    self.firebase.auth().onAuthStateChanged(userAuth => {
      console.log(1)
      self.onFirebaseAuthStateChange(userAuth)
    })

    self.signIn = () => new Promise((resolve, reject) => {
      console.log('🔑 Auth 🔑 - signIn')
      if (!self.firebase.auth().currentUser) {
        self.updateAuthState('pending')
        var provider = new self.firebase.auth.GoogleAuthProvider()
        // provider.addScope('https://www.googleapis.com/auth/userinfo.email') // Experimenting with Gmail API
        // provider.addScope('https://www.googleapis.com/auth/gmail.readonly')
        if (self.Testing) {
          self.onFirebaseAuthStateChange(testUserAuth)
        } else {
          self.firebase.auth().signInWithRedirect(provider)
        }
        self.firebase.auth().onAuthStateChanged(userAuth => {
          self.onFirebaseAuthStateChange(userAuth).then(resolve).catch(reject)
        })
      }
    })

    self.signOut = () => new Promise((resolve, reject) => {
      console.log('🔑 Auth 🔑 - signOut')
      self.updateAuthState('pending')
      if (self.firebase.auth().currentUser) {
        self.firebase.auth().signOut()
        self.firebase.auth().onAuthStateChanged(userAuth => {
          self.onFirebaseAuthStateChange(userAuth).then(resolve).catch(reject)
        })
      }
    })

    self.toggleSignIn = () => {
      console.log('🔑 Auth 🔑 - toggleSignIn')
      return new Promise((resolve, reject) => { // Maybe should separate this into signIn() and signOut() to avoid accidentally double taetc
        console.log('🔐  Toggling Sign in')
        self.updateAuthState('pending')
        if (!self.firebase.auth().currentUser) {
          var provider = new self.firebase.auth.GoogleAuthProvider()
          // provider.addScope('https://www.googleapis.com/auth/userinfo.email') // Experimenting with Gmail API
          // provider.addScope('https://www.googleapis.com/auth/gmail.readonly')
          console.log('provider')
          console.log(provider)
          if (self.Testing) {
            console.log(2)
            self.onFirebaseAuthStateChange(testUserAuth)
          } else {
            self.firebase.auth().signInWithRedirect(provider)
          }
        } else {
          self.firebase.auth().signOut()
        }
        self.firebase.auth().onAuthStateChanged(userAuth => {
          console.log(3)
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
      console.log('🔑 Auth 🔑 - onFirebaseAuthStateChange', userAuth)
      return new Promise((resolve, reject) => {
        if (userAuth && !self.user.auth)
          self.user = {
            uid: userAuth.uid,
            lastRefreshed: new Date(),
            auth: JSON.parse(JSON.stringify(userAuth)),
          }
        if (self.user.auth && !self.user.data)
          self.getUserData(self.user.auth)
          .then(userData => {
            console.log('👤  New User data!', userData)
            self.user.data = userData
            self.updateAuthState('loggedIn')
            resolve(self.user)
          }).catch(e => {
            self.updateAuthState('loggedOut') // Could have another state for this scenario?
            resolve(null)
          })
        if (!self.user.auth) {
          console.log('Calling back but with no user')
          self.updateAuthState('loggedOut')
          if (!self.firstLoginAttempted) {
            self.firstLoginAttempted = true
            // self.signIn() // @TODO: Once we know this auto-onstart-login is not needed in chrome extension, delete this + firstLoginAttempted
          }
          resolve(null)
        }
      })
    }
    self.authSignIn = token => new Promise((resolve, reject) => {
      console.log('🔑 Auth 🔑 - authSignIn', token)
      var credential = self.firebase.auth.GoogleAuthProvider.credential(null, token)
      console.log('self.firebase')
      console.log(self.firebase)
      console.log('credential')
      console.log(credential)
      self.firebase.auth().signInWithCredential(credential)
      .then(res => {
        // console.log('Auth starting')
        // myAuth.initApp(false, onAuthStateChanged, { firebaseConfig: self.firebaseConfig, organisation: organisation })
        // console.log('Auth done')
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    })
    self.signedIn = () => {
      console.log('🔑 Auth 🔑 - signedIn')
      const signedIn = self.Testing ? self.user.uid : !!self.firebase.auth().currentUser
      return signedIn
    }
    self.getAccessToken = async forceRefresh => {
      console.log('🔑 Auth 🔑 - getAccessToken', forceRefresh)
      try {
        if (forceRefresh || !self.user.lastRefreshed || new Date().getTime() - new Date(self.user.lastRefreshed).getTime() > 1000 * 60 * 30) {
          const token = await self.firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
          if (self.user && self.user.auth && self.user.auth.stsTokenManager)
            self.user.auth.stsTokenManager.accessToken = token
          console.log('New User Token!', token.substring(0, 100) + '...')
          self.user.lastRefreshed = new Date()
          return token
        } else {
          const token = self.user.auth.stsTokenManager.accessToken
          console.log('Existing User Token!', token.substring(0, 100) + '...')
          return token
        }
      } catch (e) {
        console.log(e)
        return null
      }
    }
    self.refreshUserToken = async () => {
      console.log('🔑 Auth 🔑 - refreshUserToken')
      const token = await self.getAccessToken(true)
      return token
    }
    self.getUserData = async userAuth => {
      console.log('🔑 Auth 🔑 - getUserData', userAuth)
      const idToken = await self.refreshUserToken()
      console.log('idToken (in getUserData())', idToken.substring(0, 100) + '...')
      if (self.Testing) {
        return testUserData
      } else if (idToken) {
        var response
        try {
          // response = await axios.post('http://localhost:5050/get-user', { idToken: idToken })
          response = await axios.post('https://savvy-nlp--staging.herokuapp.com/get-user', { idToken: idToken })
          console.log('📪  The response data!', response.data)
          return response.data.results
        } catch (e) {
          console.log('Couldn\'t get user data', e)
          return null
        }
      } else {
        console.log('📛  Error! Couldn\'t get user data')
        return null
      }
    }
    self.getUser = async (attemptNumber) => { // Trying to migrate TO this!
      const randomID = parseInt(Math.random() * 10000)
      if (!attemptNumber) attemptNumber = 0
      console.log('🔑 Auth 🔑 - self.getUser, attempt: ' + attemptNumber + ' id:', randomID)
      const self = this
      const user = self.user ? JSON.parse(JSON.stringify(self.user)) : null
      if (!user.auth) {
        if (self.authState && self.authState === 'pending' && attemptNumber < 2) {
          console.log('Will wait to attempt #', attemptNumber)
          // const inceptionUser = await new Promise((resolve, reject) => {
          //   setTimeout(() => {
          //     console.log('Now attempting #', attemptNumber)
          //     self.getUser(attemptNumber + 1).then(resolve).catch(reject)
          //   }, 5000)
          // })
          // return inceptionUser
        } else {
          console.log('🔑 Auth 🔑 -  Don\'t even have user.auth yet! (Previous Attempts: ' + attemptNumber + ') Sending back null.')
          return null
        }
      }
      if (!user.data || (user.lastRefreshed && new Date() - user.lastRefreshed > 1000 * 60 * 30)) { // Refreshes every 30 mins, since auth token expires every 60 mins
        console.log('♻️  Refreshing User Token!')
        const token = await self.refreshUserToken()
        user.auth.stsTokenManager.accessToken = token
        user.lastRefreshed = new Date()
        console.log('self.user', self.user)
        const userData = await self.getUserData(token)
        user.data = userData
        console.log('self.user1', self.user)
      }
      user.refreshUserToken = self.refreshUserToken // Need to move away from this as functions can't be passed from event-page to content-script
      user.testingtesting1 = true
      self.user = user
      console.log('🔑 Auth 🔑 - sending user back (async):', randomID, user)
      return user
    }
    self.joinOrg = organisationID => {
      console.log('🔑 Auth 🔑 - joinOrg', organisationID)
      return new Promise(function(resolve, reject) {
        console.log('Joining Org!')
        try {
          self.updateAuthState('pending')
          self.refreshUserToken()
          .then(idToken => {
            return axios.post('https://forget-me-not--staging.herokuapp.com/api/user/add', {
              organisationID: self.organisation.id,
              user: { uid: self.user.auth.uid, idToken: idToken },
              verifiedEmails: self.user.auth.emails || [ self.user.auth.email ] // Only working for Google Auth for now
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
    self.forceUser = async toForce => {
      console.log('forceUser', toForce)
      self.user.data.role = toForce
      console.log('Forced user', self.user)
      self.updateAuthState('loggedIn')
      return self.user
    }
  }
}

export default Auth

const testUserAuth = {
  apiKey: 'AIzaSyDbf9kOP-Mb5qroUdCkup00DFya0OP5Dls',
  appName: '[DEFAULT]',
  authDomain: 'savvy-96d8b.firebaseapp.com',
  createdAt: '1509293764000',
  displayName: 'Jeremy Evans',
  email: 'jeremy@explaain.com',
  emailVerified: true,
  isAnonymous: false,
  lastLoginAt: '1517500086000',
  photoURL: 'https://lh4.googleusercontent.com/-1K9EhRUQf8c/AAAAAAAAAAI/AAAAAAAAAC0/1fqqBt0FcFw/photo.jpg',
  providerData: [
    {
      displayName: 'Jeremy Evans',
      email: 'jeremy@explaain.com',
      phoneNumber: null,
      photoURL: 'https://lh4.googleusercontent.com/-1K9EhRUQf8c/AAAAAAAAAAI/AAAAAAAAAC0/1fqqBt0FcFw/photo.jpg',
      providerId: 'google.com',
      uid: '104380110279658920175',
    }
  ],
  redirectEventId: null,
  stsTokenManager: {
    accessToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImNhNDYwYWY5NTFhY2NjMmRlNDc0NTAwZjc5NDk4OWE0M2RlNzMwNjMifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc2F2dnktOTZkOGIiLCJuYW1lIjoiSmVyZW15IEV2YW5zIiwicGljdHVyZSI6Imh0dHBzOi8vbGg0Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tMUs5RWhSVVFmOGMvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQzAvMWZxcUJ0MEZjRncvcGhvdG8uanBnIiwiYXVkIjoic2F2dnktOTZkOGIiLCJhdXRoX3RpbWUiOjE1MTc1MDAwODYsInVzZXJfaWQiOiJ2WndlQ2FaRVdsWlB4MGdwUW4yYjFCN0RGQVoyIiwic3ViIjoidlp3ZUNhWkVXbFpQeDBncFFuMmIxQjdERkFaMiIsImlhdCI6MT,UxNzUwMDA4NiwiZXhwIjoxNTE3NTAzNjg2LCJlbWFpbCI6ImplcmVteUBleHBsYWFpbi5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjEwNDM4MDExMDI3OTY1ODkyMDE3NSJdLCJlbWFpbCI6WyJqZXJlbXlAZXhwbGFhaW4uY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.fNDOB9ZuvTRN9hxpYQX8BlPSVoXmcV4DrlTVNksKgjloZeCjxXNQqhqDYJ9uc5YHTPOlFI-YPj7B8NZk2bzVDlb3-huLRmciB0QtQz9Siz7RVDGVE8NV9WrSuXAY0jwBNKPIA7o8WnDQOh_wuhMYv0pe6gPDDMZ-bDyvEgHwFY7guONg0RrITifKOJirpWNqBEnSHSOrwbThrvPHZTedDgFmAmJ_dSnRYJ1kLeBniaIDpRS2lOvcdSsakd9dsTWbkM9gUEg_UXs8LOMITtTUVkn562tLYTfoMuL34YtA9o4ed3Eo9tpICz62Y8v22zG1BylsDaEwraf32go8izHAxQ',
    apiKey: 'AIzaSyDbf9kOP-Mb5qroUdCkup00DFya0OP5Dls',
    expirationTime: 1517503685194,
    refreshToken: 'AEoYo8vHrM_cCtIeb9QXC3ani4BxKNv6Hkv4NEDn6sm0cdALXuqqCiv7X8vcFWzosv1spHmuv57amtV4mnPbLSKrJHQ32NnUZQcm3Lz6C3zV_oN2NBGoDD45b9wmnPrj-IzwUImGQU7HYdj_sLnPed86fWBvaz6awDTQaPvnZfCBuPxKjcsSRO739leq3np2XFzCI0ty6NdnOrUfaftD1zsa9XCE3ZMk9aV0hTb0bqwrQxAV5mQF8kjM_Cj74bi9WAaq_Cbl6JlhVfwgXzKbhj5UdhJrlEQhW2ytDK_WpzvFBriNFfxJBqI8d43FsF0yXSRAkWdDduGIgOsklSPsRUvy6pj40BHtsyEgrqou-uocnnLUQHXjFBE',
  },
  uid: 'vZweCaZEWlZPx0gpQn2b1B7DFAZ2',
}

const testUserData = {
  algoliaApiKey: '88bd0a77faff65d4ace510fbf172a4e1',
  firebase: 'vZweCaZEWlZPx0gpQn2b1B7DFAZ2',
  first: 'Jeremy',
  last: 'Evans',
  objectID: 'vZweCaZEWlZPx0gpQn2b1B7DFAZ2',
  organisationID: 'explaain',
  slack: 'U04NVHJFD',
}
