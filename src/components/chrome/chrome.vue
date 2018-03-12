 <!-- @TODO: remove hard-coded organisation -->

<template lang="html">
  <div class="app" :class="{'sidebar-true': sidebar}">
    <!-- <button class="login" :disabled="authState === 'pending'" @click="signOut">Sign Out</button> -->
    <section class="chooseOrg" v-if="authState === 'loggedOut' || justClicked">
      <h3>Hello! 👋 Please sign in below:</h3>
      <button class="login" :disabled="authState === 'pending'" @click="signIn">Sign In</button>
      <p class="error" v-if="errorMessage.length">{{errorMessage}}</p>
    </section>
    <div class="spinner-div" v-if="authState === 'pending'"><icon name="spinner" class="fa-spin fa-3x"></icon></div>
    <explorer v-if="authState === 'loggedIn'" :plugin="plugin" :sidebar="sidebar" :logo="logo" :Controller="Controller" :authState="authState" :user="user" @closeDrawer="closeDrawer" :local="local" :organisation="organisation" :testing="testing">
      <div class="chrome-header" slot="header">
        <img :src="logo" class="savvy-logo" alt=""> <!-- //static// -->
        <img @click.alt="forceUser('admin')" @click.shift="forceUser('member')" :src="profileImage" class="profile" :class="user && user.data && user.data.role">
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
      'Controller',
      'authState',
      'user',
      'LogRocket'
    ],
    data() {
      return {
        organisation: {},
        organisationID: '',
        orgLoading: false,
        errorMessage: '',
        plugin: true,
        logo: '/static/images/logo.png',
        pageCards: [], // ???
        cards: [], // ???
        // sidebar: true,
        justClicked: false,
      }
    },
    computed: {
      profileImage: function() {
        return this.user && this.user.auth && this.user.auth.photoURL ? this.user.auth.photoURL : '/static/images/profile.jpg' // //static//
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
      if (self.testing) {
        console.log('In Testing Mode!')
        self.organisation = {
          id: 'explaain'
        }
        self.user = {
          auth: {},
          data: {
            algoliaKey: '88bd0a77faff65d4ace510fbf172a4e1',
            name: {
              first: 'Jeremy',
              last: 'Evans'
            },
            teams: []
          },
          uid: 'vZweCaZEWlZPx0gpQn2b1B7DFAZ2'
        }
      // } else if (self.plugin) {
      //   console.log('chrome.vue plugin')
      //   this.refreshUser()
      //   .then(res => {
      //     console.log('self.organisation:', self.organisation)
      //     console.log('self.authState', self.authState)
      //   })
      //   // self.fromPage()
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
    },
    methods: {
      forceUser: async function(toForce) {
        console.log('Forcing')
        const user = await this.Controller.force({ user: toForce })
        console.log('forced:', user)
      },
      signIn: function() {
        const self = this
        console.log(self.Controller)
        self.Controller.signIn()
        self.justClicked = true
      },
      signOut: function() {
        this.Controller.signOut()
      },
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

  @import '../../styles/bootstrap.min.css';
  @import '../../styles/bootstrap-vue.css';
  @import '../../styles/main.scss';

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

      &.manager {
        box-shadow: 0px 0px 4px $savvy;
      }
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
  .spinner-div {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 180px 0;
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
  .sidebar-true {
    section.chooseOrg {
      width: 50%;
      position: absolute;
      right: 0
    }
    .spinner-div {
      left: 50%;
    }
  }

</style>
