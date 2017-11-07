<template>
<section id="dashboard">
  <div class="top-banner">
    <!-- Div for the top nav -->
    <div class="logo-container">
      <img class="logo" src="./assets/logo.png"/>
    </div>
    <h1>This is the top navigation</h1>
    <button :disabled="signInButton.disabled" id="quickstart-sign-in" @click="toggleSignIn">{{signInButton.text}}</button>
    <div>

    </div>
  </div>

  <section class="container">
    <div id="navigation-sidebar" class="sidebar">
      <!-- Div for the side nav -->
      <ul class="nav-options">
        <li id="home" class="option">
          <i></i>
          <router-link class="option-text" to="/">Home</router-link>
        </li>
        <li id="notifications" class="option">
          <i></i>
          <router-link class="option-text" to="/notifications">Notifications</router-link>
        </li>
        <li id="analytics" class="option">
          <i></i>
          <router-link class="option-text" to="/analytics">Analytics</router-link>
        </li>
        <li id="card-manager" class="option">
          <i></i>
          <router-link class="option-text" to="/card-manager">Card Manager</router-link>
        </li>
        <li id="team" class="option">
          <i></i>
          <router-link class="option-text" to="/team">Team</router-link>
        </li>
        <li id="help" class="option">
          <i></i>
          <router-link class="option-text" to="/help">Help</router-link>
        </li>
        <li id="billing" class="option">
          <i></i>
          <router-link class="option-text" to="/billing">Billing</router-link>
        </li>
      </ul>
    </div>
    <div class="router-view">
      <router-view :organisation="organisation" :getUser="getUser"></router-view>
    </div>
  </section>
</section>
</template>

<script>
import Vue from 'vue'
import Auth from './plugins/auth.js'

export default {
  name: 'dashboard',
  data () {
    return {
      organisation: {},
      user: {
        uid: '',
        auth: {},
        data: {}
      },
      signInButton: {
        text: 'Sign in with Google',
        disabled: true
      }
    }
  },
  created: function () {
    const self = this
    Vue.use(Auth, {
      // getUserDataUrl: '//forget-me-not--staging.herokuapp.com/api/user',
      getUserDataUrl: '//localhost:5000/api/user',
    })
    Auth.initApp(self.onAuthStateChanged)
    self.organisation = { name: 'explaain' } // Should get this from subdomain
  },
  methods: {
    getUser: function () {
      const self = this
      const user = JSON.parse(JSON.stringify(this.user))
      if (this.user.lastRefreshed && new Date() - this.user.lastRefreshed > 1000 * 60 * 30) { // Refreshes every 30 mins, since auth token expires every 60 mins
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
      return user
    },
    toggleSignIn: function() {
      Auth.toggleSignIn()
      this.signInButton.disabled = true
    },
    onAuthStateChanged: function(userAuth) {
      const self = this
      if (userAuth) {
        console.log('🖌👤  Setting user', userAuth)
        self.user.uid = userAuth.uid
        self.user.lastRefreshed = new Date()
        self.user.auth = userAuth
        Auth.getUserData(self.organisation.name, self.getUser().auth)
        .then(data => {
          console.log('👤  User data!', data)
          self.user.data = data
        }).catch(e => {
          console.log(e)
        })

        this.signInButton.text = 'Sign out'
      } else {
        this.signInButton.text = 'Sign in with Google'
      }
      this.signInButton.disabled = false
    }
  }
}
</script>
