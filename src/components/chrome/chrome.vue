 <!-- @TODO: remove hard-coded organisation -->

<template lang="html">
  <div class="app" :class="{'sidebar-true': sidebar}">
    <section class="chooseOrg" v-if="!organisation || !organisation.id">
      <h3>Hello! 👋 Please enter your organisation:</h3>
      <input v-model="organisationID" type="text" placeholder="organisation_id" @keyup.enter="selectOrganisation">.heysavvy.com
      <button class="highlight" type="button" name="button" @click="selectOrganisation">Select Organisation</button>
      <div class="spinner-div" v-if="orgLoading"><icon name="spinner" class="fa-spin fa-3x"></icon></div>
      <p class="error" v-if="errorMessage.length">{{errorMessage}}</p>
    </section>
    <explorer v-if="organisation && organisation.id" :plugin="plugin" :sidebar="sidebar" :logo="logo" :firebaseConfig="firebaseConfig" :algoliaParams="algoliaParams" :authorParams="authorParams" @closeDrawer="closeDrawer" :local="local" :organisation="organisation" :auth="auth" :testing="testing">
      <div class="chrome-header" slot="header">
        <!-- <button class="chrome-login" :disabled="signInButton.disabled" id="quickstart-sign-in" @click="toggleSignIn">{{signInButton.text}}</button> -->
        <img src="/images/logo.png" class="savvy-logo" alt="">
      </div>
      <!-- <ibutton slot="buttons" icon="search-plus" text="Page" :click="fromPage" v-if="sidebar"></ibutton> -->
    </explorer>
  </div>
</template>

<script>
  /* global chrome */
  import log from 'loglevel'
  // import Vue from 'vue'
  import 'vue-awesome/icons'
  import Icon from 'vue-awesome/components/Icon.vue'
  import Explorer from '../explorer/explorer.vue'
  import IconButton from '../explorer/ibutton.vue'

  log.setLevel('debug')

  export default {
    props: [
      'sidebar',
      'local',
      'testing'
    ],
    data() {
      return {
        organisation: {},
        auth: {
          user: {
            uid: '',
            auth: {},
            data: {}
          }
        },
        organisationID: '',
        orgLoading: false,
        errorMessage: '',
        signInButton: {
          text: 'Sign in with Google',
          disabled: true
        },
        firebaseConfig: {
          apiKey: 'AIzaSyBU0SEu3orHAoJ5eqxIJXS2VfyqXm1HoMU',
          authDomain: 'forgetmenot-1491065404838.firebaseapp.com',
          databaseURL: 'https://forgetmenot-1491065404838.firebaseio.com',
          projectId: 'forgetmenot-1491065404838',
          storageBucket: '',
          messagingSenderId: '400087312665'
        },
        algoliaParams: { // Need to fetch these from app.vue to avoid duplication!
          appID: 'D3AE3TSULH'
        },
        authorParams: {
          // url: 'https://forget-me-not--app.herokuapp.com/api/memories',
          url: 'https://forget-me-not--staging.herokuapp.com/api/memories',
          // url: '//localhost:3000/api/memories',
          importUrl: 'https://forget-me-not--staging.herokuapp.com/api/import'
        },
        plugin: true,
        logo: '../images/logo.png',
        pageCards: [], // ???
        cards: [], // ???
        // sidebar: true
      }
    },
    components: {
      Explorer,
      Icon,
      ibutton: IconButton
    },
    created: function(a) {
      const self = this
      // self.getUser()
      if (self.testing) {
        self.organisation = {
          id: 'explaain'
        }
        self.auth = {
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
        this.refreshUser()
        .then(res => {
          console.log('self.organisation:', self.organisation)
        })
        // self.fromPage()
      }

      // Vue.use(Auth, {
      //   organisation: self.organisation,
      //   // getUserDataUrl: '//forget-me-not--staging.herokuapp.com/api/user',
      //   getUserDataUrl: '//localhost:3000/api/user',
      // })
      // Auth.initApp(false, self.onAuthStateChanged)

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
      selectOrganisation: function() {
        const self = this
        return new Promise(function(resolve, reject) {
          self.orgLoading = true
          chrome.runtime.sendMessage({action: 'selectOrganisation', data: { organisationID: self.organisationID }}, response => {
            console.log('response', response)
            self.orgLoading = false
            if (response.error) {
              self.errorMessage = 'Sorry, we can\'t sign you in to that organisation!'
              reject(response.error)
            } else {
              self.organisation = response.organisation
              self.algoliaParams.apiKey = response.data.algoliaKey
              self.algoliaParams.organisationID = response.organisation.id
              self.auth.user = response // Includes organisation
              resolve(response)
            }
          })
        })
      },
      refreshUser: function() {
        const self = this
        return new Promise(function(resolve, reject) {
          chrome.runtime.sendMessage({action: 'getUser'}, response => {
            console.log('response user', response)
            self.auth.user = response
            if (response.organisation)
              self.organisation = response.organisation
            resolve(response)
          })
        })
      },
      // toggleSignIn: function() {
      //   const self = this
      //   if (this.sidebar) {
      //     console.log('sidebar')
      //   } else {
      //     console.log('not sidebar')
      //     chrome.runtime.sendMessage({action: 'signIn'}, response => {
      //       console.log('response user', response)
      //       self.auth.user = response
      //     })
      //   }
      //   // Auth.toggleSignIn()
      //   this.signInButton.disabled = true
      // },
      // onAuthStateChanged: function(user) {
      //   console.log('onAuthStateChanged')
      //   console.log(user)
      //   this.auth.user = user
      //   this.auth.authState = Auth.authState
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
      //     chrome.runtime.sendMessage({action: 'getUser'}, function(userID) {
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

  body {
    margin: 0;
  }
  html, body, body > .app, body > .app > .explorer, body > .app > .explorer > .main {
    height: 100%;
  }
  body > div.app {
    margin: auto;
    text-align: center;

    > .explorer > .main {
      background: url("/images/background1.png");
    }
  }

  .savvy-logo {
    max-width: 240px;
    margin: 40px 0 -10px;
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
