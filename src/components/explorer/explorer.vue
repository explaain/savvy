<template lang="html">
  <div class="explorer" v-bind:class="{sidebar: sidebar}">
    <div uid="main" class="main-explorer" @mouseover="overMain = true" @mouseout="overMain = false" :class="{mouseover : overMain, 'search-results': cards.length, 'mode': mode === 'demo'}">
      <div class="create-button">
        <b-dropdown id="ddown1" text="➕ Create" variant="default" class="m-md-2">
          <b-dropdown-item class="basic" @click="createCard(null)">🔖 New Card</b-dropdown-item>
          <!-- <b-dropdown-item class="issue" @click="createCard('sifter')">🐞 New Bug</b-dropdown-item> -->
        </b-dropdown>
      </div>
      <alert :show="alertData.show" :type="alertData.type" :title="alertData.title"></alert>
      <modal v-if="modal.show" @close="modal.show = false" @submit="modal.submit" :data="modal"></modal>
      <div class="header" v-if="!$route.query.q">
        <slot name="header"></slot>
        <div class="search">
          <slot name="greeting"></slot>
          <a href="#" class="closeSearch" @click="closeSearch"><icon name="close"></icon></a>
          <input autofocus type="text" tabindex="1" :placeholder="searchPlaceholder" v-model="query" @keyup.shift.enter="searchGoogle" @keyup.enter.exact="search">
          <div class="search-options" v-if="!sidebar">
            <label class="hint">Savvy Hint: {{hint}}</label>
            <b-form-group v-if="allowSearchStrategy" class="search-strategy-buttons">
              <b-form-radio-group id="btnradios1"
              buttons
              v-model="searchStrategy"
              :options="searchStrategyOptions"
              name="radiosBtnDefault" />
            </b-form-group>
          </div>
        </div>
        <slot name="buttons"></slot>
        <!-- <ibutton icon="plus" text="Create" :click="createCard"></ibutton> -->
      </div>
      <h2 v-if="$route.query.q">Your search results for "{{query}}":</h2>
      <p class="results-label" v-if="cards.length && !$route.query.q">Your search results for "{{lastQuery}}":</p>
      <div v-masonry transition-duration="0.5s" item-selector=".card" class="cards">
        <spinner v-if="loading && loader == -1"></spinner>
        <p class="message-block error" v-if="errorMessage && errorMessage.length"><icon name="exclamation-triangle"></icon>{{errorMessage}}</p>
        <!-- <p class="spinner" v-if="loading && loader == -1"><icon name="refresh" class="fa-spin fa-3x"></icon></p> -->
        <p class="loader-text" v-if="loader != -1">Importing and processing content...</p>
        <div class="loader" v-if="loader != -1"><div :style="{ width: loader + '%' }"></div></div>
        <p class="loader-card-text" v-if="loader != -1">{{loaderCards}} cards generated</p>
        <card v-masonry-tile v-for="(card, index) in cards" :plugin="plugin" @cardMouseover="cardMouseover" @cardMouseout="cardMouseout" @cardClick="cardClick" @fileClick="fileClick" @updateCard="updateCard" @verifyCard="verifyCard" @deleteCard="deleteCard" @reaction="reaction" :data="card" :key="card.objectID" :full="index === 0" :allCards="allCards" :highlightResult="card._highlightResult" @copy="copyAlert" :userRole="user.data.role" :userTopics="user.data.topics || []" :mode="mode"></card>
        <div class="no-cards" v-if="!cards.length">
          <p v-if="lastQuery.length">{{noCardMessage}}</p>
          <div v-if="mode === 'demo'" class="search-suggestions">
            <p>Try searching for:</p>
            <p>'What batch was Stripe in'</p>
            <p>'When did Sam go to Waterloo'</p>
            <!-- <p>'Who was in 2017 batch'</p> -->
            <p>'How did the Savvy team meet?'</p>
            <p>'Get me the YC logo'</p>
          </div>
          <img src="/static/images/search-graphic.png" alt=""> <!-- //static// -->
        </div>
      </div stagger="500">
    </div>
    <div class="popup" v-bind:class="{ active: popupCards.length }" @click.self="popupFrameClick">
      <div @click.self="popupFrameClick" class="cards">
        <spinner class="div-spinner" v-if="popupLoading"></spinner>
        <!-- <p class="spinner" v-if="popupLoading"><icon name="spinner" class="fa-spin fa-3x"></icon></p> -->
        <div class="popup-back" v-if="popupCards.length > 1" @click="popupBack"  @mouseover="cardMouseoverFromPopup"><icon name="arrow-left"></icon> Back to "<span class="name">{{(popupCards[popupCards.length - 2].title || popupCards[popupCards.length - 2].description || '').substring(0, 30)}}...</span>"</div>
        <card v-if="popupCards.length" :plugin="plugin" @cardMouseover="cardMouseoverFromPopup" @cardMouseout="cardMouseout" @cardClick="cardClickFromPopup" @fileClick="fileClick" @updateCard="updateCard" @verifyCard="verifyCard" @deleteCard="deleteCard" @reaction="reaction" :data="popupCards ? popupCards[popupCards.length - 1] : {}" :full="true" :allCards="allCards" @copy="copyAlert" :userRole="user.data.role" :userTopics="user.data.topics || []" :mode="mode"></card>
      </div>
    </div>
  </div>
</template>



<script>
  import log from 'loglevel'
  import Mixpanel from 'mixpanel-browser'
  import Vue from 'vue'
  import Airship from 'airship-js'
  import Q from 'q'
  import Draggable from 'vuedraggable'
  import 'vue-awesome/icons'
  import Icon from 'vue-awesome/components/Icon.vue'
  import BootstrapVue from 'bootstrap-vue'
  import {VueMasonryPlugin} from 'vue-masonry'

  import Spinner from '../spinner.vue'
  import Card from './card.vue'
  import IconButton from './ibutton.vue'
  import Modal from './modal.vue'
  import Alert from './alert.vue'
  import ExplaainSearch from '../../plugins/explaain-search.js'
  // import SavvyImport from '../../plugins/savvy-import.js'

  export default {
    components: {
      Card,
      Icon,
      ibutton: IconButton,
      BootstrapVue,
      Modal,
      Alert,
      Draggable,
      Spinner,
    },
    props: [
      'plugin',
      'user',
      'logo',
      'Controller',
      'authState',
      'sidebar',
      'local',
      'testing',
      'mode',
    ],
    data () {
      return {
        algoliaParams: {
          appID: 'D3AE3TSULH' // @TODO: Find a home for this!
        },
        allCards: {},
        mainCardList: [],
        pingCards: [],
        popupCardList: [],
        popupClicked: false,
        popupShowTimeout: null,
        popupCloseTimeout: null,
        overMain: false,
        loading: false,
        loader: -1,
        loaderCards: 0,
        popupLoading: false,
        query: '',
        lastQuery: '',
        modal: {
          show: false,
          text: ''
        },
        alertData: {
          show: false,
          type: '',
          title: ''
        },
        noCardMessage: '', // 'Type above to search for cards'
        errorMessage: null,
        hint: [
          'press Shift+Enter to search Google instead',
          'press the TAB key once to move the cursor to this search box',
          'to see recent updated cards, don\'t type anything, just press Enter',
        ][Math.floor(Math.random() * 1)], // Update this number with the number of hints!
        searchStrategy: 'algolia',
        searchStrategyOptions: [
          { text: 'Algolia', value: 'algolia' },
          { text: 'ElasticSearch', value: 'elasticsearch' }
        ],
        allowSearchStrategy: false,
      }
    },
    computed: {
      cards: function () {
        const self = this
        const watchThis = self.allCards // This does nothing other than force this function to watch for changes in self.allCards
        console.log('watchThis', watchThis)
        return self.mainCardList ? self.mainCardList.map(function(objectID) {
          return self.allCards[objectID] || { description: 'Card Not Found' }
        }) : []
      },
      popupCards: function () {
        const self = this
        const watchThis = self.allCards // This does nothing other than force this function to watch for changes in self.allCards
        console.log('watchThis', watchThis)
        return self.popupCardList ? self.popupCardList.map(function(objectID) {
          const card = self.allCards[objectID] || { description: 'Card Not Found' }
          if (card._highlightResult) delete card._highlightResult
          return card
        }) : []
      },
      searchPlaceholder: function() {
        // return document.documentElement.clientWidth > 850 ? 'Find anything (like holiday pay, product specs and brand colours)' : 'Find anything...'
        return 'Find anything...'
      },
    },
    watch: {
      searchStrategy: function(val) {
        console.log(111222)
        console.log(this.query)
        if (this.query)
          this.search()
      }
    },
    created: function () {
      console.log('Starting Explorer')
      const self = this
      Vue.use(VueMasonryPlugin)
      Vue.use(BootstrapVue)
      Vue.use(ExplaainSearch, self.algoliaParams, self.user)

      // Vue.use(SavvyImport)
      self.modal.sender = self.user.uid
      self.modal.callback = self.modalCallback
      self.$parent.$on('updateCards', self.updateCards)
      self.$parent.$on('getCard', self.getCard)
      self.$parent.$on('setLoading', self.setLoading)
      self.$parent.$on('closingDrawer', function() {
        self.closePopup(true)
      })
      self.$parent.$on('search', function(query) {
        self.search(self.$route.query.q)
      })

      // Load Airship Stuff
      let airship = new Airship({webApiKey: 'yqfb07697ad5lak33tu75docb2duty5f', envKey: 'ky4t3nn8vp56n169'})
      airship.identify({
        type: 'User',
        id: this.user.uid,
        displayName: this.user.auth.emails ? this.user.auth.emails[0] : this.user.auth.email,
        attributes: {
          organisationID: this.user.data ? this.user.data.organisationID : '0',
        },
        group: {
          type: 'Organisation',
          id: this.user.data ? this.user.data.organisationID : '0',
        }
      }).then(() => {
        self.allowSearchStrategy = airship.isEnabled('choose-search-strategy')
        console.log('airship.isEnabled(\'choose-search-strategy\')')
        console.log(airship.isEnabled('choose-search-strategy'))
      })

      // SavvyImport.beginImport()
      Mixpanel.init('e3b4939c1ae819d65712679199dfce7e', { api_host: 'https://api.mixpanel.com' })
      setTimeout(() => {
        if (self.$route.query.q)
          self.search(self.$route.query.q)
      }, 200)
    },
    updated: function() {
      const self = this
      this.$nextTick(function () {
        // Could this slow things down?
        self.$redrawVueMasonry()
      })
    },
    methods: {
      convertFileToCards: function(body, file) {
        const cards = []
        body.split(/(\r\n\r\n\r\n|\n\n\n|\r\r\r)/gm).forEach(function(chunk) {
          chunk = chunk.trim()
          if (chunk.length) {
            cards.push({
              description: chunk,
              extractedFrom: {
                title: file.name,
                url: file.webViewLink // Not yet working maybe?
              }
            })
          }
        })
        return cards
      },
      fetchCard: async function(objectID) {
        console.log('fetchCard1', objectID)
        const self = this
        const _highlightResult = self.allCards[objectID] && self.query === self.lastQuery ? self.allCards[objectID]._highlightResult : null // So that when a search is still active, popup cards etc don't lose their highlights
        const card = await ExplaainSearch.getCard(objectID)
        if (!card._highlightResult) card._highlightResult = _highlightResult
        Vue.set(self.allCards, objectID, card) // Forces this to be watched @TODO: Find out whether Vue.set() is still necessary! In this place at least it seems to work without
        return card
      },
      getCard: function(objectID) {
        const self = this
        const card = JSON.parse(JSON.stringify(self.allCards[objectID] || null))
        // if (!card)
        //   ExplaainSearch.getCard(objectID)
        //   .then(card => {
        //     self.allCards[objectID] = card
        //   })
        return card
      },
      setCard: function(objectID, card) {
        console.log('setCard', objectID, card)
        const self = this
        Vue.set(self.allCards, objectID, card) // Forces this to be watched
        this.$nextTick(function () {
          self.$redrawVueMasonry()
        })
      },
      setCardProperty: function(objectID, property, value) {
        const self = this
        const card = self.allCards[objectID]
        card[property] = value
        Vue.set(self.allCards, objectID, card) // Forces this to be watched - not yet working, at least with 'updating'
      },
      cardMouseoverFromPopup: function(card) {
        clearTimeout(this.popupCloseTimeout)
        clearTimeout(this.popupShowTimeout)
      },
      cardMouseover: function(card) {
        const self = this
        if (self.sidebar) {
          clearTimeout(self.popupCloseTimeout)
          clearTimeout(self.popupShowTimeout)
          if (self.popupClicked)
            self.popupShowTimeout = setTimeout(function () {
              self.popupClicked = false
              self.openPopup(card)
            }, 1000)
          else
            self.openPopup(card)
        }
      },
      cardMouseout: function () {
        if (this.sidebar) {
          this.closePopup()
        }
      },
      cardClickFromPopup: function(card) {
        this.cardClick(card, true)
      },
      cardClick: async function(card, fromPopup) {
        const self = this
        console.log('cardClick', card, fromPopup)
        self.popupClicked = true
        var openedCard = await self.openPopup(card, fromPopup)
        if (!openedCard) {
          console.log('Caught cardlet failing to open - opening parent card instead')
          if (card.parentCard && card.parentCard.objectID)
            openedCard = await self.openPopup(card.parentCard, fromPopup)
        }
        Mixpanel.track('Card Clicked', {
          organisationID: self.user.data.organisationID,
          userID: self.user.uid,
          cardID: openedCard.objectID,
          description: openedCard.description,
          title: openedCard.title,
          listItems: openedCard.listItems
        })
      },
      fileClick: function (card, file) {
        console.log('File Clicked', file)
        if (file && file.url) {
          console.log('Opening File', file)
          Mixpanel.track('File Opened', {
            organisationID: this.user.data.organisationID,
            userID: this.user.uid,
            cardID: card.objectID,
            description: card.description,
            title: card.title,
            listItems: card.listItems,
            fileTitle: card.fileTitle,
            fileUrl: card.fileUrl,
            fileType: card.fileType,
            fileFormat: card.fileFormat,
          })
          window.open(file.url, '_blank')
        }
      },
      popupBack: function() {
        this.popupCardList.pop()
      },
      popupClickaway: function(event) {
        console.log('popupClickaway', event)
        const self = this
        if (!this.sidebar) {
          self.closePopup()
        }
      },
      popupFrameClick: function () {
        console.log('popupFrameClick')
        const self = this
        if (this.sidebar) {
          self.closePopup(true)
          self.$emit('closeDrawer')
        } else {
          self.closePopup()
        }
      },
      openPopup: async function(c, append) {
        console.log('openPopup')
        clearTimeout(this.popupCloseTimeout)
        var card = null
        try {
          card = await this.fetchCard(c.objectID)
        } catch (e) {
          console.log(e)
        }
        // if (card.file) card.files = [card.file] // @TODO: Sort this out! Currently just a hack

        // if (c._highlightResult) {
        //   Object.keys(c._highlightResult).forEach(key => {
        //     console.log(key)
        //     if (key === 'fileTitle' && card.files && card.files.length)
        //       card.files[0].title = c._highlightResult[key].value
        //     else if (key === 'pendingContent')
        //       Object.keys(card.pendingContent).forEach(pcKey => {
        //         if (c._highlightResult.pendingContent[pcKey])
        //           card.pendingContent[pcKey] = c._highlightResult.pendingContent[pcKey].value
        //       })
        //     else if (key !== 'service')
        //       card[key === 'content' ? 'description' : key] = c._highlightResult[key].value
        //   })
        // }
        console.log('card', card)
        if (card) {
          if (append) {
            if (!this.popupCardList.length || this.popupCardList[this.popupCardList.length - 1] !== c.objectID)
              this.popupCardList.push(card.objectID)
          } else
            this.popupCardList = [card.objectID]
        }
        return card
      },
      closePopup: function(instantly) {
        console.log('closePopup')
        const self = this
        self.editing = false // This should be for every card so currently does nothing
        clearTimeout(self.popupCloseTimeout)
        if (this.sidebar && !instantly) {
          self.popupCloseTimeout = setTimeout(function () {
            self.popupClicked = false
            self.popupCardList = []
          }, 1000)
        } else {
          self.popupClicked = false
          this.popupCardList = []
        }
      },
      updateCards: function(data) {
        const self = this
        self.loading = false
        if (data && data.cards) {
          self.pingCards = data.cards.pings ? data.cards.pings.map(card => card.card) : []
          log.debug(1, self.pingCards)
          // self.cards = data.cards.memories
          self.mainCardList = data.cards.memories ? data.cards.memories.map(function(card) { return card.card.objectID }) : []
          log.debug(2, self.mainCardList)
          // Need to add to allCards?
          if (data.cards.memories) data.cards.memories.forEach(card => {
            self.allCards[card.card.objectID] = card.card
          })
          if (data.cards.hits) data.cards.hits.forEach(card => {
            self.allCards[card.card.objectID] = card.card
          })
          log.debug(3, self.allCards)
          self.noCardMessage = data.noCardMessage
        }
      },
      setLoading: function () {
        console.log('setLoading')
        this.loading = true
        this.pingCards = []
        this.mainCardList = []
      },
      closeSearch: function() {
        console.log('closing search!')
        this.query = ''
        this.lastQuery = ''
        this.mainCardList = []
        this.popupCardList = []
      },
      search: function (optionalQuery) {
        console.log('SEARCHSEARCHSEARCH')
        const self = this
        self.errorMessage = null
        self.setLoading()
        if (optionalQuery && typeof optionalQuery === 'string') self.query = optionalQuery
        self.lastQuery = self.query
        const query = self.query
        self.Controller.searchCards({
          user: self.user,
          query: self.query,
          numberOfResults: 12,
          searchStrategy: self.searchStrategy,
        }).then(function(hits) {
          console.log('hits')
          console.log(hits)
          Mixpanel.track('Searched', {
            organisationID: self.user.data.organisationID,
            userID: self.user.uid,
            searchQuery: query,
            noOfResults: hits.length,
            results: hits.map(hit => { return { objectID: hit.objectID, description: hit.description } })
          })
          self.loading = false
          self.pingCards = []
          // self.cards = hits
          self.mainCardList = hits.filter(card => {
            return card.fetched !== true
          }).map(card => card.objectID)
          self.noCardMessage = 'No cards found'
          hits.forEach(function(hit) {
            self.setCard(hit.objectID, hit)
          })
        }).catch(function(err) {
          console.log('err')
          console.log(err)
          self.errorMessage = 'Something went wrong - we couldn\'t connect to the database.'
          self.loading = false
        })
      },
      searchGoogle: function(optionalQuery) {
        const query = optionalQuery && typeof optionalQuery === 'string' ? optionalQuery : this.query
        window.open('https://www.google.com/search?q=' + query, '_parent')
      },
      createCard: function (service) {
        const card = {
          objectID: 'TEMP_' + Math.floor(Math.random() * 10000000000),
          intent: 'store',
          service: service || null,
          temporary: true,
          newlyCreated: true,
        }
        // Currently have to do this so that card properties are registered when the card format vue component is created - otherwise the editable-markdown doesn't update the content properties!
        switch (card.service) {
          case null:
            card.title = ''
            card.description = ''
            break
          case 'sifter':
            card.title = ''
            card.description = ''
            card.integrationFields = {}
            break
        }
        this.allCards[card.objectID] = card
        this.popupCardList = [card.objectID]
      },
      deleteCard: async function(objectID, callback) {
        const self = this
        if (confirm('Are you sure you want to delete this card?')) {
          const data = {
            sender: this.user.uid,
            organisationID: self.user.data.organisationID,
            objectID: objectID
          }
          console.log('data', data)
          const result = await self.Controller.deleteCard(data)
          console.log(result)
          if (result.success) {
            if (result.card) {
              self.allCards[objectID] = result.card
            } else {
              self.mainCardList = self.mainCardList.filter(cardID => cardID !== objectID)
              self.popupCardList = self.popupCardList.filter(cardID => cardID !== objectID)
              self.pingCards = self.pingCards.filter(card => card.objectID !== objectID)
            }
          }
          callback(result)
          return result
        } else {
          console.log('Decided against deleting!')
          callback(null)
          return null
        }
      },
      deleteAllCards: function () {
        console.log('Deleting all cards...!!!')
        const d = Q.defer()
        const self = this
        ExplaainSearch.searchCards(self.user, '', 1 /* 50 */) /* Have set this to be one at a time for now to avoid BAD THINGS */
        .then(function(hits) {
          const promises = hits.map(function(card) {
            return self.deleteCard(card.objectID)
          })
          console.log(promises)
          Q.allSettled(promises)
          .then(function () {
            console.log('hihihihihihi')
            d.resolve()
          }).catch(function(e) {
            d.reject(e)
          })
        }).catch(function(e) {
          console.log(e)
          d.reject(e)
        })
        return d.promise
      },
      updateCard: async function(data, callback, errorCallback) {
        console.log('updateCard', data, callback, errorCallback)
        const self = this
        if (data && data.listCards && data.listCards.length) {
          data.listCards.forEach(async (listCard, index) => {
            if (!listCard.objectID || listCard.objectID.indexOf('TEMP') === 0) {
              if (listCard.objectID) delete listCard.objectID
              listCard.intent = 'store'
              listCard.sender = self.user.uid
            }
            console.log('hi')
            const savedListCard = self.saveCard(listCard)
            data.listItems[index] = savedListCard.objectID // In case it was a new listCard. This also relies on the index still being correct after the asynchronous delay
          })
        }
        try {
          const result = await self.saveCard(data)
          callback(result)
          return result
        } catch (e) {
          console.log(e)
          errorCallback(e)
          return null
        }
      },
      saveCard: async function(data) {
        const self = this
        if (data && data.listCards) delete data.listCards
        const objectID = data.objectID
        if (data.temporary) {
          delete data.objectID
          delete data.temporary
        }
        if (data._highlightResult) delete data._highlightResult
        console.log('data to send with saveCard()', data)
        try {
          const result = await self.Controller.saveCard(data)
          if (result.success) {
            const returnedCard = result.card
            console.log('returnedCard', returnedCard)
            data.objectID = returnedCard.objectID
            self.setCard(returnedCard.objectID, returnedCard)
            self.popupCardList = JSON.parse(JSON.stringify(self.popupCardList))
            self.popupCardList = self.popupCardList.map(id => id === objectID ? returnedCard.objectID : id)
            // // @TODO: Delete the next line
            // if (self.popupCardList.length === 1) self.popupCardList = [returnedCard.objectID] // @TODO: This is a hack because popupCardList isn't synced with allCards!
          } else {
            console.log(result.error && result.error.message)
            if (result.error && result.error.message === 'Network Error') {
              // @TODO: ??
            }
          }
          return result

          // self.setCardProperty(returnedCard.objectID, 'objectID', returnedCard.objectID) // In case it was a new data
          // self.setCardProperty(returnedCard.objectID, 'updating', false)
        } catch (e) {
          console.error(e)
          return null
        }
      },
      verifyCard: async function(data, callback, errorCallback) {
        console.log('data to send with saveCard()', data)
        const self = this
        const objectID = data.objectID
        try {
          const result = await self.Controller.verifyCard(data)
          if (result.success) {
            const returnedCard = result.card
            console.log('returnedCard', returnedCard)
            self.setCard(returnedCard.objectID, returnedCard)
            self.popupCardList = JSON.parse(JSON.stringify(self.popupCardList))
            self.popupCardList = self.popupCardList.map(id => id === objectID ? returnedCard.objectID : id)
            callback(result)
            // // @TODO: Delete the next line
            // if (self.popupCardList.length === 1) self.popupCardList = [returnedCard.objectID] // @TODO: This is a hack because popupCardList isn't synced with allCards!
          } else {
            console.log(result.error && result.error.message)
            if (result.error && result.error.message === 'Network Error') {
              // @TODO: ??
            }
            errorCallback(result)
          }
          return result

          // self.setCardProperty(returnedCard.objectID, 'objectID', returnedCard.objectID) // In case it was a new data
          // self.setCardProperty(returnedCard.objectID, 'updating', false)
        } catch (e) {
          console.error(e)
          return null
        }
      },
      modalCallback: function(message) {
        const self = this
        this.showAlert('success', 2000, message || 'Success! Update made.')
        const query = this.lastQuery
        setTimeout(function () {
          self.query = query
          self.search()
        }, 1000)
      },
      copyAlert: function () {
        this.showAlert('success', 2000, 'Copied to clipboard!')
      },
      showAlert: function(type, duration, title) {
        self.alertData = {
          show: true,
          type: type,
          title: title
        }
        setTimeout(function () {
          self.alertData.show = false
        }, duration)
      },
      reaction: function(data) {
        console.log('Reacting!')
        const self = this
        Mixpanel.track('User Reacted to Card', {
          organisationID: self.user.data.organisationID,
          userID: self.user.uid,
          reaction: data.reaction,
          cardID: data.card.objectID,
          description: data.card.description,
          listItems: data.card.listItems,
          files: data.card.files.map(file => { return { id: file.objectID, title: file.title } }),
          searchQuery: self.query
        })
      }
    }
  }
</script>

<style lang="scss">

  @import '../../styles/main.scss';

  body {
    @extend .defaultFont;
    pointer-events: none;
  }
  body div:not(.popup), body button {
    pointer-events: all;
  }

  .create-button {
    position: absolute;
    right: 60px;
    top: 0;
  }

  .loader-text {
    font-size: 30px;
    font-weight: bold;
    color: #999;
    margin-bottom: 20px;
  }
  .loader-card-text {
    font-size: 24px;
    margin-top: 20px;
  }

  .loader {
    position: relative;
    margin: 30px auto;
    height: 60px;
    max-width: 500px;
    width: calc(100% - 100px);
    background: #ddd;

    > div {
      height: 100%;
      background: #ffd51c;
    }
  }

  .explorer {
    > .main-explorer {
      // position: absolute;
      z-index: 1;
      pointer-events: all;
      background: $background;
      overflow: scroll;
      -webkit-overflow-scrolling: touch;

      // &.mouseover {
      //   overflow: scroll;
      // }
      .spinner {
        margin: 0 30px;
      }
      .search {
        margin: 180px auto 20px;
        // width: calc(100% - 77px);
        transition: margin .5s, max-width .5s;
        max-width: 740px;
        width: calc(100% - 40px);

        .header {
          text-align: center;
          padding: 20px;
        }

        .greeting h3 {
          margin: -40px 20px 30px;
          font-size: 40px;
          color: #999;
          transition: opacity .5s, font-size .5s;

          span {
            color: $savvy;
          }
        }
        input {
          @include blockShadow(2);
          margin: 0;
          width: calc(100% - 100px);
          box-sizing: border-box;
          padding: 20px 40px 20px 45px;
          font-size: 18px;
          background: url('/static/images/search-icon-1.png'); // //static//
          background-repeat: no-repeat;
          background-position: center left;
          background-size: 40px;
          background-color: white;
          transition: padding .5s, box-shadow .5s, filter .5s, width .5s, margin .5s;
        }
        .search-options {
          text-align: right;
          margin-right: 50px;
          transition: margin-right .5s;

          > label.hint {
            font-size: 13px;
            opacity: 1;
            margin-top: 10px;
            font-style: italic;
            color: #aaa;
            transition: font-size .5s, opacity .5s;
          }
          .search-strategy-buttons {
            display: inline-block;

            .btn-group-toggle.btn-group {
              margin-right: 0;

              label {
                font-size: 13px;
                display: inline-block;
                margin: 0;
                font-style: normal;
                padding: 5px 15px;
              }
            }
          }
        }
      }
      input:focus {
        outline:none;
      }
      .closeSearch {
        display: inline-block;
        position: absolute;
        margin: 13px 4px;
        right: calc(50% - 192px);
        top: auto;
        pointer-events: none;
        opacity: 0;
        // transition: opacity .5s;
        color: #999;
        z-index: 1000;
      }
      &.search-results {
        .search {
          margin-top: 10px;
          max-width: 400px;

          .greeting {
            pointer-events: none;

            h3 {
              opacity: 0;
              font-size: 28px;
              transition: margin .5s;
            }
          }
          input {
            width: 100%;
            padding-top: 10px;
            padding-bottom: 10px;
            @include blockShadow(0.5);
            filter: grayscale(100%);
          }
          .closeSearch {
            pointer-events: all;
            opacity: 1;
            cursor: pointer;

            &:hover {
              color: $savvy;
            }
          }
          .search-options {
            margin-right: 0;

            label.hint {
              font-size: 1px;
              opacity: 0;
            }
          }
        }
      }
    }
    > .popup {
      position: fixed;
      z-index: 100;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 180px 0 60px;
      text-align: center;
      pointer-events: none;

      &.active {
        pointer-events: all;
        overflow: scroll;
        -webkit-overflow-scrolling: touch;
      }

      > .cards {
        pointer-events: none;
      }
      .popup-back {
        text-align: left; width: 100%; max-width: 380px; margin: 5px auto;
        cursor: pointer;

        &:hover {
          color: $savvy;
        }
        .name {
          font-weight: bold;
        }
      }
      .card {
        pointer-events: all;
        // width: auto;
      }
    }

  }





  input, textarea, button {
    // padding: 10px 20px;
    // font-size: 16px;
    // border-radius: 5px;
    // margin: 10px 5px;
    // border: 1px solid #ddd;
  }

  input, .card {
    text-align: left;
  }
  p.results-label {
    margin: 0 25px 0;
    text-align: left;
    font-style: italic;
    color: #999;
  }

  p.cards-label {
    font-weight: bold;
    margin: 20px 20px 0px;
  }


  .cards {
    margin: 0;
    padding: 15px;
    text-align: center;
  }

  .no-cards {
    p {
      text-align: center;
      margin: 50px 20px;
      color: #bbb;
      font-style: italic;
    }
    img {
      width: calc(100% - 80px);
      max-width: 300px;
    }
    .search-suggestions {
      // position: relative;
      float: right;
      margin: auto;
      // margin-top: -40px;
      // margin-bottom: -110px;
      margin-left: -250px;
      margin-top: 10px;
      z-index: 100;
      width: 50%;

      p {
        margin: 20px;
        font-size: 18px;
        text-align: left;
        color: #999;

        &:first-child {
          font-size: 20px;
          font-weight: bold;
        }
      }
    }
  }

  .explorer.sidebar {
    .search-results .search {
      margin-top: 80px;
    }
    > .main-explorer {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      right: 0;


      .header > button {
        margin: 10px 2px;
      }

      .greeting h3 {
        pointer-events: none;
        display: none;
      }
    }
    > .popup {
      right: 50%;
      pointer-events: all;

      > .cards {
        pointer-events: all;
      }
    }
  }

  .explorer:not(.sidebar) {
    .no-cards {
      img {
        opacity: 0.6;
      }
    }
    > .main-explorer {
      // width: calc(100% - 20px);
    }
    > .popup.active {
      background: rgba(0,0,0,0.2);
    }
  }
  @media (max-width: 538px) {
    .search .closeSearch {
      right: 78px;
    }
  }
  @media (max-width: 800px) {
    .explorer.sidebar .search {
      input {
        width: calc(100% - 20px)
      }
      .closeSearch {
        right: 46px;
      }
    }
    .explorer .search {
      margin-top: 160px;
    }
    .no-cards .search-suggestions {
      float: none;
      width: auto;
      margin: 20px;
      p {
        text-align: center;
      }
    }
    .search {
      .greeting h3 {
        font-size: 30px;
      }
      input {
        width: 100%;
      }
    }
    .search-results {
      .search .greeting h3 {
        margin: 0;
      }
    }
  }
  .main-explorer.demo.search-results {
    .search {
      margin-top: 30px;
    }
  }
</style>
