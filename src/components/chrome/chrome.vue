<template lang="html">
  <div class="app">
    <explorer :sidebar="sidebar" :userID="userID" :logo="logo" :firebaseConfig="firebaseConfig" :algoliaParams="algoliaParams" :authorParams="authorParams" @closeDrawer="closeDrawer" :local="local">
      <ibutton slot="buttons" icon="search-plus" text="Page" :click="fromPage" v-if="plugin"></ibutton>
    </explorer>
  </div>
</template>

<script>
  /* global chrome */
  import log from 'loglevel'
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
        firebaseConfig: {
          apiKey: 'AIzaSyBU0SEu3orHAoJ5eqxIJXS2VfyqXm1HoMU',
          authDomain: 'forgetmenot-1491065404838.firebaseapp.com',
          databaseURL: 'https:// forgetmenot-1491065404838.firebaseio.com',
          projectId: 'forgetmenot-1491065404838',
          storageBucket: '',
          messagingSenderId: '400087312665'
        },
        algoliaParams: { // Need to fetch these from app.vue to avoid duplication!
          appID: 'I2VKMNNAXI',
          apiKey: '2b8406f84cd4cc507da173032c46ee7b',
          index: 'ForgetMeNot_Context_Demo'
        },
        authorParams: {
          // url: 'https:// forget-me-not--app.herokuapp.com/api/memories',
          url: '// forget-me-not--demo.herokuapp.com/api/memories',
          // url: '// localhost:5000/api/memories',
          importUrl: '// forget-me-not--demo.herokuapp.com/api/import'
        },
        userID: '101118387301286232222', // This will be replaced by user: {authProvider: '', id: ''}
        plugin: true,
        logo: '../images/logo.png',
        pageCards: [], // ???
        cards: [], // ???
        // sidebar: true
      }
    },
    created: function(a) {
      const self = this
      self.getUser()
      if (self.plugin) {
        self.fromPage()
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
            self.updateCards(self.pageCards, 'No cards found from page')
            break
        }
      }, false)
    },
    components: {
      explorer: Explorer,
      ibutton: IconButton
    },
    methods: {
      getUser: function() {
        const self = this
        try {
          chrome.runtime.sendMessage({action: 'getUser'}, function(userID) {
            self.userID = userID || self.userID
            console.log('userID', self.userID)
          })
        } catch (e) {
          this.plugin = false
          self.userID = '1627888800569309'
          console.log('userID', self.userID)
        }
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

</style>
