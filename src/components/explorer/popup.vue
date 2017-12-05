<template lang="html">
  <div class="popup">
    <header>
      <ibutton icon="close" text="Close" :click="close"></ibutton>
      <ibutton icon="plus" text="Create" :click="createCard"></ibutton>
    </header>
    <!-- <div style="width: 50%;">
        <img src="http://placehold.it/2000x1000" alt="">
        <img src="http://placehold.it/2000x1000" alt="">
        <img src="http://placehold.it/2000x1000" alt="">
        <img src="http://placehold.it/2000x1000" alt="">
    </div> -->
    <slick :options="{ focusOnSelect: true, initialSlide: positions[rowIndex] }" class="cards" v-for="(row, rowIndex) in cards" key="rowIndex" ref="slick">
    <!-- <ul class="cards" v-for="(row, rowIndex) in cards"> -->
      <card v-for="(card, cardIndex) in row" :highlight="positions[rowIndex] === cardIndex" @cardClick="cardClick" @showCard="showCard" @updateCard="updateCard" @deleteCard="deleteCard" :data="card" :key="card.objectID" :full="true" :allCards="allCards" :setCard="setCard" :auth="GlobalConfig.auth" :position="[rowIndex, cardIndex]" @copy="copyAlert"></card>
      <p class="no-cards" v-if="!cards.length">{{noCardMessage}}</p>
    <!-- </ul> -->
    </slick>
  </div>
</template>

<script>
  // /* global GlobalConfig */
  import Vue from 'vue'
  import log from 'loglevel'
  import Q from 'q'
  import 'vue-awesome/icons'
  import Icon from 'vue-awesome/components/Icon.vue'
  import Draggable from 'vuedraggable'
  import Slick from 'vue-slick'
  import Mixpanel from 'mixpanel-browser'
  import Card from './card.vue'
  import IconButton from './ibutton.vue'
  import Modal from './modal.vue'
  import Alert from './alert.vue'
  import ExplaainSearch from '../../plugins/explaain-search.js'
  import ExplaainAuthor from '../../plugins/explaain-author.js'

  export default {
    components: {
      Card,
      Icon,
      ibutton: IconButton,
      Modal,
      Alert,
      Draggable,
      Slick
    },
    props: [
      'GlobalConfig',
      'logo',
      'local'
    ],
    data () {
      return {
        cardRows: [[]],
        allCards: {},
        mainCardList: [],
        loading: false,
        loader: -1,
        // positions: []
      }
    },
    computed: {
      cards: function() {
        const self = this
        const watchThis = self.allCards; console.log(watchThis) // This does nothing other than force this function to watch for changes in self.allCards
        return self.cardRows.map(row =>
          row.map(objectID =>
            self.allCards[objectID] || { content: { description: 'Card Not Found' } }
          )
        )
      },
      positions: {
        get: function() {
          console.log(this.$refs)
          return this.$refs.slick ? this.$refs.slick.map(slick => slick.currentSlide()) : []
        },
        set: function(val, oldVal) {
          const self = this
          console.log('Setting positions')
          console.log(self.$refs)
          console.log(self.$refs.slick.length)

          // if (val.length > oldVal.length) {
          //
          // }

          val.forEach((position, i) => {
            log.debug(position, i)
            // if (i >= oldVal.length) {
            //   console.log('oldVal.length', oldVal.length)
            //   console.log('i', i)
            //   self.$refs.slick[i].reSlick()
            // }
            log.debug(self.$refs.slick)
            // log.debug(self.$refs.slick[i].currentSlide())
            if (self.$refs.slick[i]) self.$refs.slick[i].goTo(position)
            // log.debug(self.$refs.slick[i].currentSlide())
            setTimeout(function() {
            }, 100)
          })
        }
      }
    },
    created: function () {
      const self = this
      // self.authorParams.plugin = self.plugin
      Vue.use(ExplaainSearch, self.GlobalConfig.algolia)
      Vue.use(ExplaainAuthor, self.GlobalConfig.author)

      self.$parent.$on('updateCards', self.updateCards)
      self.$parent.$on('getCard', self.getCard)
      self.$parent.$on('setLoading', self.setLoading)
      self.$parent.$on('reaction', self.reaction)
      self.$parent.$on('search', q => {
        self.search(self.$route.query.q)
      })
      // Mixpanel.init('e3b4939c1ae819d65712679199dfce7e', { api_host: 'https://api.mixpanel.com' })
      self.allCards = {
        aa: {
          content: {
            description: 'aa aa [hello](#bb) [hello](#cc) aa'
          },
          objectID: 'aa'
        },
        bb: {
          content: {
            description: 'bb [hello](#cc) [hello](#aa) bb'
          },
          objectID: 'bb'
        },
        cc: {
          content: {
            description: 'cc [hello](#bb) [hello](#dd) cc'
          },
          objectID: 'cc'
        },
        dd: {
          content: {
            description: 'dd dd [hello](#cc) [hello](#aa) [hello](#bb)'
          },
          objectID: 'dd'
        },
      }
      self.cardRows = [
        [
          'aa',
          'bb',
          'dd'
        ],
        // [
        //   'bb',
        //   'aa'
        // ],
        // [
        //   'cc',
        //   'aa'
        // ]
      ]
    },
    methods: {
      getCard: function(objectID) {
        const self = this
        const card = JSON.parse(JSON.stringify(self.allCards[objectID] || null))
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
      cardClick: function(card) {
        // const self = this
        // Mixpanel.track('Card Clicked', {
        //   organisationID: self.GlobalConfig.organisation.id,
        //   userID: self.GlobalConfig.auth.user.uid,
        //   cardID: card.objectID,
        //   description: card.content.description,
        //   listItems: card.content.listItems
        // })
      },
      close: function(instantly) {},
      updateCards: function(data) {
        const self = this
        self.loading = false
        self.pingCards = data.cards.pings.map(card => card.card)
        // self.cards = data.cards.memories
        self.mainCardList = data.cards.memories.map(function(card) { return card.card.objectID })
        // Need to add to allCards?
        data.cards.memories.forEach(card => {
          self.allCards[card.card.objectID] = card.card
        })
        if (data.cards.hits) data.cards.hits.forEach(card => {
          self.allCards[card.card.objectID] = card.card
        })
        self.noCardMessage = data.noCardMessage
      },
      createCard: function () {
        const card = {
          intent: 'storeMemory',
          content: {
            description: '',
          },
          newlyCreated: true
        }
        this.cardRows = [[card]]
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
          log.error(e)
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
              listCard.sender = self.auth.user.uid
            }
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
        Q.allSettled(promises)
        .then(function () {
          self.saveCard(data)
          callback()
        }).catch(function(e) {
          log.error(e)
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
        data.user = { uid: self.auth.user.uid, idToken: /* self.auth.user.getAccessToken() || */ self.auth.user.auth.stsTokenManager.accessToken } // Ideally we should get getAccessToken() working on chrome extension so we don't need this backup option!
        data.organisationID = self.organisation.id
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
      showCard: function(data) {
        log.debug('showCard', data)

        // const triggerType = data.type
        // const getCardPosition = () => {}
        // const getCardDOM = () => {}
        // const getCardLinks = () => {}
        // const openLayer = () => {}
        // const resolvedPromise = () => {}
        // const getNumberofLayers = () => {}
        // const closeLayer = () => {}
        // const layerGoToSlide = () => {}
        // const getSelectedCardPos = () => {}
        // var toPos, fromPos, fromDOM, toURI, toLayerKeys, closePos

        // switch (triggerType) {
        //   case 'open':
        //     // toURI = this.getTargetURI(triggerTarget, 'card')
        //     // fromPos = [-1, -1]
        //     // toPos = [0, 0]
        //     // toLayerKeys = [toURI]
        //     break
        //
        //   case 'link':
        //
        //     break
        //
        //   case 'select':
        //     // toPos = getCardPosition(triggerTarget)
        //     // fromPos = [ toPos[0] - 1, 0 ]
        //     // fromDOM = getCardDOM(fromPos)
        //     // toLayerKeys = getCardLinks(fromDOM)
        //     break
        //
        //   case 'close':
        //     // closePos = getCardPosition(triggerTarget)
        //     // toURI = this.getTargetURI([ closePos[0] - 1, 0 ], 'card')
        //     // fromPos = [ closePos[0] - 2, 0 ]
        //     // fromDOM = getCardDOM(fromPos)
        //     // toLayerKeys = getCardLinks(fromDOM)
        //     // toPos = getSelectedCardPos(fromPos, toURI, toLayerKeys)
        //     break
        // }
        const positions = this.positions
        if (data.fromPos[0] === data.toPos[0] - 1) {
          this.cardRows[data.toPos[0]] = data.toLayerKeys
          console.log(JSON.stringify(this.positions))
          positions[data.fromPos[0]] = data.fromPos[1]
          console.log(JSON.stringify(this.positions))
        }
        this.cardRows.splice(data.toPos[0] + 1, this.cardRows.length - data.toPos[0])
        positions[data.toPos[0]] = data.toPos[1]
        this.positions = positions
        console.log(JSON.stringify(this.positions))

        console.log(this.$refs)
        // this.$refs.slick.forEach((slick) => slick.reSlick())
        this.$refs.slick.forEach((slick) => console.log(slick))
        this.$refs.slick.forEach((slick) => console.log(slick.currentSlide()))

        // var layerManipPromises = []
        //
        // switch (Math.sign(toPos[0] + 1 - getNumberofLayers())) {
        //   case (+1):
        //     // Opening on a new layer
        //     layerManipPromises[0] = openLayer(toPos[0], toLayerKeys, toPos[1], fromPos[1])
        //     break
        //
        //   case (0):
        //     // Opening on current layer
        //     layerManipPromises[0] = resolvedPromise()
        //     break
        //
        //   case (-1):
        //     // Opening on a previous layer (meaning we also close existing layers)
        //     for (var i = toPos[0] + 1; i < getNumberofLayers(); i++) {
        //       layerManipPromises[i - toPos[0] - 1] = closeLayer(i, true)
        //     }
        //     break
        // }
        //
        // Q.allSettled(layerManipPromises)
        // .then(function() {
        //   layerGoToSlide(fromPos, toPos)
        // })
      },
      getTargetURI: function(target, type) {
        const getTargetType = () => {}
        var uri
        switch (getTargetType(target)) {
          case 'URI':
            uri = target
            break
          // case 'position':
          //   uri = $($('#layer-' + target[0] + ' .card.slick-slide:not(.removed)')[target[1]]).attr('data-uri')
          //   break
          // case 'DOM':
          //   switch (type) {
          //     case 'link':
          //       uri = $(target).attr('href')
          //       break
          //
          //     case 'card':
          //       uri = $(target).closest('.card').attr('data-uri')
          //       break
          //   }
          //   break
        }

        if (!uri || !uri.length) {
          uri = -1
        }

        return uri
      },
      reaction: function(data) {
        Mixpanel.track('User Reacted to Card', {
          organisationID: self.organisation.id,
          userID: self.auth.user.uid,
          reaction: data.reaction,
          cardID: data.card.objectID,
          description: data.card.content.description,
          listItems: data.card.content.listItems,
          searchQuery: self.query
        })
      },
      copyAlert: function() {

      }
    }
  }
</script>

<style lang="scss">

  @import '../../styles/main.scss';
  @import '../../../node_modules/slick-carousel/slick/slick.css';


  body {
    @extend .defaultFont;
    pointer-events: none;
  }
  body div:not(.popup), body button {
    pointer-events: all;
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

  header {
    text-align: center;
    padding: 20px;
  }

  .header img.savvy-logo {
    max-width: 60%;
    width: 280px;
    display: block;
    margin: 20px auto 0;
  }

  .popup {
    .main {
      // position: absolute;
      z-index: 1;
      pointer-events: all;
      background: $background;
    }

    button.slick-arrow {
      position: absolute;
      top: 50px;
      z-index: 100;

      &.slick-prev {
        left: 0;
      }
      &.slick-next {
        right: 0;
      }
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

      &.active {
        pointer-events: all;
        overflow: scroll;
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
  input {
    margin: 20px;
    width: calc(100% - 82px);
    max-width: 500px;
  }
  input:focus {
    outline:none;
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

  p.no-cards {
    text-align: center;
    margin: 50px 20px;
    color: #bbb;
    font-style: italic;
  }

  .popup.sidebar {
    .main {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      right: 0;

      .header > button {
        margin: 10px 2px;
      }
    }
    .popup {
      right: 50%;
      pointer-events: all;
    }
  }

  .popup:not(.sidebar) {
    .main {
      // width: calc(100% - 20px);
    }
    .popup.active {
      background: rgba(0,0,0,0.2);
    }
  }
</style>
