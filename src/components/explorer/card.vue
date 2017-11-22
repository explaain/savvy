<template lang="html">
  <div class="card shadow" @mouseover="cardMouseover" @mouseout="cardMouseout" @click="cardClick" :class="{ highlight: card.highlight, editing: editing, updating: updating }">
    <!-- <ibutton class="cardDrag" icon="arrows" text=""></ibutton> -->
    <button class="copy" type="button" @click.stop="copy" v-clipboard="fullText"><img class="icon" :src="copyIcon">Copy</button>
    <div class="label"><span class="top-hit" v-if="card.highlight"><icon name="bolt"></icon> Top Hit</span><span class="type" v-if="full"><!--<icon name="clock-o"></icon> Memory--></span></div>
    <div class="content">
      <editable :content="text" :editable="editing" @update="text = $event" :style="{'font-size': fontSize }"></editable>
      <draggable v-model="listCards" :options="{ disabled: !editing, handle: '.drag', draggable: '.cardlet' }" class="list" v-if="listCards.length || editing">
        <cardlet v-for="item in listCards" :editing="editing" :card="item" :key="item.objectID" @cardletClick="cardletClick" @remove="removeListItem"></cardlet>
        <section class="buttons" v-if="editing">
          <ibutton class="left" icon="plus" text="Create List Item" :click="addListItem"></ibutton>
          <ibutton class="right" icon="search" text="Insert Card Into List" :click="toggleListSearch" :class="{selected: showListSearch}"></ibutton>
          <search v-if="showListSearch" @select="addListItem" :allCards="allCards" :setCard="setCard" :auth="auth"></search>
        </section>
      </draggable>
      <img v-if="full && card.attachments && card.attachments[0]" v-bind:src="card.attachments[0].url">
    </div>
    <div v-if="full && card.pending" class="pending">
      <i>This card has changes pending review</i> <ibutton icon="eye" text="Show Pending Changes" :click="togglePending" class="small"></ibutton>
      <div v-if="showPending">
        <b>Pending:</b><br>
        {{card.pending[0].description}}
      </div>
    </div>
    <p class="spinner" v-if="!card"><icon name="refresh" class="fa-spin fa-3x"></icon></p>
    <p class="extractedFrom" v-if="full && card.extractedFrom">Extracted from <a v-bind:href="card.extractedFrom.url" target="_blank">{{card.extractedFrom.title}}</a></p>
    <footer v-if="full">
      <div class="buttons" v-if="!editing">
        <ibutton class="left delete" icon="trash" text="Delete" :click="deleteCard"></ibutton>
        <ibutton class="right edit" icon="pencil" text="Edit" :click="editCard"></ibutton>
      </div>
      <div class="buttons" v-if="editing">
        <ibutton class="left cancel" icon="close" text="Cancel" :click="cancelEdit"></ibutton>
        <ibutton class="right save" icon="check" text="Save" :click="saveEdit"></ibutton>
      </div>
      <div class="buttons reaction" v-if="reacted">
        <p>How well did this match what you were looking for?</p>
        <button class="" @click="reaction('great')">😍</button>
        <button class="" @click="reaction('ok')">😐</button>
        <button class="" @click="reaction('bad')">😢</button>
      </div>
      <div class="buttons reaction" v-if="reacted">
        <p>Thanks for letting us know! Our AI uses this feedback to get smarter 😎</p>
      </div>
      <div class="footer-logo">Savvy</div>
    </footer>
    <ibutton class="approve" v-if="pendingApproval" icon="check" text="Approve"></ibutton>
  </div>
</template>

<script>
import Vue from 'vue'
// import log from 'loglevel'
import Clipboards from 'vue-clipboards'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon.vue'
import Draggable from 'vuedraggable'
import IconButton from './ibutton.vue'
import Cardlet from './cardlet.vue'
import Editable from './editable.vue'
import Search from './search.vue'

Vue.use(Clipboards)

export default {
  props: [
    'data',
    'full',
    'allCards',
    'setCard',
    'auth',
    'pendingApproval',
  ],
  components: {
    icon: Icon,
    ibutton: IconButton,
    cardlet: Cardlet,
    editable: Editable,
    draggable: Draggable,
    search: Search,
  },
  data: function() {
    return {
      card: {},
      tempListCards: {},
      editing: false,
      copyIcon: './static/images/clipboard.svg',
      showListSearch: false,
      showPending: false,
      reacted: false
    }
  },
  computed: {
    updating: function() {
      return this.card.updating || false
    },
    listCards: {
      get: function() {
        const self = this
        return self.card.content.listItems ? self.card.content.listItems.map(function(objectID) {
          return self.tempListCards[objectID] || JSON.parse(JSON.stringify(self.allCards[objectID] || null)) || { content: { description: 'Card Not Found' } }
        }) : []
      },
      set: function(newValue) { // Doesn't get called for deep events which could cause issues
        const self = this
        self.card.content.listItems = newValue.map(function(listCard) {
          self.tempListCards[listCard.objectID] = listCard // Is having this here good practice?
          return listCard.objectID
        })
      }
    },
    text: {
      get: function() {
        const text = this.card.content.description || ''
        if (!text || !text.length) console.log(text)
        return this.full ? text : text.trunc(100, true)
      },
      set: function(val) {
        this.card.content.description = val
      }
    },
    fullText: function() {
      return this.text + this.listCards.map(function(listCard) {
        return '\n- ' + listCard.content.description
      })
    },
    fontSize: function() {
      const self = this
      return 16 + 2 * Math.floor(Math.min(5, 100 / (self.text.length))) + 'px'
    }
  },
  watch: {
    data: {
      handler: function(val) {
        console.log('data data')
        console.log(this.editing)
        if (!this.editing) this.syncData()
      },
      deep: true
    },
    editing: function(val) {
      const self = this
      if (val)
        self.listCards.forEach(function(listCard) {
          self.tempListCards[listCard.objectID] = JSON.parse(JSON.stringify(listCard))
        })
    }
  },
  created: function() {
    this.syncData()
    if (this.data.newlyCreated)
      this.editing = true
  },
  methods: {
    syncData: function() {
      this.card = JSON.parse(JSON.stringify(this.data))
    },
    cardMouseover: function() {
      const self = this
      this.$emit('cardMouseover', self.card)
    },
    cardMouseout: function() {
      const self = this
      this.$emit('cardMouseout', self.card)
    },
    cardClick: function() {
      const self = this
      if (!this.editing) this.$emit('cardClick', self.card)
    },
    cardletClick: function(card) {
      if (!this.editing) this.$emit('cardClick', card)
    },
    editCard: function() {
      this.editing = true
    },
    deleteCard: function() {
      this.$emit('deleteCard', this.card.objectID)
    },
    cancelEdit: function() {
      this.syncData()
      this.editing = false
      // self.tempListCards = {} ????
    },
    saveEdit: function() {
      const self = this
      self.card.content.listCards = self.listCards
      self.listCards.forEach(function(listCard) {
        self.tempListCards[listCard.objectID] = listCard
      })
      self.$emit('updateCard', self.card, function(data) {
        self.tempListCards = {}
        self.syncData() // Shouldn't be necessary if data were properly being wtached deeply
      }, function(e) {
        console.log(e)
        self.tempListCards = {}
      })
      self.editing = false
    },
    addListItem: function(card) {
      console.log(card)
      const self = this
      if (!card)
        card = {
          objectID: 'TEMP_' + Math.floor(Math.random() * 10000000000),
          intent: 'storeMemory',
          content: {
            description: '',
          }
        }
      self.tempListCards[card.objectID] = card
      if (!self.card.content.listItems) Vue.set(self.card.content, 'listItems', [])
      self.card.content.listItems.push(card.objectID)
    },
    removeListItem: function(data) {
      const listIndex = this.card.content.listItems.indexOf(data.objectID) // Doesn't account for same item appearing twice in list
      this.card.content.listItems.splice(listIndex, 1)
    },
    toggleListSearch: function() {
      this.showListSearch = !this.showListSearch
    },
    togglePending: function() {
      this.showPending = !this.showPending
    },
    copy: function(e) {
      // The v-clipboard directive has already copied the text from the card - this function just shows the alert
      this.$emit('copy')
    },
    reaction: function(reaction) {
      console.log('REACTION!')
      const self = this
      self.$emit('reaction', { reaction: reaction, card: self.card })
      self.reacted = true
    }
  }
}

String.prototype.trunc = function(n, useWordBoundary) {
  if (this.length <= n) return this
  var subString = this.substr(0, n - 1)
  return (useWordBoundary
    ? subString.substr(0, subString.lastIndexOf(' '))
    : subString) + '...'
}
</script>

<style lang="scss">

  @import '../../styles/main.scss';

  .card {
    @extend .block;
    border-radius: 6px;
    position: relative;
    display: inline-block;
    vertical-align: top;
    margin: 10px;
    width: calc(100% - 50px);
    max-width: 320px;
    padding: 10px 10px 20px 10px;
    // border: 1px solid #ddd;
    border-radius: 10px;
    word-wrap: break-word;
    overflow-wrap: break-word;
    background: white;
    cursor: pointer;

    &:hover {
      @include blockShadow(2);

      button.copy {
        display: block;
      }
    }

    &.highlight {
      box-shadow: 0px 0px 30px rgba(100, 84, 244, 0.5);
    }
    &.highlight:hover {
      box-shadow: 0px 0px 30px rgba(100, 84, 244, 0.8);
    }
    .updating {
      opacity: 0.5;
    }

    button {
      &.copy {
        display: none;
        position: absolute;
        top: -5px;
        right: -5px;
        // margin: -5px -5px 10px 20px;
        padding: 6px 12px;
        font-size: 12px;
        box-shadow: none;

        &:hover {
          box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
        }
      }
      &.left {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
      &.delete:hover {
        background: #ffaaaa;
      }
      &.right {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
      &.cancel {
        background: #ffb6c9;
      }
      &.save {
        background: #b8ecc0;
      }
      &.selected {
        background: #ddd;
      }

      .small {
        font-size: 0.8em;
        padding: 0.5em 1em;
      }
    }
    .label {
      margin: 5px 5px 0 5px;
      padding: 5px;
      font-size: 14px;
      text-transform: uppercase;
      font-weight: bold;
      color: #aaa;

      .top-hit, .top-hit svg {
        color: rgb(100, 84, 244);
      }
      .fa-icon {
        color: #aaa;
      }
    }
    img.icon {
      height: 1em;
      margin: 0 4px -1px 0px;
      padding: 0;
    }
    p, img, .editable {
      margin: 5px;
      padding: 5px;
    }
    .editing.editable.editing {
      margin: 3px;
    }
    p {
      white-space: pre-wrap;
    }
    img {
      max-width: calc(100% - 10px);
      border-radius: 5px;
    }
    .content {
      @extend .blockSpacing;
      margin: 0 10px;
    }
    .list {
      margin: 20px 0 10px;
    }
    .extractedFrom {
      font-size: 14px;
      color: #999;
      font-style: italic;
    }
    .extractedFrom a {
      color: #999;
      font-weight: bold;
      text-decoration: none;
    }
    .extractedFrom a:hover {
      border-bottom: 4px solid rgb(255,211,35);
    }
    footer {
      min-height: 40px;
    }
    .list section.buttons {
      margin: 10px 0;
    }
    footer .buttons {
      // position: absolute;
      bottom: 15px;
      left: 20px;
      margin: 10px 20px -15px -8px;
      padding: 6px 12px;

      &.reaction {
        position: relative;
        text-align: center;

        button {
          margin: 10px;
        }
      }
    }
    .buttons button {
      padding: 6px 12px;
      margin: -2px;
      font-size: 12px;
    }
    .buttons button:focus {
      outline:none;
    }
    .pending {
      color: grey;
      font-size: 0.8em;
    }
    .footer-logo {
      position: absolute;
      bottom: 15px;
      right: 20px;
      font-size: 14px;
      font-weight: bold;
      color: #aaa;
    }
  }
  // .card.shadow {
  //   width: calc(100% - 70px);
  //   box-shadow: 0px 0px 30px rgba(150,150,150,0.5);
  //   border: none;
  // }
  @media (min-width: 600px) {
    .explorer:not(.sidebar) .main .card:not(.cardlet) {
      width: calc(50% - 50px);
    }
  }
  @media (min-width: 900px) {
    .explorer:not(.sidebar) .main .card:not(.cardlet) {
      width: calc(33.3% - 50px);
    }
  }

  .editing:not(.non-editable) :not(.non-editable) .editable:not(.non-editable), .editing:not(.non-editable) > .editable:not(.non-editable) {
    border: 2px dashed lightgrey;
    border-radius: 4px;
    color: black;
    cursor: text;
  }

  button.approve {
    margin: 20px 0 0 0;
    color: green;

    svg {
      color: green;
    }
  }


</style>
