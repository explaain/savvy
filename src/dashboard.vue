<template>
<section id="dashboard">
  <div class="topBanner">
    <!-- Div for the top nav -->
    <div class="logoContainer">
      <img class="logo" src="./assets/logo.png"/>
    </div>
    <input v-if="auth.authState == 'loggedIn'" class="search" autofocus type="text" placeholder="Search for cards..." v-model="query" @keyup.enter="search">
    <ibutton v-if="auth.authState == 'loggedIn'" text="Search" icon="search" :click="search"></ibutton>
    <div class="spacer"></div>
    <!-- <div class="buttonContainer">
      <button v-if="authButtonText" class="sign-in" :disabled="auth.authState == 'pending'" id="quickstart-sign-in" @click="toggleSignIn">{{authButtonText}}</button>
    </div>
    <div>

    </div> -->
  </div>

  <section class="container">
    <div id="navigation-sidebar" class="sidebar" :class="{disabled: !auth.user || !auth.user.data}">
      <div class="option-profile">
        <img :src="auth.authState == 'loggedIn' && auth.user.data.name ? auth.user.auth.photoURL : '/static/images/profile.jpg'" alt="">
        <h3>Hey {{auth.authState == 'loggedIn' && auth.user.data.name ? auth.user.data.name.first : 'there'}}!</h3>
        <p>{{auth.authState == 'loggedIn' && auth.user.data.name ? organisation.id + ' Team' : 'Team Member'}}</p>
      </div>
      <router-link id="home" class="option exact" to="/">
        <!-- <icon name="home"></icon> -->
        🏠&nbsp;&nbsp; Home
      </router-link>
      <!-- <router-link id="notifications" class="option" to="/notifications">
        📬&nbsp;&nbsp; Inbox
      </router-link> -->
      <router-link id="analytics" class="option" to="/analytics">
        <!-- <icon name="line-chart"></icon> -->
        📈&nbsp;&nbsp; Analytics
      </router-link>
      <router-link id="card-manager" class="option" to="/card-manager">
        <!-- <icon name="clone"></icon> -->
        🗳&nbsp;&nbsp; Card Manager
      </router-link>
      <!-- <router-link id="teams" class="option" to="/teams">
        👥&nbsp;&nbsp; Teams
      </router-link> -->
      <!-- <router-link id="files" class="option" to="/files">
        🗂&nbsp;&nbsp; Files
      </router-link> -->
      <!-- <router-link id="help" class="option" to="/help">
        💡&nbsp;&nbsp; Help
      </router-link> -->
      <!-- <router-link id="billing" class="option" to="/billing">
        <icon name="money"></icon>
        Billing
      </router-link> -->
      <!-- <router-link id="settings" class="option" to="/settings">
        🔧&nbsp;&nbsp; Settings
      </router-link> -->
      <div v-if="auth.user && auth.user.auth" class="option" :disabled="auth.authState == 'pending'" @click="toggleSignIn">
        💤&nbsp;&nbsp; Sign Out
      </div>
    </div>
    <div class="routerView">
      <router-view :plugin="false" :organisation="organisation" :auth="auth">
        <h1 slot="header"><span class="emoji">🗳</span> Card Manager</h1>
        <h2 slot="header">We've made it super easy to view, edit, delete, create and manage all of your company knowledge in one place.</h2>
      </router-view>
    </div>
  </section>
</section>
</template>

<script>
  import Vue from 'vue'
  // import log from 'loglevel'
  import 'vue-awesome/icons'
  import Icon from 'vue-awesome/components/Icon.vue'
  import IconButton from './components/explorer/ibutton.vue'
  import Auth from './plugins/auth.js'

  export default {
    name: 'dashboard',
    components: {
      icon: Icon,
      ibutton: IconButton,
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
          authState: Auth.authState || 'pending',
          toggleSignIn: this.toggleSignIn,
          joinOrg: this.joinOrg
        },
        query: ''
      }
    },
    computed: {
      authButtonText: function() {
        const self = this
        var text
        switch (self.auth.authState) {
          case 'loggedIn':
          case 'readyToJoinOrg':
          case 'readyToChooseOrg':
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
      console.log('NODE_ENV:', process.env.NODE_ENV)
      console.log('BACKEND_URL:', process.env.BACKEND_URL)
      if (window.location.host.split('.')[2])
        self.organisation.id = window.location.host.split('.')[0]
      console.log('self.organisation', self.organisation)
      Vue.use(Auth, {
        organisation: self.organisation,
        // getUserDataUrl: '//forget-me-not--staging.herokuapp.com/api/user',
        getUserDataUrl: '//' + (process.env.BACKEND_URL || 'forget-me-not--staging.herokuapp.com') + '/api/user'
        // getUserDataUrl: '//localhost:3000/api/user',
      })
      Auth.initApp(true, self.onAuthStateChanged)
      Vue.globalGetUser = () => Auth.getUser()
      // Vue.globalSetUser = (user) => Auth.setUser()
      window.Intercom('boot', {
        app_id: 'et2ha1z8'
      })
    },
    methods: {
      toggleSignIn: () => {
        Auth.toggleSignIn()
      },
      joinOrg: () => Auth.joinOrg(),
      onAuthStateChanged: function(user) {
        const self = this
        console.log('onAuthStateChanged')
        console.log(user)
        this.auth.user = user
        this.auth.authState = Auth.authState
        console.log(Auth.authState)
        if (this.auth.authState === 'loggedIn')
          this.$router.push(this.$route.query.redirect || '/')
        else if (this.auth.authState === 'readyToJoinOrg' || this.auth.authState === 'readyToChooseOrg')
          this.$router.push(this.$route.query.redirect ? '/join?redirect=' + this.$route.query.redirect : '/join')
        else
          this.$router.push(this.$route.query.redirect ? '/login?redirect=' + this.$route.query.redirect : '/login')
        if (this.auth.authState === 'loggedIn')
          window.Intercom('boot', {
            app_id: 'et2ha1z8',
            email: self.auth.user.auth.email,
            created_at: 1234567890,
            name: self.auth.user.auth.displayName,
            user_id: self.auth.user.uid
          })
      },
      search: function() {
        const self = this
        self.$router.push('/card-manager?q=' + self.query)
        self.$emit('search')
      }
    }
  }
</script>

<style lang="scss" media="screen">
  @import 'styles/main.scss';

  body {
    @extend .defaultFont;
    margin: 0;
    background: $background;
  }

  #dashboard {
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
    input.search, button {
      margin: 20px;
    }
    input.search {
      height: 30px;
      padding: 5px 20px;
      margin-right: 0;
    }
    button {
      padding: 10px;
      height: 42px;
      width: 240px;
    }
  }

  .sidebar {
    @extend .block;
    padding: 0 0 20px;
    width: 20%;
    flex: 0 0 auto;

    &.disabled .option {
      cursor: default;
      color: #aaa;
      filter: grayscale(100%);

      &:hover {
        background: #fafafa;
        border-left: none;

        svg {
          color: $dashboardGrey;
        }
      }
    }

    .option-profile {
      padding: 20px;

      img {
        float: left;
        padding: 10px;
        max-width: 50px;
        border-radius: 50%;
      }
      h3, p {
        text-transform: capitalize;
        font-size: 1em;
        color: $dashboardGrey;
        font-weight: normal;
      }
      p {
        margin-top: -10px;
        font-size: 0.8em;
      }
    }

    .option {
      padding: 20px 40px;
      display: block;
      color: $dashboardGrey;
      text-decoration: none;
      cursor: pointer;

      &.router-link-exact-active.exact, &.router-link-active:not(.exact), &:hover {
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

  .container {
    display: flex;
    align-items: flex-start;
    padding: 10px;

    > div.routerView {
      flex: 1 1 auto;
      padding: 20px;

      header {
        text-align: center;
      }
      .explorer > .main > .header {
        margin-top: -40px;
      }
      > div > h1, .explorer > .main > .header h1 {
        font-size: 2.2em;
      }
      > div > h2, .explorer > .main > .header h2 {
        font-size: 1.2em;
      }
      > div {
        > div {
          padding: 20px;
        }
        > h1, > h2 {
          text-align: center;
        }
      }
    }
  }
  input.search {
    width: calc(100% - 82px);
    max-width: 500px;
  }
</style>
