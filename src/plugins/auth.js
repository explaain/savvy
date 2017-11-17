// import Vue from 'vue'
import * as firebase from 'firebase'
import axios from 'axios'
// import VueAxios from 'vue-axios'

// Vue.use(VueAxios, axios)

const Auth = {
  install(Vue, options) {
    const self = this
    self.organisation = options.organisation
    self.user = {}
    var stateChangeCallback = () => {}
    console.log('🖌  Auth running!')
    // console.log('globalvar:', Vue.globalvar)
    // console.log('Vue.prototype.$appName:', Vue.prototype.$appName)
    /**
     * Function called when clicking the Login/Logout button.
     */
    // [START buttoncallback]

    const updateAuthState = state => {
      self.authState = state
      stateChangeCallback(self.user)
    }
    updateAuthState('pending')

    const toggleSignIn = function() {
      console.log('🔐  Toggling Sign in')
      if (!firebase.auth().currentUser) {
        var provider = new firebase.auth.GoogleAuthProvider()
        provider.addScope('https://www.googleapis.com/auth/plus.login')
        firebase.auth().signInWithRedirect(provider)
      } else {
        firebase.auth().signOut()
      }
      updateAuthState('pending')
    }
    // [END buttoncallback]

    /**
     * initApp handles setting up UI event listeners and registering Firebase auth listeners:
     *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
     *    out, and that is where we update the UI.
     *  - firebase.auth().getRedirectResult(): This promise completes when the user gets back from
     *    the auth redirect flow. It is where you can get the OAuth access token from the IDP.
     */
    const initApp = function(init, callback) {
      console.log('🔏⛏  Initialising Auth')
      stateChangeCallback = callback
      var config = {
        apiKey: 'AIzaSyDbf9kOP-Mb5qroUdCkup00DFya0OP5Dls',
        authDomain: 'savvy-96d8b.firebaseapp.com',
      }
      if (init)
        firebase.initializeApp(config)

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
        if (userAuth) {
          userAuth = JSON.parse(JSON.stringify(userAuth))
          console.log('🖌👤  Setting user', userAuth)
          self.user = {
            uid: userAuth.uid,
            lastRefreshed: new Date(),
            auth: userAuth,
            getAccessToken: () => userAuth.stsTokenManager.accessToken
          }
          if (self.organisation.id) {
            getUserData(self.organisation.id, userAuth)
            .then(userData => {
              console.log('👤  User data!', userData)
              self.user.data = userData
              updateAuthState('loggedIn')
              console.log('self.authState', self.authState)
              stateChangeCallback(self.user)
            }).catch(e => {
              // updateAuthState('loggedOut') // ???
              // console.log(e)
              updateAuthState('readyToJoinOrg') // Logged in but not yet joined organisation
              console.log('self.authState', self.authState)
              stateChangeCallback(self.user)
            })
          } else {
            updateAuthState('readyToChooseOrg') // Logged in but not yet chosen (or joined) organisation
            console.log('self.authState', self.authState)
            stateChangeCallback(self.user)
          }
        } else {
          console.log('Calling back but with no user')
          updateAuthState('loggedOut')
          stateChangeCallback()
        }
      })
    }

    const refreshUserToken = () => {
      return new Promise(function(resolve, reject) {
        firebase.auth().currentUser.getToken(/* forceRefresh */ true).then((idToken) => {
          console.log('New User Token!', idToken)
          resolve(idToken)
        }).catch((error) => {
          console.log(error)
          reject(error)
        })
      })
    }

    const getUserData = function (organisationID, userAuth) {
      return new Promise(function(resolve, reject) {
        axios.post(options.getUserDataUrl, {
          organisationID: organisationID,
          user: { uid: userAuth.uid, idToken: userAuth.stsTokenManager.accessToken }
        }).then((response) => {
          console.log('📪  The response data!', response.data)
          resolve(response.data)
        }).catch(function(e) {
          console.log(e)
          console.log('📛  Error!', e)
          reject(e)
        })
      })
    }

    const getUser = () => { // Not often used now!
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
      user.getAccessToken = () => user.auth.stsTokenManager.accessToken
      self.user = user
      return user
    }

    const joinOrg = organisationID => new Promise(function(resolve, reject) {
      console.log('Joining Org!')
      console.log('Joining Org!')
      try {
        updateAuthState('pending')
        axios.post('//forget-me-not--staging.herokuapp.com/api/user/add', {
          organisationID: self.organisation.id,
          user: { uid: self.user.auth.uid, idToken: self.user.auth.stsTokenManager.accessToken },
          verifiedEmails: [ self.user.auth.email ] // Only working for Google Auth for now
        }).then(res => {
          console.log(res)
          self.user.data = res.data
          updateAuthState('loggedIn')
          resolve(self.user)
        }).catch(e => {
          updateAuthState('readyToJoinOrg')
          console.log(e)
          reject(e)
        })
      } catch (e) {
        console.log(e)
      }
    })

    this.toggleSignIn = toggleSignIn
    this.initApp = initApp
    this.refreshUserToken = refreshUserToken
    this.getUser = getUser
    this.joinOrg = joinOrg
  }
}

export default Auth
