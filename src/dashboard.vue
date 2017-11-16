<template>
<section id="dashboard">
  <div class="topBanner">
    <!-- Div for the top nav -->
    <div class="logoContainer">
      <img class="logo" src="./assets/logo.png"/>
    </div>
    <div class="spacer">

    </div>
    <div class="buttonContainer">
      <button class="sign-in" :disabled="auth.authState == 'pending'" id="quickstart-sign-in" @click="toggleSignIn">{{authButtonText}}</button>
    </div>
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
        <router-link id="home" class="option" to="/">
          <icon name="home"></icon>
          Home
        </router-link>
        <router-link id="notifications" class="option" to="/notifications">
          <icon name="envelope-open-o"></icon>
          Inbox
        </router-link>
        <router-link id="analytics" class="option" to="/analytics">
          <icon name="line-chart"></icon>
          Analytics
        </router-link>
        <router-link id="card-manager" class="option" to="/card-manager">
          <icon name="clone"></icon>
          Card Manager
        </router-link>
        <router-link id="teams" class="option" to="/teams">
          <icon name="users"></icon>
          Teams
        </router-link>
        <router-link id="files" class="option" to="/files">
          <icon name="folder-o"></icon>
          Files
        </router-link>
        <router-link id="help" class="option" to="/help">
          <icon name="question-circle-o"></icon>
          Help
        </router-link>
        <router-link id="billing" class="option" to="/billing">
          <icon name="money"></icon>
          Billing
        </router-link>
        <router-link id="settings" class="option" to="/settings">
          <icon name="gears"></icon>
          Settings
        </router-link>
    </div>
    <div class="routerView">
      <router-view :organisation="organisation" :auth="auth"></router-view>
    </div>
  </section>
</section>
</template>

<script>
  import Vue from 'vue'
  import 'vue-awesome/icons'
  import Icon from 'vue-awesome/components/Icon.vue'
  import Auth from './plugins/auth.js'

  export default {
    name: 'dashboard',
    components: {
      icon: Icon
    },
    data () {
      return {
        organisation: {},
        auth: {
          user: {
            uid: '',
            auth: {},
            data: {}
          },
          authState: Auth.authState || 'pending'
        }
      }
    },
    computed: {
      authButtonText: function() {
        const self = this
        var text
        switch (self.auth.authState) {
          case 'loggedIn':
            text = 'Sign out'
            break
          case 'loggedOut':
            text = 'Sign in with Google'
            break
          case 'pending':
            text = 'Working...'
            break
        }
        return text
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
      toggleSignIn: () => {
        console.log('hihi')
        Auth.toggleSignIn()
      },
      onAuthStateChanged: function(user) {
        this.user = user
        this.auth.authState = Auth.authState
        if (this.auth.authState === 'loggedIn' && this.$route.query.redirect) {
          this.$router.push(this.$route.query.redirect)
        }
      }
    }
  }
</script>

<style lang="scss" media="screen">
  @import 'styles/main.scss';

  body {
    @extend .defaultFont;
    margin: 0;
  }

  #dashboard {
    background-color: #f6f6f6;
    min-height: 500px;
    overflow: auto;
  }

  .topBanner {
    @extend .blockStyle;
    display: flex;
    margin: 0 0 10px 0;

    .logoContainer {
      flex: 1 1 20%;
      margin: 20px 50px;

      .logo {
        width: 120px;
        height: auto;
        padding-top: 6px; // Until the logo image itself is vertically centred
      }
    }
    .spacer {
      flex: 1 1 60%;
    }
    .buttonContainer {
      flex: 1 1 20%;
      margin: 10px 50px;
    }
  }

  .container {
    display: flex;
    align-items: flex-start;
    padding: 10px;
  }

  .sidebar {
    @extend .block;
    padding: 20px 0;
    width: 20%;
    flex: 0 0 auto;

    .option {
      padding: 20px 0px;
      display: block;
      color: $dashboardGrey;
      text-decoration: none;

      &.router-link-exact-active, &:hover {
        background: $savvyLight;
        border-left: 5px solid $savvy;

        svg {
          color: $savvy;
        }
      }

      svg {
        display: inline-block;
        margin: 0px 10px -3px 40px;
      }
      .optionText {
        display: inline-block;
        margin: 0 40px 0 5px;
        text-decoration: none;
        font-size: 20px;
        color: $dashboardGrey;
      }
    }
  }

  .routerView {
    flex: 1 1 auto;
    padding: 20px;

    header {
      text-align: center;
    }
    > div > div {
      padding: 20px;
    }
  }

  button#quickstart-sign-in {
    float: right;
  }
</style>
