<template lang="html">
  <div class="card shadow" @mouseover="cardMouseover" @mouseout="cardMouseout" @click.stop="cardClick" :class="{ highlight: highlight || card.highlight, editing: editing, updating: updating, full: full }">
    <!-- <ibutton class="cardDrag" icon="arrows" text=""></ibutton> -->
    <div class="buttons-top-right">
      <ibutton v-if="!editing" class="left" icon="plus" text="Add" :click="createCard"></ibutton>
      <ibutton v-if="!editing" class="right" icon="pencil" text="Edit" :click="editCard"></ibutton>
      <!-- <ibutton v-if="editing" class="left cancel" icon="close" text="Cancel" :click="cancelEdit"></ibutton>
      <ibutton v-if="editing" class="right save" icon="check" text="Save" :click="saveEdit"></ibutton> -->
      <button v-if="!explaain" class="copy" type="button" @click.stop="copy" v-clipboard="fullText"><img class="icon" :src="copyIcon">Copy</button>
    </div>
    <img :src="cardIcon" alt="" class="file-icons">
    <component v-bind:is="format" :showPending="showPending" :data="data" :full="full" :allCards="allCards" :setCard="setCard" @contentUpdate="contentUpdate" :auth="auth" :position="position" :highlight="highlight" :editing="editing"></component>
    <!-- <div v-if="full && card.pending" class="pending">
      <i>This card has changes pending review</i> <ibutton icon="eye" text="Show Pending Changes" :click="togglePending" class="small"></ibutton>
      <div v-if="showPending">
        <b>Pending:</b><br>
        {{card.pending[0].description}}
      </div>
    </div> -->
    <a v-if="card.files && card.files.length" v-for="file, i in card.files" class="file" target="_blank" :href="file && file.url || 'https://docs.google.com/document/d/15WQ-3weCzF7kmi9FzMJwN6XH1K_ly6cvBM_NuFZtJsw/edit?usp=sharing'">
      <!-- <img :src="fileIcons[i]" alt=""> -->
      <h4><vue-markdown :watches="['card.files']" :source="getFileTitle(file)" :linkify="false" :anchorAttributes="{target: '_blank'}"></vue-markdown></h4>
      <h5>{{getServiceName(card, file)}}</h5>
    </a>
    <footer v-if="full">
      <div class="sources" v-if="card.sources && card.sources.length">
        Source{{card.sources.length > 1 ? 's' : ''}}: <span v-for="source, i in card.sources"><a :href="source.url" target="_blank">{{source.name}}</a>{{i < card.sources.length - 1 ? ', ' : '' }}</span>
      </div>
      <!-- <div class="buttons" v-if="!editing">
        <ibutton class="left delete" icon="trash" text="Delete" :click="deleteCard"></ibutton>
        <ibutton class="right edit" icon="pencil" text="Edit" :click="editCard"></ibutton>
      </div> -->
      <div class="buttons" v-if="editing">
        <ibutton class="left cancel" icon="close" text="Cancel" :click="cancelEdit"></ibutton>
        <ibutton class="right save" icon="check" :text="['admin', 'manager'].indexOf(userRole) > -1 ? 'Save Card' : 'Submit for Approval'" :click="saveEdit"></ibutton>
      </div>
      <div class="buttons reaction" v-if="!reacted && !explaain && !editing">
        <!-- <p>How well did this match what you were looking for?</p> -->
        <button class="" @click="reaction('great')">😍&nbsp;&nbsp; That's what I needed</button>
        <!-- <button class="" @click="reaction('ok')">😐</button>
        <button class="" @click="reaction('bad')">😢</button> -->
      </div>
      <div class="buttons reaction" v-if="reacted && !explaain && !editing">
        <p>Thanks for your feedback! Savvy uses this to learn and get smarter over time 🤖</p>
      </div>
      <div class="footer-logo">{{explaain ? 'Explaain' : 'Savvy'}}</div>
      <div class="pending-toggle" v-if="!editing && card.pendingContent && Object.keys(card.pendingContent).length">
        <toggle-button v-model="showPending" :sync="true" :labels="true"/>
        <span>Show Pending Changes</span>
      </div>
    </footer>
    <ibutton class="approve" v-if="pendingApproval" icon="check" text="Approve"></ibutton>
  </div>
</template>

<script>
import Vue from 'vue'
import log from 'loglevel'
// import _ from 'lodash'
import Clipboards from 'vue-clipboards'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon.vue'
import VueMarkdown from 'vue-markdown'
import Draggable from 'vuedraggable'
import ToggleButton from 'vue-js-toggle-button'

import IconButton from './ibutton.vue'
import Cardlet from './cardlet.vue'
import Editable from './editable.vue'
import EditableMarkdown from './editable-markdown.vue'
import Search from './search.vue'

import Basic from './formats/basic'
import Issue from './formats/issue'

Vue.use(Clipboards)

export default {
  props: [
    'explaain',
    'plugin',
    'data',
    'full',
    'allCards',
    'setCard',
    'auth',
    'pendingApproval',
    'position',
    'highlight',
    'userRole',
  ],
  components: {
    Icon,
    VueMarkdown,
    ibutton: IconButton,
    Cardlet,
    Editable,
    Draggable,
    Search,
    EditableMarkdown,
    Basic,
    Issue,
  },
  data: function() {
    return {
      card: {},
      tempListCards: {},
      editing: false,
      copyIcon: '/static/images/clipboard.svg', // //static//
      showListSearch: false,
      reacted: false,
      showPending: true,
    }
  },
  computed: {
    updating: function() {
      return this.card.updating || false
    },
    listCards: function() {
      const self = this
      const listCards = (self.card._highlightResult && self.card._highlightResult.listCards) || self.card.listCards || []
      return listCards.map((content, i) => {
        return {
          objectID: self.card.listItems[i],
          description: content.value || content
        }
      })
    },
    format: function() {
      return this.data.service === 'sifter' ? 'issue' : 'basic'
    },
    // listCards: {
    //   get: function() {
    //     const self = this
    //     return self.card.listItems ? self.card.listItems.map(function(objectID) {
    //       return self.tempListCards[objectID] || JSON.parse(JSON.stringify(self.allCards[objectID] || null)) || { content: { description: 'Card Not Found' } }
    //     }) : []
    //   },
    //   set: function(newValue) { // Doesn't get called for deep events which could cause issues
    //     const self = this
    //     self.card.listItems = newValue.map(function(listCard) {
    //       self.tempListCards[listCard.objectID] = listCard // Is having this here good practice?
    //       return listCard.objectID
    //     })
    //   }
    // },
    text: {
      get: function() {
        const text = this.card.description || ''
        // if (!text || !text.length) console.log(text)
        const snippetLength = 100
        const snippetStart = Math.max(text.indexOf('**') - (snippetLength / 2), 0)
        return this.full ? text : text.trunc(snippetStart, snippetLength, true)
      },
      set: function(val) {
        this.card.description = val
      }
    },
    cardIcon: function() {
      if (this.cardType === 'issue')
        return '/static/images/icons/bug.png'
      else
        return this.fileIcons
    },
    cardType: function() {
      if (this.card.service === 'sifter')
        return 'issue'
      else
        return 'other'
      // else if (this.card.files && this.card.files.length && this.card.files[0])
    },
    fileIcons: function() {
      return this.card && this.card.files && this.card.files.length ? this.card.files.map(file => {
        switch (file && file.mimeType ? file.mimeType : null) {
          case 'application/vnd.google-apps.document':
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return 'https://lh4.ggpht.com/-wROmWQVYTcjs3G6H0lYkBK2nPGYsY75Ik2IXTmOO2Oo0SMgbDtnF0eqz-BRR1hRQg=w300'
          case 'application/vnd.google-apps.spreadsheet':
          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return 'http://icons.iconarchive.com/icons/dtafalonso/android-lollipop/512/Sheets-icon.png'
          case 'application/vnd.google-apps.presentation':
          case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            return 'http://cliparting.com/wp-content/uploads/2017/07/Google-slides-icon-free-download-at-icons8-clipart.png'
          case 'application/pdf':
            return 'https://cdn1.iconfinder.com/data/icons/adobe-acrobat-pdf/154/adobe-acrobat-pdf-file-512.png'
          case 'image/png':
          case 'image/jpg':
          case 'image/jpeg':
          case 'image/gif':
            return 'https://cdn3.iconfinder.com/data/icons/faticons/32/picture-01-512.png'
          default:
            return 'https://cdn4.iconfinder.com/data/icons/48-bubbles/48/12.File-512.png'
        }
      }) : ['/static/images/iconGrey.png'] // //static//
      // }) : ['https://cdn4.iconfinder.com/data/icons/48-bubbles/48/12.File-512.png']
    },
    fullText: function() {
      return (this.card.title ? this.card.title + '\n\n' : '') + this.text + this.listCards.map(function(listCard) {
        return '\n- ' + listCard.description
      })
    },
    fontSize: function() {
      // const self = this
      // return 16 + 2 * Math.floor(Math.min(5, 100 / (self.text.length))) + 'px'
      return 16 + 'px'
    }
  },
  watch: {
    data: {
      handler: function(val) {
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
    const self = this
    log.debug(this.data.objectID)
    this.syncData()
    Vue.use(ToggleButton)
    console.log('aaaaa', self.card)
    console.log('bbbbb', self.card.files)
    if (this.data.newlyCreated)
      this.editing = true
  },
  methods: {
    getServiceName(card, file) {
      const services = {
        gdocs: '📂 Google Drive',
        gsheets: '📂 Google Drive',
        sifter: '🐞 Sifter',
        confluence: '📂 Confluence',
      }
      if (file && file.folder)
        return '📂 ' + file.folder + ' Drive'
      else if (file && file.service)
        return services[file.service]
      else if (card && card.service)
        return services[card.service]
      else
        return '📂 ' + (this.auth && this.auth.user && this.auth.user.data && this.auth.user.data.organisation && this.auth.user.data.organisation.id ? this.auth.user.data.organisation.id : 'Team') + ' Drive'
    },
    getFileTitle: function(file) {
      return this.card.service === 'sifter' ? 'Issue #' + this.card.integrationFields.number : file && file.title ? file.title : ''
    },
    syncData: function() {
      this.card = JSON.parse(JSON.stringify(this.data))
    },
    linkClick: function(event) {
      const self = this
      if (event.srcElement.nodeName === 'A') {
        event.stopPropagation()
        var myRegexp = /\[.*?\]\((.*?)\)/g
        var match = myRegexp.exec(self.text)
        const toLayerKeys = []
        while (match != null) {
          toLayerKeys.push(match[1].replace('#', ''))
          match = myRegexp.exec(self.text)
        }
        const data = {
          // type: 'link',
          toURI: event.srcElement.hash.replace('#', ''),
          fromPos: self.position,
          toLayerKeys: toLayerKeys
        }
        data.toPos = [ data.fromPos[0] + 1, data.toLayerKeys.indexOf(data.toURI) ]
        this.$emit('showCard', data)
      }
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
      console.log('cardClick')
      if (!this.editing) this.$emit('cardClick', self.card)

      const data = {
        // type: 'select',
        // toURI: event.srcElement.hash.replace('#', ''),
        fromPos: self.position,
        toPos: self.position,
        // fromDOM: getCardDOM(triggerTarget),
        // toLayerKeys: toLayerKeys
      }
      this.$emit('showCard', data)
    },
    cardletClick: function(card) {
      if (!this.editing) this.$emit('cardClick', card)
    },
    createCard: function() {
      // Hi
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
      setTimeout(function() {
        self.syncData() // Shouldn't be necessary if data were properly being wtached deeply
      }, 10)
    },
    saveEdit: function() {
      const self = this
      self.editing = false
      setTimeout(function() {
        console.log('self.card')
        console.log(self.card)
        console.log('self.card.title')
        console.log(self.card.title)
        self.card.modified = new Date()
        if (self.card.sources && self.card.sources.filter(source => source.name === 'Journalist').length === 0)
          self.card.sources.push({
            type: 'author',
            name: 'Journalist'
          })
        console.log(self.card.title)
        self.card.listCards = self.listCards
        self.listCards.forEach(function(listCard) {
          self.tempListCards[listCard.objectID] = listCard
        })
        self.$emit('updateCard', self.card, function(data) {
          self.tempListCards = {}
          // self.syncData() // Shouldn't be necessary if data were properly being wtached deeply
        }, function(e) {
          console.log(e)
          self.tempListCards = {}
        })
      }, 5)
    },
    contentUpdate: function(content) {
      const self = this
      Object.keys(content).forEach(key => {
        self.data[key] = content[key]
        self.card[key] = content[key]
      })
    },
    addListItem: function(card) {
      console.log(card)
      const self = this
      if (!card)
        card = {
          objectID: 'TEMP_' + Math.floor(Math.random() * 10000000000),
          intent: 'store',
          description: '',
        }
      self.tempListCards[card.objectID] = card
      if (!self.card.listItems) Vue.set(self.card, 'listItems', [])
      self.card.listItems.push(card.objectID)
    },
    removeListItem: function(data) {
      const listIndex = this.card.listItems.indexOf(data.objectID) // Doesn't account for same item appearing twice in list
      this.card.listItems.splice(listIndex, 1)
    },
    toggleListSearch: function() {
      this.showListSearch = !this.showListSearch
    },
    copy: function(e) {
      // The v-clipboard directive has already copied the text from the card - this function just shows the alert
      this.$emit('copy')
    },
    reaction: function(reaction) {
      const self = this
      self.$emit('reaction', { reaction: reaction, card: self.card })
      self.reacted = true
    }
  }
}

String.prototype.trunc = function(start, length, useWordBoundary) {
  if (this.length <= length) return this
  var subString = this.substr(start, length - 1)
  return (start > 0 ? '...' : '') + (useWordBoundary
    ? subString.substr(0, subString.lastIndexOf(' '))
    : subString) + '...'
}
</script>

<style lang="scss">

  @import '../../styles/main.scss';

  div.card {
    @extend .block;
    position: relative;
    display: inline-block;
    vertical-align: top;
    margin: 10px calc(50% - 203px);
    width: calc(100% - 60px);
    max-width: 380px;
    padding: 0;
    // border-radius: 10px;
    word-wrap: break-word;
    overflow-wrap: break-word;
    background: white;
    cursor: pointer;
    overflow: hidden;
    transition: margin .3s, transform .3s;

    &.highlight {
      box-shadow: 0px 0px 30px rgba(100, 84, 244, 0.5);
    }
    &.highlight:hover {
      box-shadow: 0px 0px 30px rgba(100, 84, 244, 0.8);
    }
    &.full {
      a.file {
        // margin-bottom: 10px;
      }
    }

    .field {
      &.pending ::after, &.reverted ::after {
        font-size: 12px;
        right: 0px;
        display: block;
        font-style: italic;
        font-weight: normal;
        text-align: right;
      }
      &.pending {
        border-right: 4px orange solid;
        ::after {
          content: "Pending Update";
          color: orange;
        }
      }
      &.reverted {
        border-right: 4px blue solid;
        ::after {
          content: "Most Recent Verified Content";
          color: blue;
        }
      }
    }
    .updating {
      opacity: 0.5;
    }
    .buttons-top-right {
      position: absolute;
      top: 5px;
      right: 5px;
      // margin: -5px -5px 10px 20px;
      button {
        display: none;
        padding: 6px 12px;
        margin: 2px;
        font-size: 12px;
        box-shadow: none;
        opacity: 0.7;

        &:hover {
          opacity: 1;
          box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
          img {
            opacity: 1;
          }
        }
        img {
          opacity: 0.5;
          display: inline-block;
        }
      }
    }
    button {
      &.left {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        margin-right: -2px;
      }
      &.delete:hover {
        background: #ffaaaa;
      }
      &.right {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        margin-left: -2px;
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
    p, img, ol, .editable {
      margin: 5px;
      padding: 5px;
    }
    ol {
      padding-left: 20px;

      li {
        padding-left: 5px;
      }
    }
    .editing.editable.editing {
      margin: 3px;
    }
    p {
      white-space: pre-wrap;
    }
    .file-icons {
      float: left;
      margin: 18px 0 0 10px;
      max-width: 35px;
      max-height: 35px;
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
    .modified {
      font-size: 14px;
      // font-style: italic;
      text-align: right;
      color: #999;
      margin: 20px 10px 0;

      svg {
        color: #00cc00;
      }
      span {
        font-weight: bold;
      }
    }
    a.file {
      display: block;
      margin: 0;
      overflow: hidden;
      padding: 10px;
      box-shadow: inset 0 1px 1px rgba(0,0,0,.05);
      -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.05);
      // background: #f5f5f5;
      transition: background-color .3s;
      color: inherit;
      text-decoration: inherit;

      &:hover {
        background: #f5f5f5;
      }

      img {
        height: 40px;
        float: left;
        margin: 0 10px;
      }
      h4, h5 {
        margin: 10px;
      }
      h4 {
        font-size: 1em;

        strong {
          font-weight: 900;
          color: #555;
          font-style: normal;
        }
        p {
          margin: 0;
          padding: 0;
        }
      }
    }
    footer {
      margin: 0;
      padding: 5px;
      min-height: 20px;
      -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.05);

      .sources {
        margin: 5px;
        padding: 5px;
        font-size: 14px;

        a {
          color: inherit;
          text-decoration: none;
          font-weight: bold;

          &:hover {
            color: $savvy;
          }
        }
      }

      .buttons {
        // position: absolute;
        bottom: 15px;
        left: 20px;
        margin: 13px 0 5px;
        padding: 6px 12px;

        &.reaction {
          position: relative;
          left: auto;
          margin: 30px 0 10px;
          text-align: center;
          font-size: 14px;

          button {
            margin: 5px 5px 10px;
            font-size: 16px;
            padding: 10px 20px;
            // padding: 4px 10px 0;
          }
        }
      }
    }
    .list section.buttons {
      margin: 10px 0;
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
      margin: 5px;
      padding: 5px;
      bottom: 10px;
      right: 15px;
      font-size: 14px;
      font-weight: bold;
      color: #aaa;
    }
  }
  .explorer {
    .card:hover {
      .buttons-top-right .copy {
        display: inline-block;
      }
    }
    > .main-explorer .card:hover {
      @include blockShadow(2);

      // margin-top: -30px;
      z-index: 100;
      transform: scale(1.03);

      .file {
        // transform: scaleY(1);
      }
    }
    > .popup .card {
      padding-top: 10px;
      &:hover {
        .buttons-top-right button {
          display: inline-block;
        }
      }
    }
  }
  .sidebar .card {
    margin: 10px;
  }
  .card.shadow {
    width: calc(100% - 50px);
    box-shadow: 0px 0px 30px rgba(150,150,150,0.5);
    border: none;
  }
  @media (min-width: 600px) {
    .explorer:not(.sidebar) .main-explorer .card:not(.cardlet) {
      width: calc(50% - 45px);
      margin: 15px;
    }
  }
  @media (min-width: 900px) {
    .explorer:not(.sidebar) .main-explorer .card:not(.cardlet) {
      width: calc(33.3% - 50px);
    }
  }
  @media (min-width: 1450px) {
    .explorer:not(.sidebar) .main-explorer .card:not(.cardlet) {
      width: calc(25% - 40px);
    }
  }

  .editing:not(.non-editable) :not(.non-editable) .editable:not(.non-editable), .editing:not(.non-editable) > .editable:not(.non-editable) {
    margin: 20px 20px 20px 0;
    border: 2px dashed lightgrey;
    border-radius: 4px;
    color: black;
    cursor: text;
  }

  .pending-toggle {
    margin: 0 20px 11px;

    > label {
      margin-bottom: 4px;
    }
    > span {
      margin: 0 5px;
      font-size: 14px;
    }
  }

  button.approve {
    margin: 20px 0 0 0;
    color: green;

    svg {
      color: green;
    }
  }


</style>
