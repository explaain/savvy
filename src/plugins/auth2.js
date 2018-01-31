// import Vue from 'vue'
// import firebase from 'firebase'
import axios from 'axios'
// import VueAxios from 'vue-axios'

// Vue.use(VueAxios, axios)

var globalOptions
var firebase

const Auth = {
  install(options) {
    if (options)
      globalOptions = options
    this.organisation = options.organisation
    if (!this.user)
      this.user = {}
    // const self = this
    console.log('🖌  Auth running!')
    // console.log('globalvar:', Vue.globalvar)
    // console.log('Vue.prototype.$appName:', Vue.prototype.$appName)
    /**
     * Function called when clicking the Login/Logout button.
     */
    // [START buttoncallback]
    // const toggleSignIn = function() {
    //   console.log('🔐  Toggling Sign in')
    //   if (!firebase.auth().currentUser) {
    //     var provider = new firebase.auth.GoogleAuthProvider()
    //     provider.addScope('https://www.googleapis.com/auth/plus.login')
    //     firebase.auth().signInWithRedirect(provider)
    //   } else {
    //     firebase.auth().signOut()
    //   }
    // }
    // [END buttoncallback]

    /**
     * initApp handles setting up UI event listeners and registering Firebase auth listeners:
     *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
     *    out, and that is where we update the UI.
     *  - firebase.auth().getRedirectResult(): This promise completes when the user gets back from
     *    the auth redirect flow. It is where you can get the OAuth access token from the IDP.
     */
  },
  initApp: function(init, stateChangeCallback, options) {
    const self = this
    if (options)
      globalOptions = options

    this.organisation = options.organisation
    firebase = options.firebase

    console.log('🔏⛏  Initialising Auth')
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
        userAuth = userAuth ? JSON.parse(JSON.stringify(userAuth)) : {}
        console.log('🖌👤  Setting user', userAuth)
        self.user = {
          uid: userAuth.uid,
          lastRefreshed: new Date(),
          auth: userAuth
        }
        self.user.getAccessToken = self.getAccessToken
        self.user.refreshUserToken = self.refreshUserToken
        console.log(self.organisation)

        if (self.organisation && self.organisation.id)
          self.getUserData(self.organisation.id, userAuth)
          .then(userData => {
            self.user.data = userData
            console.log('👤  User data!', userData)
            stateChangeCallback(self.user)
          }).catch(e => {
            console.log(e)
          })
        else
          stateChangeCallback(self.user)
      } else {
        console.log('Calling back but with no user')
        stateChangeCallback()
      }
    })
  },
  refreshUserToken: function() {
    return new Promise(function(resolve, reject) {
      firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
        console.log('New User Token!')
        resolve(idToken)
      }).catch((error) => {
        console.log(error)
        reject(error)
      })
    })
  },
  getUserData: function (organisationID, userAuth) {
    const self = this
    return new Promise(function(resolve, reject) {
      console.log('globalOptions', globalOptions)
      self.refreshUserToken()
      .then(idToken => {
        return axios.post(globalOptions.getUserDataUrl, { // Need to allow this in manifest.json
          organisationID: organisationID,
          user: { uid: userAuth.uid, idToken: idToken }
        })
      }).then((response) => {
        console.log('📪  The response data!', response.data)
        resolve(response.data)
      }).catch(function(e) {
        console.log(e)
        console.log('📛  Error!', e)
        reject(e)
      })
    })
  },
  getUser: function() {
    const self = this
    const user = self.user ? JSON.parse(JSON.stringify(self.user)) : {}
    console.log(user)
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
    user.getAccessToken = self.getAccessToken
    user.refreshUserToken = self.refreshUserToken
    return user
  },
  selectOrganisation: function(organisation) {
    const self = this
    return new Promise(function(resolve, reject) {
      self.organisation = organisation
      self.getUserData(self.organisation.id, self.user.auth)
      .then(userData => {
        self.user.data = userData
        console.log('👤  User data!', userData)
        resolve(self.user)
      }).catch(e => {
        console.log(e)
        reject(e)
      })
    })
  },
  getAccessToken: function() {
    const self = this
    return self.user.auth.stsTokenManager.accessToken
  }
}

export default Auth
