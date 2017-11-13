<template>
<section id="dashboard">
  <div class="top-banner">
    <!-- Div for the top nav -->
    <div class="logo-container">
      <img class="logo" src="./assets/logo.png"/>
    </div>
    <button :disabled="signInButton.disabled" id="quickstart-sign-in" @click="toggleSignIn">{{signInButton.text}}</button>
    <div>

    </div>
    <!-- <h3>Source Testing</h3>
    <a href="http://localhost:3000/authorisations/add-gdrive">Add New Google Drive</a>
    <br />
    <br />
    <strong>Add New Confluence</strong>
    <br />
    <form method="get" action="http://localhost:3000/authorisations/save-confluence">
      Username  <input type="text" name="username" placeholder="admin"><br />
      Password <input type="password" name="password"><br />
      Site URL  <input type="url" name="baseUrl" placeholder="https://savvy-development.atlassian.net">
      <i> ie https://savvy-development.atlassian.net</i><br />
      <input type="submit">
    </form>
    (saves authorisation to db and processes files)
    <br />
    <br />
    <a href="http://localhost:3000/authorisations/update">Refresh Files</a>
    <br />
    (processes files from saved source) -->
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
        <li id="teams" class="option">
          <i></i>
          <router-link class="option-text" to="/teams">Teams</router-link>
        </li>
        <li id="files" class="option">
          <i></i>
          <router-link class="option-text" to="/files">Files</router-link>
        </li>
        <li id="help" class="option">
          <i></i>
          <router-link class="option-text" to="/help">Help</router-link>
        </li>
        <li id="billing" class="option">
          <i></i>
          <router-link class="option-text" to="/billing">Billing</router-link>
        </li>
        <li id="settings" class="option">
          <i></i>
          <router-link class="option-text" to="/settings">Settings</router-link>
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
    self.organisation = { name: 'explaain' } // Should get this from subdomain
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('BACKEND_URL:', process.env.BACKEND_URL)
    Vue.use(Auth, {
      organisation: self.organisation,
      // getUserDataUrl: '//forget-me-not--staging.herokuapp.com/api/user',
      getUserDataUrl: '//' + (process.env.BACKEND_URL || 'forget-me-not--staging.herokuapp.com') + '/api/user'
      // getUserDataUrl: '//localhost:3000/api/user',
    })
    Auth.initApp(true, self.onAuthStateChanged)
    Vue.globalGetUser = () => Auth.getUser()
    // Vue.globalSetUser = (user) => Auth.setUser()
  },
  methods: {
    getUser: () => Auth.getUser(),
    toggleSignIn: () => {
      Auth.toggleSignIn()
      this.signInButton.disabled = true
    },
    onAuthStateChanged: function(user) {
      this.user = user
      this.signInButton.text = user ? 'Sign out' : 'Sign in with Google'
      this.signInButton.disabled = false
    }
  }
}
</script>

<style media="screen">
  body {
    margin: 0;
  }
  #dashboard {
    background-color: #eee;
    min-height: 500px;
    overflow: auto;
  }

  .top-banner {
    padding: 20px;
  }

  .logo-container {
    float: left;
    width: 150px;
  }

  .logo {
    width: 100%;
    height: auto;
  }

  .container {
    height: auto;
    clear: both; /* drops down rest of page below top banner */
  }

  .sidebar {
    float: left;
    background-color: white;
    width: 10%;
  }

  .nav-options {
    list-style-type: none;
    padding-left: 0px;
    text-align: center;
    margin: 0;
  }

  .option {
    padding: 20px 0px;
    /*background-color: orange;*/
    border-style: solid;
  }

  .option-text {
    text-decoration: none;
    font-size: 20px;
    width: auto;
    /*background-color: purple;*/
    display: block;
  }

  .router-view {
    /*background-color: green;*/
    margin-left: 10%;
    padding: 20px;
  }

  button#quickstart-sign-in {
    float: right;
  }
</style>
