 <!-- @TODO: remove hard-coded organisation -->

<template lang="html">
  <div class="app" :class="{'sidebar-true': sidebar}">
    <section class="chooseOrg" v-if="authState !== 'loggedIn'">
      <h3>Hello! 👋 Please sign in below:</h3>
      <!-- <button class="login" :disabled="authState === 'pending'" @click="signIn">Sign In</button> -->
      <button class="login" @click="signIn">Sign In</button>
      <div class="spinner-div" v-if="orgLoading"><icon name="spinner" class="fa-spin fa-3x"></icon></div>
      <p class="error" v-if="errorMessage.length">{{errorMessage}}</p>
    </section>
    <explorer v-if="authState === 'loggedIn'" :plugin="plugin" :sidebar="sidebar" :logo="logo" :firebaseConfig="GlobalConfig.firebase" :algoliaParams="GlobalConfig.algolia" :authorParams="authorParams" @closeDrawer="closeDrawer" :local="local" :organisation="organisation" :auth="GlobalConfig.auth" :testing="testing">
      <div class="chrome-header" slot="header">
        <img :src="logo" class="savvy-logo" alt=""> <!-- //static// -->
        <img :src="profileImage" class="profile">
      </div>
      <div class="greeting" slot="greeting">
        <h3><span>Hi.</span> What are we looking for?</h3>
      </div>
      <!-- <ibutton slot="buttons" icon="search-plus" text="Page" :click="fromPage" v-if="sidebar"></ibutton> -->
    </explorer>
  </div>
</template>

<script>
  import log from 'loglevel'
  // import Vue from 'vue'
  import 'vue-awesome/icons'
  import Icon from 'vue-awesome/components/Icon.vue'
  import Explorer from '../explorer/explorer.vue'
  import IconButton from '../explorer/ibutton.vue'

  console.log('chrome.vue running')

  log.setLevel('debug')

  export default {
    props: [
      'sidebar',
      'local',
      'testing',
      'GlobalConfig',
      'Controller',
      'authState',
      'LogRocket'
    ],
    data() {
      return {
        organisation: {},
        organisationID: '',
        orgLoading: false,
        errorMessage: '',
        authorParams: {
          // url: 'https://forget-me-not--app.herokuapp.com/api/memories',
          // url: 'https://forget-me-not--staging.herokuapp.com/api/memories',
          // url: 'https://savvy-api--live.herokuapp.com/api/memories',
          url: 'http://localhost:5000/api/memories',
          // url: '//localhost:3000/api/memories',
          importUrl: 'https://forget-me-not--staging.herokuapp.com/api/import'
        },
        plugin: true,
        logo: '../../images/logo.png',
        pageCards: [], // ???
        cards: [], // ???
        // sidebar: true,
        chromeRuntime: {
          sendMessage: data => {
            console.log('sendMessage (chrome.js):', data)
            const self = this
            return new Promise((resolve, reject) => {
              // @TODO: Sort this so it rejects when error in actual chrome extension
              self.Controller.sendMessage(data, response => {
                console.log('Response received!', response)
                resolve(response)
              })
              // try {
              // } catch (e) {
              //   console.log('catching')
              //   if (data.action === 'signIn')
              //     self.GlobalConfig.auth.toggleSignIn().then(resolve)
              // }
            })
          },
        },
      }
    },
    computed: {
      profileImage: function() {
        return this.GlobalConfig && this.GlobalConfig.auth && this.GlobalConfig.auth.user && this.GlobalConfig.auth.user.auth && this.GlobalConfig.auth.user.auth.photoURL ? this.GlobalConfig.auth.user.auth.photoURL : '../../images/profile.jpg' // //static//
      }
    },
    components: {
      Explorer,
      Icon,
      ibutton: IconButton
    },
    created: function(a) {
      const self = this
      console.log('chrome.vue created')
      console.log('self.GlobalConfig', JSON.stringify(self.GlobalConfig))
      // self.getUser()
      if (self.testing) {
        console.log('In Testing Mode!')
        self.organisation = {
          id: 'explaain'
        }
        self.GlobalConfig.auth = {
          user: {
            auth: {},
            data: {
              algoliaKey: '88bd0a77faff65d4ace510fbf172a4e1',
              name: {
                first: 'Jeremy',
                last: 'Evans'
              },
              teams: []
            }
          },
          uid: 'vZweCaZEWlZPx0gpQn2b1B7DFAZ2'
        }
      } else if (self.plugin) {
        console.log('chrome.vue plugin')
        this.refreshUser()
        .then(res => {
          console.log('self.organisation:', self.organisation)
          console.log('self.authState', self.authState)
        })
        // self.fromPage()
      }

      window.addEventListener('message', function(event) {
        // log.info(event.data.action)
        switch (event.data.action) {
          case 'setLoading':
            self.$emit('setLoading')
            break
          case 'updatePageResults':
            log.info(event.data)
            self.pageCards = event.data.data.pageResults
            log.info(self.pageCards)
            self.updateCards(self.pageCards, 'No cards found from page')
            break
          case 'closingDrawer':
            log.info('[frame] Closing Drawer!')
            window.scrollTo(0, 0)
            self.$emit('closingDrawer')
            break
        }
      }, false)
      self.refreshUser()
    },
    methods: {
      refreshUser: function() {
        const self = this
        console.log('refreshUser')
        console.log(self)
        console.log(self.GlobalConfig)
        console.log('self.GlobalConfig', JSON.stringify(self.GlobalConfig))
        console.log('self.authState', self.authState)
        return new Promise(function(resolve, reject) {
          console.log('refreshUser Promise')
          console.log(self)
          console.log(self.GlobalConfig)
          console.log('self.GlobalConfig', JSON.stringify(self.GlobalConfig))
          self.chromeRuntime.sendMessage({action: 'getUser'})
          .then(response => {
            console.log('response user', response)
            self.GlobalConfig.auth.user = response
            if (response.organisation)
              self.organisation = response.organisation
            if (response.data && response.data.organisationID)
              self.organisation = { id: response.data.organisationID }
            self.authState = response ? 'loggedIn' : 'loggedOut' // This is hacky
            console.log('self.GlobalConfig', self.GlobalConfig)
            console.log('self.authState', self.authState)
            if (response)
              self.LogRocket.identify(response.uid, {
                name: response.auth ? response.auth.displayName : null,
                email: response.auth ? response.auth.email : null,
                organisation: response.data ? response.data.organisationID : null
              })
            // self.$emit('refreshUser', response)
            resolve(response)
          })
        })
      },
      signIn: function() {
        const self = this
        console.log(self.Controller)
        self.Controller.signIn()
        .then(response => {
          console.log('response to signIn()', response)
          self.GlobalConfig.auth.user = response
        })
      },
      toggleSignIn: function() {
        const self = this
        self.chromeRuntime.sendMessage({action: 'signIn'})
        .then(response => {
          console.log('response user', response)
          self.GlobalConfig.auth.user = response
        })
        // if (this.sidebar) {
        //   console.log('sidebar')
        //   // Why don't we allow it here?
        // } else {
        //   console.log('not sidebar')
        // }
      },
      // onAuthStateChanged: function(user) {
      //   console.log('onAuthStateChanged')
      //   console.log(user)
      //   this.auth.user = user
      // },
      // onAuthStateChanged: function(user) {
      //   console.log('user', user)
      //   this.user = user
      //   this.signInButton.text = user ? 'Sign out' : 'Sign in with Google'
      //   this.signInButton.disabled = false
      // },
      // getUser: function() {
      //   const self = this
      //   try {
      //     self.chromeRuntime.sendMessage({action: 'getUser'})
      //     .then(userID => {
      //       self.userID = userID || self.userID
      //       console.log('userID', self.userID)
      //     })
      //   } catch (e) {
      //     this.plugin = false
      //     self.userID = '1627888800569309'
      //     console.log('userID', self.userID)
      //   }
      // },
      fromPage: function() {
        console.log('fromPage')
        const message = {action: 'getPageResults'}
        window.parent.postMessage(message, '*')
        this.$emit('setLoading')
      },
      updateCards: function(cards, noCardMessage) {
        console.log(cards)
        const data = {
          cards: cards,
          noCardMessage: noCardMessage
        }
        log.debug(data)
        this.$emit('updateCards', data)
      },
      closeDrawer: function() {
        console.log('closeDrawer')
        const message = {action: 'closeDrawer'}
        window.parent.postMessage(message, '*')
      }
    }
  }
</script>

<style lang="scss">

  @import '../../styles/main.scss';
  @import '../../styles/bootstrap.min.css';
  @import '../../styles/bootstrap-vue.css';

  body {
    margin: 0;
    background: none;
  }
  html, body, body > .app, body > .app > .explorer, body > .app > .explorer > .main-explorer {
    height: 100%;
  }
  body > div.app {
    margin: auto;
    text-align: center;

    > .explorer > .main-explorer {
      background: $background;
    }
  }

  .chrome-header {
    img.savvy-logo {
      position: absolute;
      left: 20px;
      max-width: 120px;
    }
    img.profile {
      position: absolute;
      right: 20px;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      max-width: 120px;
    }
  }


  section.chooseOrg {
    display: block;
    margin: 120px auto -10px;

    input {
      max-width: 300px;
    }
    p.error {
      color: red;
    }
  }
  .sidebar-true section.chooseOrg {
    width: 50%;
    position: absolute;
    right: 0
  }
  .spinner-div {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 100px 0;
    font-size: 80px;
    background: rgba(255,255,255,0.5);

    svg {
      width: auto;
      height: 1em;
      /* The following two lines make this work in Safari */
      max-width: 100%;
      max-height: 100%;
    }
  }

</style>
