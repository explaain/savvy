<template lang="html">
  <div class="explorer" v-bind:class="{sidebar: sidebar}">
    <div uid="main" class="main">
      <alert :show="alertData.show" :type="alertData.type" :title="alertData.title"></alert>
      <modal v-if="modal.show" @close="modal.show = false" @submit="modal.submit" :data="modal"></modal>
      <div class="header">
        <slot name="header"></slot>
        <input autofocus type="text" placeholder="Search for cards..." v-model="query" @keyup.enter="search"><br>
        <slot name="buttons"></slot>
        <ibutton v-if="local" icon="code" text="Local" :click="searchTempLocal"></ibutton>
        <ibutton icon="history" text="Recent" :click="searchRecent"></ibutton>
        <ibutton icon="plus" text="Create" :click="beginCreate"></ibutton>
      </div>

      <ul class="cards">
        <p class="spinner" v-if="loading && loader == -1"><icon name="refresh" class="fa-spin fa-3x"></icon></p>
        <p class="loader-text" v-if="loader != -1">Importing and processing content...</p>
        <div class="loader" v-if="loader != -1"><div :style="{ width: loader + '%' }"></div></div>
        <p class="loader-card-text" v-if="loader != -1">{{loaderCards}} cards generated</p>
        <p class="cards-label" v-if="pingCards.length">Match to content on the page 🙌</p>
        <card v-for="card in pingCards" @cardMouseover="cardMouseover" @cardMouseout="cardMouseout" @cardClick="cardClick" @updateCard="updateCard" @deleteCard="beginDelete" :data="card" :key="card.objectID" :full="false" :allCards="allCards" :setCard="setCard" :getUser="getUser" @copy="copyAlert"></card>
        <p class="cards-label" v-if="pingCards.length && cards.length">Other potentially relevant information:</p>
        <card v-for="card in cards" @cardMouseover="cardMouseover" @cardMouseout="cardMouseout" @cardClick="cardClick" @updateCard="updateCard" @deleteCard="beginDelete" :data="card" :key="card.objectID" :full="false" :allCards="allCards" :setCard="setCard" :getUser="getUser" @copy="copyAlert"></card>
        <p class="no-cards" v-if="!cards.length">{{noCardMessage}}</p>
      </ul>
    </div>
    <div class="popup" v-bind:class="{ active: popupCards.length }" @click.self="popupFrameClick">
      <ul @click.self="popupFrameClick" class="cards">
        <p class="spinner" v-if="popupLoading"><icon name="spinner" class="fa-spin fa-3x"></icon></p>
        <card v-for="card in popupCards" @cardMouseover="cardMouseover" @cardMouseout="cardMouseout" @cardClick="cardClick" @updateCard="updateCard" @deleteCard="beginDelete" :data="card" :key="card.objectID" :full="true" :allCards="allCards" :setCard="setCard" :getUser="getUser" @copy="copyAlert"></card>
      </ul>
    </div>
  </div>
</template>



<script>
  import Vue from 'vue'
  import Q from 'q'
  import Draggable from 'vuedraggable'
  import 'vue-awesome/icons'
  import Icon from 'vue-awesome/components/Icon.vue'
  import Card from './card.vue'
  import IconButton from './ibutton.vue'
  import Modal from './modal.vue'
  import Alert from './alert.vue'
  import ExplaainSearch from '../../plugins/explaain-search.js'
  import ExplaainAuthor from '../../plugins/explaain-author.js'
  // import SavvyImport from '../../plugins/savvy-import.js'

  export default {
    props: [
      'organisation',
      'getUser',
      'logo',
      'firebaseConfig',
      'algoliaParams',
      'authorParams',
      'sidebar',
      'local'
    ],
    data () {
      return {
        pageCards: [],
        allCards: {},
        mainCardList: [],
        pingCards: [],
        popupCards: [],
        popupTimeout: null,
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
        noCardMessage: 'Type above to search for cards',
      }
    },
    computed: {
      cards: function () {
        const self = this
        const watchThis = self.allCards // This does nothing other than force this function to watch for changes in self.allCards
        console.log(watchThis)
        return self.mainCardList ? self.mainCardList.map(function(objectID) {
          return self.allCards[objectID] || { description: 'Card Not Found' }
        }) : []
      }
    },
    created: function () {
      Vue.use(ExplaainSearch, this.algoliaParams)
      Vue.use(ExplaainAuthor, this.authorParams)

      // Vue.use(SavvyImport)
      this.modal.sender = this.getUser().uid
      this.modal.callback = this.modalCallback
      this.$parent.$on('updateCards', this.updateCards)
      this.$parent.$on('setLoading', this.setLoading)
      // SavvyImport.beginImport()
    },
    components: {
      card: Card,
      icon: Icon,
      ibutton: IconButton,
      modal: Modal,
      alert: Alert,
      draggable: Draggable
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
                url: file.webContentLink // Could be webViewLink?
              }
            })
          }
        })
        return cards
      },
      getCard: function(objectID) {
        return this.allCards[objectID]
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
      cardMouseover: function(card) {
        if (this.sidebar) {
          this.openPopup(card)
        }
      },
      cardMouseout: function () {
        if (this.sidebar) {
          this.closePopup()
        }
      },
      cardClick: function(card) {
        const self = this
        if (!this.sidebar) {
          setTimeout(function () { // Is this timeout stil necessary?
            self.openPopup(card)
          }, 1)
        }
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
      openPopup: function(card) {
        this.popupCards = [card]
        clearTimeout(this.popupTimeout)
      },
      closePopup: function(instantly) {
        const self = this
        self.editing = false // This should be for every card so currently does nothing
        clearTimeout(self.popupTimeout)
        if (this.sidebar && !instantly) {
          self.popupTimeout = setTimeout(function () {
            self.popupCards = []
          }, 1000)
        } else {
          this.popupCards = []
        }
      },
      updateCards: function(data) {
        this.loading = false
        this.pingCards = data.cards.pings
        // this.cards = data.cards.memories
        this.mainCardList = data.cards.memories.map(function(card) { return card.objectID })
        this.noCardMessage = data.noCardMessage
      },
      setLoading: function () {
        this.loading = true
        this.pingCards = []
        this.mainCardList = []
      },
      search: function () {
        const self = this
        self.setLoading()
        self.lastQuery = self.query
        ExplaainSearch.searchCards(self.getUser(), self.query, 12)
        .then(function(hits) {
          self.loading = false
          self.pingCards = []
          // self.cards = hits
          self.mainCardList = hits.map(function(card) { return card.objectID })
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
        ExplaainSearch.searchCards(self.getUser(), '', 24)
        .then(function(hits) {
          self.loading = false
          console.log('hits')
          console.log(hits)
          self.pingCards = []
          // self.cards = hits
          self.mainCardList = hits.map(function(card) { return card.objectID })
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
      //   this.modal.sender = this.getUser().uid
      //   this.modal.show = true
      //   console.log(222)
      //   this.modal.submit = this.saveCard
      //   // .then(function () {
      //   //   console.log(333)
      //   // })
      //   delete this.modal.objectID
      //   this.modal.text = ''
      // },
      beginCreate: function () {
        const card = {
          // objectID: 'TEMP_' + Math.floor(Math.random() * 10000000000),
          intent: 'storeMemory',
          content: {
            description: '',
          },
          newlyCreated: true
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
        const d = Q.defer()
        const data = {
          sender: this.getUser().uid,
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
        ExplaainSearch.searchCards(self.getUser(), '', 50)
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
              listCard.intent = 'storeMemory'
              listCard.sender = self.getUser().uid
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
        console.log(self.getUser())
        data.user = { uid: self.getUser().uid, idToken: self.getUser().getAccessToken() }
        data.organisationID = self.organisation.name
        ExplaainAuthor.saveCard(data)
        .then(function(res) {
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
      }
    }
  }
</script>

<!-- // <script async defer src='https://apis.google.com/js/api.js'
//       onload='this.onload=function () {};handleClientLoad()'
//       onreadystatechange='if (this.readyState === 'complete') this.onload()'>
//     </script> -->

<style lang="css">
  @import url('https://fonts.googleapis.com/css?family=Lato:100,100i,300,300i,400,400i,700,700i,900,900i');

  body {
    font-size: 16px;
    font-family: "Lato", Arial, sans-serif;
    color: #555;
    pointer-events: none;
  }
  body div:not(.popup), body button {
    pointer-events: all;
  }

  .main p {
    margin: 50px 10px;
  }

  .fa-icon {
    margin-bottom: -0.2em;
    color: #777;
    height: 1.2em;
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
  }
  .loader > div {
    height: 100%;
    background: #ffd51c;
  }

  .spinner {
    margin: 60px auto;
    text-align: center;
    font-size: 40px;
  }
  .spinner svg {
    width: auto;
    height: 1em; /* or any other relative font sizes */

    /* You would have to include the following two lines to make this work in Safari */
    max-width: 100%;
    max-height: 100%;
  }

  .header {
    text-align: center;
    padding: 20px;
  }

  .header img.savvy-logo {
    max-width: 60%;
    width: 280px;
    display: block;
    margin: 20px auto 0;
  }
  .explorer {
    /*pointer-events: none;*/
  }
  .explorer .main {
    position: absolute;
    z-index: 1;
    pointer-events: all;
  }
  .explorer:not(.sidebar) .main {
    width: calc(100% - 20px);
  }

  .explorer.sidebar .main {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    right: 0;
  }

  .popup {
    position: fixed;
    z-index: 100;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 180px 10px 60px;
    text-align: center;
    pointer-events: none;
  }
  .explorer.sidebar .popup {
    right: 50%;
    pointer-events: all;
  }
  .explorer .popup.active {
    pointer-events: all;
    overflow: scroll;
  }
  .explorer:not(.sidebar) .popup.active {
    background: rgba(0,0,0,0.2);
  }
  .popup .card {
    pointer-events: all;
  }

  input, textarea, button {
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 5px;
    margin: 10px 5px;
    border: 1px solid #ddd;
  }

  input, .card {
    text-align: left;
  }
  input {
    margin: 20px;
    width: calc(100% - 82px);
    max-width: 500px;
  }
  input:focus {
    outline:none;
  }

  button {
    background: white;
    cursor: pointer;
    color: #333;
  }
  button:hover {
    background: #eee;
  }

  p.cards-label {
    font-weight: bold;
    margin: 20px 20px 0px;
  }


  .cards {
    margin: 0;
    padding: 0;
    text-align: center;
  }

  li { /* Is this even being used anymore? */
    list-style: none;
    display: inline-block;
    vertical-align: top;
    width: 90%;
    max-width: 300px;
  }

  p.no-cards {
    text-align: center;
    margin: 50px 20px;
    color: #bbb;
    font-style: italic;
  }
</style>
