<template lang="html">
  <div class="app" :class="{'sidebar-true': sidebar}">
    <explorer :sidebar="sidebar" :logo="logo" :firebaseConfig="firebaseConfig" :algoliaParams="algoliaParams" :authorParams="authorParams" @closeDrawer="closeDrawer" :local="local" :organisation="organisation" :auth="auth">
      <div class="chrome-header" slot="header">
        <button class="chrome-login" :disabled="signInButton.disabled" id="quickstart-sign-in" @click="toggleSignIn">{{signInButton.text}}</button>
        <img src="/images/logo.png" class="savvy-logo" alt="">
      </div>
      <ibutton slot="buttons" icon="search-plus" text="Page" :click="fromPage" v-if="plugin"></ibutton>
    </explorer>
  </div>
</template>

<script>
  /* global chrome */
  import log from 'loglevel'
  // import Vue from 'vue'
  import Explorer from '../explorer/explorer.vue'
  import IconButton from '../explorer/ibutton.vue'

  log.setLevel('debug')

  export default {
    props: [
      'sidebar',
      'local'
    ],
    data() {
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
          appID: 'I2VKMNNAXI',
          apiKey: '2b8406f84cd4cc507da173032c46ee7b',
          index: 'Savvy'
        },
        authorParams: {
          // url: 'https://forget-me-not--app.herokuapp.com/api/memories',
          // url: '//forget-me-not--staging.herokuapp.com/api/memories',
          url: '//localhost:3000/api/memories',
          importUrl: '//forget-me-not--staging.herokuapp.com/api/import'
        },
        plugin: true,
        logo: '../images/logo.png',
        pageCards: [], // ???
        cards: [], // ???
        // sidebar: true
      }
    },
    components: {
      explorer: Explorer,
      ibutton: IconButton
    },
    created: function(a) {
      const self = this
      // self.getUser()
      if (self.plugin)
        self.fromPage()

      self.organisation = { id: 'explaain' } // Should get this from subdomain

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
            self.updateCards(self.pageCards, 'No cards found from page')
            break
        }
      }, false)
      self.refreshUser()
    },
    methods: {
      auth: function() {
        return {
          user: this.user
        }
      },
      refreshUser: function() {
        const self = this
        return new Promise(function(resolve, reject) {
          chrome.runtime.sendMessage({action: 'getUser'}, response => {
            console.log('response user', response)
            self.user = response
            resolve(response)
          })
        })
      },
      toggleSignIn: function() {
        const self = this
        if (this.sidebar) {
          console.log('sidebar')
        } else {
          console.log('not sidebar')
          chrome.runtime.sendMessage({action: 'signIn'}, response => {
            console.log('response user', response)
            self.user = response
          })
        }
        // Auth.toggleSignIn()
        this.signInButton.disabled = true
      },
      onAuthStateChanged: function(user) {
        console.log('user', user)
        this.user = user
        this.signInButton.text = user ? 'Sign out' : 'Sign in with Google'
        this.signInButton.disabled = false
      },
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

<style lang="css">

  body > div.app {
    margin: auto;
    text-align: center;
  }

  .savvy-logo {
    max-width: 240px;
    margin: 40px 0 -10px;
  }

  .chrome-login {
    display: block;
    margin: 30px auto -10px;
  }

</style>
