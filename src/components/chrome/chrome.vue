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
        <b-dropdown id="user-ddown1" text="User" variant="link" class="profile" size="lg" no-caret>
          <template slot="button-content">
            <img :src="profileImage" :class="user && user.data && user.data.role">
          </template>
          <b-dropdown-item @click="showConnectPanel = true">🔌 Connect Services</b-dropdown-item>
          <!-- <b-dropdown-item @click="forceUser('toggle')">🐞 Switch to {{user.data.role === 'admin' ? 'Member' : 'Admin'}}</b-dropdown-item> -->
          <b-dropdown-item href="https://heysavvy.drift.com/matt" target="_blank">👋 Contact Us</b-dropdown-item>
          <b-dropdown-item @click="signOut">⚓️ Log Out</b-dropdown-item>
        </b-dropdown>
      </div>
      <div class="greeting" slot="greeting">
        <h3><span>Hi.</span> What are we looking for?</h3>
      </div>
      <!-- <ibutton slot="buttons" icon="search-plus" text="Page" :click="fromPage" v-if="sidebar"></ibutton> -->
    </explorer>
    <div class="popup-panel" v-if="showConnectPanel" @click.self="showConnectPanel = false">
      <connect :services="services" :organisationID="user.data.organisationID"></connect>
    </div>
  </div>
</template>

<script>
  import log from 'loglevel'
  import Vue from 'vue'
  import 'vue-awesome/icons'
  import Icon from 'vue-awesome/components/Icon.vue'
  import BootstrapVue from 'bootstrap-vue'

  import Explorer from '../explorer/explorer.vue'
  import Connect from '../connect.vue'
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
        showConnectPanel: false,
        services: [
          {
            title: 'Google Drive',
            id: 'gdrive',
            logo: 'https://www.shareicon.net/download/2016/11/22/854958_drive_512x512.png',
          },
          {
            title: 'Sifter',
            id: 'sifter',
            logo: 'https://www.pcmag.com/sm/pcmagus/photo/default/sifterlogo6_14fe.png',
          },
          {
            title: 'Zoho',
            id: 'zoho',
            logo: 'https://d7uddx54veb4a.cloudfront.net/wp-content/uploads/2016/10/logo-zoho.png',
          },
          {
            title: 'Confluence',
            id: 'confluence',
            logo: 'https://wac-cdn.atlassian.com/dam/jcr:a22c9f02-b225-4e34-9f1d-e5ac0265e543/confluence_rgb_slate.png',
          },
        ]
      }
    },
    computed: {
      profileImage: function() {
        return this.user && this.user.auth && this.user.auth.photoURL ? this.user.auth.photoURL : '/static/images/profile.jpg' // //static//
      }
    },
    components: {
      BootstrapVue,
      Icon,
      ibutton: IconButton,
      Explorer,
      Connect,
    },
    created: function(a) {
      const self = this
      console.log('chrome.vue created')
      Vue.use(BootstrapVue)
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
        if (toForce === 'toggle')
          toForce = this.user.data.role === 'admin' ? 'member' : 'admin'
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
    .profile {
      position: absolute;
      right: 20px;
      width: 35px;
      height: 35px;

      &.manager {
        box-shadow: 0px 0px 4px $savvy;
      }

      > button {
        margin: 0;
        padding: 0;
        background: none;
        border: none;
        box-shadow: none;

        img {
          width: 40px;
          border-radius: 50%;
        }
      }
      > .dropdown-menu {
        margin-top: 10px;
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

  .popup-panel {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0;
    padding: 40px;
    background-color: rgba(0,0,0,0.2);
    text-align: center;
    z-index: 100000;

    > .connect {
      @extend .block;
      display: inline-block;
      width: auto;
      padding: 40px;
    }
  }

</style>
