<template lang="html">
  <div class="explorer" v-bind:class="{sidebar: sidebar}">
    <div uid="main" class="main" @mouseover="overMain = true" @mouseout="overMain = false" :class="{mouseover : overMain, 'search-results': cards.length}">
      <div class="create-button">
        <b-dropdown id="ddown1" text="➕ Create" variant="default" class="m-md-2">
          <b-dropdown-item @click="createCard">🔖 New Card</b-dropdown-item>
          <b-dropdown-item @click="createCard('sifter')">🐞 New Bug</b-dropdown-item>
        </b-dropdown>
      </div>
      <alert :show="alertData.show" :type="alertData.type" :title="alertData.title"></alert>
      <modal v-if="modal.show" @close="modal.show = false" @submit="modal.submit" :data="modal"></modal>
      <div class="header" v-if="!$route.query.q">
        <slot name="header"></slot>
        <!-- <ibutton icon="history" text="" :click="searchRecent"></ibutton> -->
        <div class="search">
          <slot name="greeting"></slot>
          <input autofocus type="text" :placeholder="searchPlaceholder" v-model="query" @keyup.enter="search">
          <a href="#" class="closeSearch" @click="closeSearch"><icon name="close"></icon></a>
        </div>
        <slot name="buttons"></slot>
        <ibutton v-if="local" icon="code" text="Local" :click="searchTempLocal"></ibutton>
        <!-- <ibutton icon="random" text="Random" :click="searchRandom"></ibutton> -->
        <!-- <ibutton icon="plus" text="Create" :click="createCard"></ibutton> -->
      </div>
      <h2 v-if="$route.query.q">Your search results for "{{query}}":</h2>
      <p class="results-label" v-if="cards.length && !$route.query.q">Your search results for "{{lastQuery}}":</p>

      <ul v-masonry transition-duration="0.3s" item-selector=".card" class="cards">
        <p class="spinner" v-if="loading && loader == -1"><icon name="refresh" class="fa-spin fa-3x"></icon></p>
        <p class="loader-text" v-if="loader != -1">Importing and processing content...</p>
        <div class="loader" v-if="loader != -1"><div :style="{ width: loader + '%' }"></div></div>
        <p class="loader-card-text" v-if="loader != -1">{{loaderCards}} cards generated</p>
        <p class="cards-label" v-if="pingCards.length">Match to content on the page 🙌</p>
        <card v-masonry-tile v-for="(card, index) in pingCards" :plugin="plugin" @cardMouseover="cardMouseover" @cardMouseout="cardMouseout" @cardClick="cardClick" @updateCard="updateCard" @deleteCard="beginDelete" @reaction="reaction" :data="card" :key="card.objectID" :full="false" :allCards="allCards" :setCard="setCard" :auth="auth" @copy="copyAlert"></card>
        <p class="cards-label" v-if="pingCards.length && cards.length">Other potentially relevant information:</p>
        <card v-masonry-tile v-for="(card, index) in cards" :plugin="plugin" @cardMouseover="cardMouseover" @cardMouseout="cardMouseout" @cardClick="cardClick" @updateCard="updateCard" @deleteCard="beginDelete" @reaction="reaction" :data="card" :key="card.objectID" :full="false" :allCards="allCards" :setCard="setCard" :auth="auth" @copy="copyAlert"></card>
        <div class="no-cards" v-if="!cards.length">
          <p v-if="lastQuery.length">{{noCardMessage}}</p>
          <img src="/static/images/search-graphic.png" alt=""> <!-- //static// -->
        </div>
      </ul>
    </div>
    <div class="popup" v-bind:class="{ active: popupCards.length }" @click.self="popupFrameClick">
      <ul @click.self="popupFrameClick" class="cards">
        <p class="spinner" v-if="popupLoading"><icon name="spinner" class="fa-spin fa-3x"></icon></p>
        <div class="popup-back" v-if="popupCards.length > 1" @click="popupBack"  @mouseover="cardMouseoverFromPopup"><icon name="arrow-left"></icon> Back to "<span class="name">{{(popupCards[popupCards.length - 2].content.title || popupCards[popupCards.length - 2].content.description || '').substring(0, 30)}}...</span>"</div>
        <card v-if="popupCards.length" :plugin="plugin" @cardMouseover="cardMouseoverFromPopup" @cardMouseout="cardMouseout" @cardClick="cardClickFromPopup" @updateCard="updateCard" @deleteCard="beginDelete" @reaction="reaction" :data="popupCards ? popupCards[popupCards.length - 1] : {}" :full="true" :allCards="allCards" :setCard="setCard" :auth="auth" @copy="copyAlert"></card>
      </ul>
    </div>
  </div>
</template>



<script>
  import Vue from 'vue'
  import log from 'loglevel'
  import Q from 'q'
  import Draggable from 'vuedraggable'
  import 'vue-awesome/icons'
  import Icon from 'vue-awesome/components/Icon.vue'
  import BootstrapVue from 'bootstrap-vue'
  import Mixpanel from 'mixpanel-browser'
  import {VueMasonryPlugin} from 'vue-masonry'
  import Card from './card.vue'
  import IconButton from './ibutton.vue'
  import Modal from './modal.vue'
  import Alert from './alert.vue'
  import ExplaainSearch from '../../plugins/explaain-search.js'
  import ExplaainAuthor from '../../plugins/explaain-author.js'
  // import SavvyImport from '../../plugins/savvy-import.js'

  export default {
    components: {
      Card,
      Icon,
      ibutton: IconButton,
      BootstrapVue,
      Modal,
      Alert,
      Draggable
    },
    props: [
      'plugin',
      'organisation',
      'auth',
      'logo',
      'firebaseConfig',
      'algoliaParams',
      'authorParams',
      'sidebar',
      'local',
      'testing'
    ],
    data () {
      return {
        pageCards: [],
        allCards: {},
        mainCardList: [],
        pingCards: [],
        popupCards: [],
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
        noCardMessage: '' // 'Type above to search for cards',
      }
    },
    computed: {
      cards: function () {
        const self = this
        const watchThis = self.allCards // This does nothing other than force this function to watch for changes in self.allCards
        console.log(watchThis)
        return self.mainCardList ? self.mainCardList.map(function(objectID) {
          return self.allCards[objectID] || { content: { description: 'Card Not Found' } }
        }) : []
      },
      searchPlaceholder: function() {
        return document.documentElement.clientWidth > 850 ? 'Find anything (like holiday pay, product specs and brand colours)' : 'Find anything...'
      }
    },
    created: function () {
      console.log('Starting Explorer')
      const self = this
      Vue.use(VueMasonryPlugin)
      console.log('self.algoliaParams', self.algoliaParams)
      console.log('self.auth', self.auth)
      console.log('self.auth.user', self.auth.user)
      self.auth.user.organisation = self.organisation
      Vue.use(BootstrapVue)
      Vue.use(ExplaainSearch, self.algoliaParams, self.auth.user)
      self.authorParams.plugin = self.plugin
      Vue.use(ExplaainAuthor, self.authorParams)

      // Vue.use(SavvyImport)
      self.modal.sender = self.auth.user.uid
      self.modal.callback = self.modalCallback
      self.$parent.$on('updateCards', self.updateCards)
      self.$parent.$on('getCard', self.getCard)
      self.$parent.$on('setLoading', self.setLoading)
      self.$parent.$on('closingDrawer', function() {
        self.closePopup(true)
      })
      self.$parent.$on('search', function(query) {
        self.search(self.$route.query.q)
        console.log('SEARCHSEARCHSEARCHSEARCHSEARCHSEARCHSEARCHSEARCHSEARCH')
      })
      // SavvyImport.beginImport()
      Mixpanel.init('e3b4939c1ae819d65712679199dfce7e', { api_host: 'https://api.mixpanel.com' })
      setTimeout(() => {
        console.log('SEARCHSEARCHSEARCHSEARCHSEARCH')
        if (self.$route.query.q)
          self.search(self.$route.query.q)
        // else if (!self.sidebar)
        //   self.searchRecent()
      }, 200)
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
        const self = this
        Vue.set(self.allCards, objectID, card) // Forces this to be watched
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
      cardClick: function(card, fromPopup) {
        const self = this
        setTimeout(function () { // Is this timeout stil necessary?
          self.popupClicked = true
          self.openPopup(card, fromPopup)
          Mixpanel.track('Card Clicked', {
            organisationID: self.organisation.id,
            userID: self.auth.user.uid,
            cardID: card.objectID,
            description: card.content.description,
            listItems: card.content.listItems
          })
        }, 1)
      },
      popupBack: function() {
        this.popupCards.pop()
      },
      popupClickaway: function(event) {
        const self = this
        if (!this.sidebar) {
          self.closePopup()
        }
      },
      popupFrameClick: function () {
        const self = this
        console.log('popupFrameClick')
        if (this.sidebar) {
          self.closePopup(true)
          self.$emit('closeDrawer')
        } else {
          self.closePopup()
        }
      },
      openPopup: function(c, append) {
        console.log('openPopup')
        ExplaainSearch.getCard(c.objectID)
        .then(card => {
          console.log('ccccc', c)
          card.files = [card.file] // @TODO: Sort this out! Currently just a hack
          if (c._highlightResult) {
            Object.keys(c._highlightResult).forEach(key => {
              console.log(key)
              if (key === 'fileTitle' && card.files && card.files.length)
                card.files[0].title = c._highlightResult[key].value
              else
                card.content[key === 'content' ? 'description' : key] = c._highlightResult[key].value
            })
          }
          console.log('card', card)
          if (append) {
            if (!this.popupCards.length || this.popupCards[this.popupCards.length - 1].objectID !== c.objectID)
              this.popupCards.push(card)
          } else
            this.popupCards = [card]
        })
        clearTimeout(this.popupCloseTimeout)
      },
      closePopup: function(instantly) {
        console.log('closePopup')
        const self = this
        self.editing = false // This should be for every card so currently does nothing
        clearTimeout(self.popupCloseTimeout)
        if (this.sidebar && !instantly) {
          self.popupCloseTimeout = setTimeout(function () {
            self.popupClicked = false
            self.popupCards = []
          }, 1000)
        } else {
          self.popupClicked = false
          this.popupCards = []
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
        this.loading = true
        this.pingCards = []
        this.mainCardList = []
      },
      closeSearch: function() {
        console.log('closing search!')
        this.query = ''
        this.lastQuery = ''
        this.mainCardList = []
        this.popupCards = []
      },
      search: function (optionalQuery) {
        console.log('SEARCHSEARCHSEARCH')
        const self = this
        self.setLoading()
        if (optionalQuery && typeof optionalQuery === 'string') self.query = optionalQuery
        self.lastQuery = self.query
        const query = self.query
        ExplaainSearch.searchCards(self.auth.user, self.query, 12, true)
        .then(function(hits) {
          Mixpanel.track('Searched', {
            organisationID: self.organisation.id,
            userID: self.auth.user.uid,
            searchQuery: query,
            noOfResults: hits.length,
            results: hits.map(hit => { return { objectID: hit.objectID, description: hit.content.description } })
          })
          self.loading = false
          self.pingCards = []
          // self.cards = hits
          self.mainCardList = hits.filter(card => {
            return card.fetched !== true
          }).map(function(card) { return card.objectID })
          self.noCardMessage = 'No cards found'
          hits.forEach(function(hit) {
            self.setCard(hit.objectID, hit)
          })
        }).catch(function(err) {
          console.log(err)
        })
      },
      searchRecent: function () {
        const self = this
        self.setLoading()
        log.debug(self.auth)
        ExplaainSearch.searchCards(self.auth.user, '', 24, false)
        .then(function(hits) {
          Mixpanel.track('Recently Searched', {
            organisationID: self.organisation.id,
            userID: self.auth.user.uid
          })
          self.loading = false
          console.log('hits')
          console.log(hits)
          self.pingCards = []
          // self.cards = hits
          self.mainCardList = hits.filter(card => {
            return card.fetched !== true
          }).map(function(card) { return card.objectID })
          self.noCardMessage = 'No recent cards found'
          hits.forEach(function(hit) {
            self.setCard(hit.objectID, hit)
          })
        }).catch(function(err) {
          console.log(err)
        })
      },
      searchRandom: function () {
        const self = this
        self.setLoading()
        log.debug(self.auth)
        var hits = []
        const randomQuery = () => Math.random().toString(36).substring(7).substring(0, 1)
        const params = {
          restrictSearchableAttributes: [
            'title',
            'content'
          ]
        }
        const promises = Array.apply(null, Array(4)).map(x => ExplaainSearch.searchCards(self.auth.user, randomQuery(), 10, false, params))
        console.log(promises)
        Promise.all(promises)
        .then(function(samplesOfHits) {
          hits = [].concat.apply([], samplesOfHits)
          hits = hits.filter(hit => hit.content.description.length > 10)
          shuffleArray(hits)
          console.log('hits')
          console.log(hits)
          self.loading = false
          self.pingCards = []
          // self.cards = hits
          self.mainCardList = hits.filter(card => {
            return card.fetched !== true
          }).map(function(card) { return card.objectID })
          self.noCardMessage = 'No recent cards found'
          hits.forEach(function(hit) {
            self.setCard(hit.objectID, hit)
          })
        }).catch(function(err) {
          console.log(err)
        })
      },
      searchTempLocal: function () {
        const self = this
        const hits = [{'intent': 'storeMemory', 'sender': '1627888800569309', 'listItems': ['620064670', '620064680', '620064690', '620064700'], 'hasAttachments': false, 'dateUpdated': 1508426117869, 'objectID': '619948630', 'description': 'Inject Meeting Notes'}, {'intent': 'storeMemory', 'sender': '1627888800569309', 'hasAttachments': false, 'dateUpdated': 1508426117257, 'objectID': '620064700', 'description': 'Keep all signed timesheets and receipts'}, {'intent': 'storeMemory', 'sender': '1627888800569309', 'hasAttachments': false, 'dateUpdated': 1508426117225, 'objectID': '620064690', 'description': 'Business model => pro version only'}, {'intent': 'storeMemory', 'sender': '1627888800569309', 'hasAttachments': false, 'dateUpdated': 1508426117152, 'objectID': '620064680', 'description': 'Languages'}, {'intent': 'storeMemory', 'sender': '1627888800569309', 'hasAttachments': false, 'dateUpdated': 1508426116967, 'objectID': '620064670', 'description': 'Finish card creation & editing'}, {'intent': 'storeMemory', 'sender': '1627888800569309', 'hasAttachments': false, 'dateCreated': 1508425700874, 'dateUpdated': 1508425700874, 'objectID': '651610261', 'description': 'Asdf'}, {'intent': 'storeMemory', 'sender': '1627888800569309', 'listItems': ['645331361', '610938240', '610473050'], 'hasAttachments': false, 'dateUpdated': 1508421510702, 'objectID': '639442471', 'description': 'Here is a list'}, {'intent': 'storeMemory', 'sender': '1627888800569309', 'hasAttachments': false, 'dateUpdated': 1508421509549, 'objectID': '610938240', 'description': 'This is a brand new list'}, {'intent': 'storeMemory', 'sender': '1627888800569309', 'hasAttachments': false, 'dateUpdated': 1508421508835, 'objectID': '645331361', 'description': 'A serious item'}, {'intent': 'storeMemory', 'sender': '1627888800569309', 'hasAttachments': false, 'dateUpdated': 1508421508588, 'objectID': '610473050', 'description': 'Another list item'}]
        // self.cards = hits
        self.mainCardList = hits.map(function(card) { return card.objectID })
        self.noCardMessage = 'No recent cards found'
        hits.forEach(function(hit) {
          self.setCard(hit.objectID, hit)
        })
      },
      // beginCreate: function () {
      //   this.modal.sender = this.auth.user.uid
      //   this.modal.show = true
      //   console.log(222)
      //   this.modal.submit = this.saveCard
      //   // .then(function () {
      //   //   console.log(333)
      //   // })
      //   delete this.modal.objectID
      //   this.modal.text = ''
      // },
      createCard: function (service) {
        const card = {
          // objectID: 'TEMP_' + Math.floor(Math.random() * 10000000000),
          intent: 'store',
          content: {
            description: '',
          },
          newlyCreated: true,
          service: service || null
        }
        // this.allCards[card.objectID] = card
        this.popupCards = [card]
      },
      beginDelete: function(objectID) {
        const self = this
        self.closePopup()
        self.deleteCard(objectID)
        .then(function () {
          self.mainCardList.forEach(function(cardID, i) { // temporary - doesn't check to see whether it's actually been deleted!
            if (cardID === objectID) {
              self.cards.splice(i, 1)
            }
          })
          self.pingCards.forEach(function(card, i) { // temporary - doesn't check to see whether it's actually been deleted!
            if (card.objectID === objectID) {
              self.pingCards.splice(i, 1)
            }
          })
        })
      },
      deleteCard: function(objectID) {
        const self = this
        const d = Q.defer()
        const data = {
          sender: this.auth.user.uid,
          organisationID: self.organisation.id,
          objectID: objectID
        }
        ExplaainAuthor.deleteCard(data)
        .then(function () {
          d.resolve()
        }).catch(function(e) {
          console.log(e)
          d.reject(e)
        })
        return d.promise
      },
      deleteAllCards: function () {
        console.log('Deleting all cards...!!!')
        const d = Q.defer()
        const self = this
        ExplaainSearch.searchCards(self.auth.user, '', 1 /* 50 */, false) /* Have set this to be one at a time for now to avoid BAD THINGS */
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
      updateCard: function(data, callback, errorCallback) {
        const self = this
        const promises = []
        if (data.content && data.content.listCards && data.content.listCards.length) {
          data.content.listCards.forEach(function(listCard, index) {
            const p = Q.defer()
            if (!listCard.objectID || listCard.objectID.indexOf('TEMP') === 0) {
              if (listCard.objectID) delete listCard.objectID
              listCard.intent = 'store'
              listCard.sender = self.auth.user.uid
            }
            console.log('hi')
            self.saveCard(listCard)
            .then(function(savedListCard) {
              data.content.listItems[index] = savedListCard.objectID // In case it was a new listCard. This also relies on the index still being correct after the asynchronous delay
              p.resolve()
            }).catch(function(e) {
              p.reject(e)
            })
            promises.push(p.promise)
          })
        }
        console.log('hello')
        Q.allSettled(promises)
        .then(function () {
          self.saveCard(data)
          callback()
        }).catch(function(e) {
          console.log(e)
          errorCallback(e)
        })
      },
      saveCard: function(data) {
        const d = Q.defer()
        const self = this
        if (data.content && data.content.listCards) delete data.content.listCards
        if (data.newlyCreated) delete data.newlyCreated
        if (self.getCard(data.objectID)) self.setCardProperty(data.objectID, 'updating', true)
        console.log(self.auth.user)
        // Should use self.auth.user.refreshUserToken() here!
        data.sender = { uid: self.auth.user.uid, algoliaApiKey: self.auth.user.data.algoliaApiKey, idToken: self.auth.user.getAccessToken() || self.auth.user.auth.stsTokenManager.accessToken } // Ideally we should get getAccessToken() working on chrome extension so we don't need this backup option!
        data.organisationID = self.organisation.id
        ExplaainAuthor.saveCard(data)
        .then(function(res) {
          console.log(res)
          const returnedCard = res.data.memories[0]
          data.objectID = returnedCard.objectID
          data.updating = false
          self.setCard(returnedCard.objectID, data)
          // self.setCardProperty(returnedCard.objectID, 'objectID', returnedCard.objectID) // In case it was a new data
          // self.setCardProperty(returnedCard.objectID, 'updating', false)
          d.resolve(data)
        }).catch(function(e) {
          console.error(e)
          d.reject(e)
        })
        console.log('yo1')
        return d.promise
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
          organisationID: self.organisation.id,
          userID: self.auth.user.uid,
          reaction: data.reaction,
          cardID: data.card.objectID,
          description: data.card.content.description,
          listItems: data.card.content.listItems,
          files: data.card.files.map(file => { return { id: file.objectID, title: file.title } }),
          searchQuery: self.query
        })
      }
    }
  }

  /**
   * Randomize array element order in-place.
   * Using Durstenfeld shuffle algorithm.
   */
  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1))
      var temp = array[i]
      array[i] = array[j]
      array[j] = temp
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

  .spinner {
    margin: 60px auto;
    text-align: center;
    font-size: 40px;

    svg {
      width: auto;
      height: 1em;
      /* The following two lines make this work in Safari */
      max-width: 100%;
      max-height: 100%;
    }
  }

  .header {
    text-align: center;
    padding: 20px;
  }

  .explorer {
    > .main {
      // position: absolute;
      z-index: 1;
      pointer-events: all;
      background: $background;
      overflow: hidden;

      &.mouseover {
        overflow: scroll;
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
  .search {
    margin: 180px auto 20px;
    // width: calc(100% - 77px);
    transition: margin .5s;

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
      max-width: 600px;
      margin: 0;
      padding: 20px 20px 20px 45px;
      font-size: 18px;
      background: url('/static/images/search-icon-1.png'); // //static//
      background-repeat: no-repeat;
      background-position: center left;
      background-size: 40px;
      background-color: white;
      width: calc(100% - 67px);
      transition: padding .5s, box-shadow .5s, filter .5s, max-width .5s;
    }
  }
  input:focus {
    outline:none;
  }
  .closeSearch {
    display: inline-block;
    position: absolute;
    right: 35px;
    top: auto;
    margin-top: -31px;
    pointer-events: none;
    opacity: 0;
    transition: opacity .5s;
    color: #999;
  }
  .search-results {
    .search {
      margin-top: 60px;

      .greeting {
        pointer-events: none;
        
        h3 {
          opacity: 0;
          font-size: 28px;
        }
      }
      input {
        max-width: 400px;
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
    }
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
  }

  .explorer.sidebar {
    > .main {
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
    }
  }

  .explorer:not(.sidebar) {
    .search .closeSearch {
      position: relative;
      top: -1px;
      right: 32px;
    }
    .no-cards {
      img {
        opacity: 0.6;
      }
    }
    > .main {
      // width: calc(100% - 20px);
    }
    > .popup.active {
      background: rgba(0,0,0,0.2);
    }
  }
</style>
