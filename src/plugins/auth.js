import Vue from 'vue'
import * as firebase from 'firebase'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueAxios, axios)

const Auth = {
  install(Vue, options) {
    console.log('🖌  Auth running!')
    /**
     * Function called when clicking the Login/Logout button.
     */
    // [START buttoncallback]
    const toggleSignIn = function() {
      console.log('🔐  Toggling Sign in')
      if (!firebase.auth().currentUser) {
        var provider = new firebase.auth.GoogleAuthProvider()
        provider.addScope('https://www.googleapis.com/auth/plus.login')
        firebase.auth().signInWithRedirect(provider)
      } else {
        firebase.auth().signOut()
      }
    }
    // [END buttoncallback]

    /**
     * initApp handles setting up UI event listeners and registering Firebase auth listeners:
     *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
     *    out, and that is where we update the UI.
     *  - firebase.auth().getRedirectResult(): This promise completes when the user gets back from
     *    the auth redirect flow. It is where you can get the OAuth access token from the IDP.
     */
    const initApp = function(stateChangeCallback) {
      console.log('🔏⛏  Initialising Auth')
      var config = {
        apiKey: 'AIzaSyDbf9kOP-Mb5qroUdCkup00DFya0OP5Dls',
        authDomain: 'savvy-96d8b.firebaseapp.com',
      }
      firebase.initializeApp(config)
      // Result from Redirect auth flow.
      // [START getidptoken]
      firebase.auth().getRedirectResult().then(function(result) {
        // if (result.credential) {
        //   // This gives you a Google Access Token. You can use it to access the Google API.
        //   var token = result.credential.accessToken
        // }
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

      // Listening for auth state changes.
      // [START authstatelistener]
      firebase.auth().onAuthStateChanged(function(user) {
        if (user)
          stateChangeCallback(user)
        else
          stateChangeCallback()
      })
      // [END authstatelistener]
    }

    const getUserData = function (organisationID, userAuth) {
      return new Promise(function(resolve, reject) {
        Vue.axios.post(options.getUserDataUrl, {
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

    this.toggleSignIn = toggleSignIn
    this.initApp = initApp
    this.getUserData = getUserData
  },

}

export default Auth
