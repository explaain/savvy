<template lang="html">
  <div class="card shadow" @mouseover="cardMouseover" @mouseout="cardMouseout" @click.stop="cardClick" :class="{ highlight: highlight || card.highlight, editing: editing, loading: loading || card.loading, full: full }">
    <!-- <ibutton class="cardDrag" icon="arrows" text=""></ibutton> -->
    <div class="buttons-top-right edit-buttons">
      <ibutton v-if="mode !== 'demo'" class="small left delete" icon="trash" text="Delete" :click="deleteCard"></ibutton>
      <!-- <ibutton v-if="!editing" class="small center create" icon="plus" text="Add" :click="createCard"></ibutton> -->
      <ibutton v-if="!editing" class="small edit" :class="{ right: mode !== 'demo' }" icon="pencil" text="Edit" :click="editCard"></ibutton>
      <button v-if="!explaain" class="small copy" type="button" @click.stop="copy" v-clipboard="fullText"><img class="icon" :src="copyIcon">Copy</button>
    </div>
    <section v-if="!fileFormat" style="overflow: hidden" @click="linkClick">
      <img :src="cardIcon" alt="" class="file-icons">
      <div class="label" v-if="full && card.highlight"><span class="top-hit" v-if="card.highlight"><icon name="bolt"></icon> Top Hit</span><span class="type"><!--<icon name="clock-o"></icon> Memory--></span></div>
      <h3 v-if="editing" style="margin: 15px 10px 10px;">Enter your card details:</h3>
      <component v-bind:is="format" :showPending="showPending" :content="content" :full="full" @update="update" :allCards="allCards" @contentUpdate="contentUpdate" @cardletClick="cardletClick" :auth="auth" :position="position" :highlight="highlight" :editing="editing"></component>
      <!-- <p class="spinner"><icon name="refresh" class="fa-spin fa-3x"></icon></p> -->
      <spinner></spinner>
    </section>

    <!-- Put this in a component! -->
    <a v-if="fileFormat" @click.stop="fileClick(file)" v-for="file, i in card.files" class="file">
      <div class="thumb" :style="{backgroundImage: 'url(' + (file.thumbnail || '/static/images/thumbnail.png') + ')'}"></div>
      <div class="name">
        <img v-if="getFileIcon(file)" :src="getFileIcon(file)" alt="">{{file.title}}
      </div>
    </a>

    <p class="message-block warning" v-if="warningMessage"><icon name="exclamation-circle"></icon>{{warningMessage}}
      <ibutton v-if="card.pendingDelete" class="small" icon="close" text="Cancel" :click="cancelPendingDelete"></ibutton>
    </p>
    <p class="message-block error" v-if="errorMessage"><icon name="exclamation-triangle"></icon>{{errorMessage}}</p>

    <!-- <a @click.stop="fileClick(file)" v-if="card.files && card.files.length && card.files[0]" v-for="file, i in card.files" class="file">
      <section class="file-card-body" v-if="fileFormat">
        <img :src="cardIcon" alt="" class="file-icons">
        <h3>{{card.title}}</h3>
        <p class="modified" v-if="card.modified"><icon name="check" v-if="new Date() - card.modified*1000 < 6*604800000"></icon> Updated: <span>{{lastUpdatedText}}</span></p>
      </section>
      <h4 v-if="!fileFormat"><vue-markdown :watches="['card.files']" :source="getFileTitle(file)" :linkify="false" :anchorAttributes="{target: '_blank'}"></vue-markdown></h4>
      <h5><img v-if="getService(card, file).icon" :src="getService(card, file).icon" alt="">{{getService(card, file).name}}</h5>
    </a> -->
    <p class="extractedFrom" v-if="full && card.extractedFrom">Extracted from <a v-bind:href="card.extractedFrom.url" target="_blank">{{card.extractedFrom.title}}</a></p>
    <footer>
      <p class="modified" v-if="card.modified"><icon name="check" v-if="new Date() - card.modified*1000 < 6*604800000"></icon> Updated: <span>{{lastUpdatedText}}</span></p>
      <topics v-if="full && content && Object.keys(content).length" :topics="content.topics" :editing="editing" @update="update"></topics>
      <section class="sources">
        <div class="source-individual from" v-if="!fileFormat && card.files && card.files.length && card.files[0]">
          <p>From:</p>
          <a @click.stop="fileClick(file)" v-for="file, i in card.files" class="source-link">
            <img v-if="getFileIcon(file)" :src="getFileIcon(file)" alt="">{{file.title}}
          </a>
        </div>
        <div class="source-individual in" v-if="card.files && card.files.length && card.files[0]">
          <p>In:</p>
          <a @click.stop="serviceClick(getService(card, file))" v-if="card.files && card.files.length && card.files[0]" v-for="file, i in card.files" class="source-link">
            <img v-if="getService(card, file).icon" :src="getService(card, file).icon" alt="">{{getService(card, file).name}}
          </a>
        </div>
      </section>
      <div class="sources" v-if="card.sources && card.sources.length">
        Source{{card.sources.length > 1 ? 's' : ''}}: <span v-for="source, i in card.sources"><a :href="source.url" target="_blank">{{source.name}}</a>{{i < card.sources.length - 1 ? ', ' : '' }}</span>
      </div>
      <div class="buttons save-buttons" v-if="editing">
        <ibutton class="small left cancel" icon="close" text="Cancel" :click="cancelEdit"></ibutton>
        <ibutton class="small right save" icon="check" :text="userIsSavvy ? 'Save Card' : 'Submit for Approval'" :click="saveEdit"></ibutton>
      </div>
      <!-- <div class="buttons reaction" v-if="!reacted && !explaain && !editing"> -->
        <!-- <p>How well did this match what you were looking for?</p> -->
        <!-- <button class="" @click.stop="react('great')">😍&nbsp;&nbsp; That's what I needed</button> -->
        <!-- <button class="" @click="react('ok')">😐</button>
        <button class="" @click="react('bad')">😢</button> -->
      <!-- </div> -->
      <!-- <div class="buttons reaction" v-if="reacted && !explaain && !editing">
        <p>Thanks for your feedback! Savvy uses this to learn and get smarter over time 🤖</p>
      </div> -->
      <div class="pending-toggle" v-if="!editing && card.pendingContent && Object.keys(card.pendingContent).length">
        <toggle-button v-model="showPending" :sync="true" :labels="true"/>
        <span>Show Pending Changes</span>
      </div>
    </footer>
    <div class="buttons small verify" v-if="userIsSavvy && card.pendingContent && Object.keys(card.pendingContent).length">
      <ibutton class="approve left" icon="check" :text="`Approve ${numberOfPendingChanges} Change` + (numberOfPendingChanges > 1 ? 's' : '')" :click="verify" :clickProps="true"></ibutton>
      <ibutton class="reject right" icon="close" text="Reject" :click="verify" :clickProps="false"></ibutton>
    </div>
    <div class="footer-logo">{{explaain ? 'Explaain' : 'Savvy'}}</div>
  </div>
</template>

<script>
import Vue from 'vue'
import Clipboards from 'vue-clipboards'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon.vue'
import VueMarkdown from 'vue-markdown'
import Draggable from 'vuedraggable'
import ToggleButton from 'vue-js-toggle-button'
import bAlert from 'bootstrap-vue/es/components/alert/alert'

import Spinner from '../spinner.vue'
import IconButton from './ibutton.vue'
import Cardlet from './cardlet.vue'
import Editable from './editable.vue'
import Search from './search.vue'
import Topics from './topics.vue'

import Basic from './formats/basic'
import Media from './formats/media'
import Issue from './formats/issue'
import Row from './formats/row'

Vue.use(Clipboards)

export default {
  props: [
    'explaain',
    'plugin',
    'data',
    'full',
    'allCards',
    'auth',
    'pendingApproval',
    'position',
    'highlight',
    'userRole',
    'userTopics',
    'creating',
    'highlightResult',
    'mode',
  ],
  components: {
    Icon,
    VueMarkdown,
    ibutton: IconButton,
    Cardlet,
    Editable,
    Draggable,
    Search,
    bAlert,
    Topics,
    Basic,
    Media,
    Issue,
    Row,
    Spinner,
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
      highlightedContent: {},
      loading: false,
      error: null,
      triedtoEdit: false,
    }
  },
  computed: {
    content: function() {
      // @TODO: figure out how listCards fit into this
      // const subLayers = ['pendingContent', 'listCards']
      console.log('THISTHIS')
      console.log(this.card)
      console.log(this.highlightedContent)
      const subLayers = ['pendingContent']
      const preferHighlight = (key, initialKey, loop) => {
        if (initialKey) {
          if (key)
            return this.highlightedContent && this.highlightedContent[initialKey] && this.highlightedContent[initialKey][key] ? this.highlightedContent[initialKey][key].value : this.card[initialKey][key]
          else
            return this.highlightedContent && this.highlightedContent[initialKey] && this.highlightedContent[initialKey].length
            ? this.highlightedContent[initialKey].map(item => item.value)
            : this.card[initialKey]
        } else
          return this.highlightedContent && this.highlightedContent[key] ? this.highlightedContent[key].value : this.card[key]
      }
      const content = {}
      Object.keys(this.card).filter(key => subLayers.indexOf(key) === -1).forEach(key => {
        content[key] = {
          value: key === 'listCards' ? preferHighlight(false, key).map((description, i) => {
            return {
              objectID: this.card.listItems.value ? this.card.listItems.value[i] : this.card.listItems[i],
              description: description
            }
          }) : preferHighlight(key),
          state: 'verified'
        }
      })
      if (this.card.pendingContent && Object.keys(this.card.pendingContent)) {
        Object.keys(this.card.pendingContent).forEach(key => {
          content[key] = {
            value: this.showPending ? preferHighlight(key, 'pendingContent') : preferHighlight(key),
            state: this.showPending ? 'pending' : 'reverted'
          }
        })
      }

      // subLayers.forEach(initialKey => {
      //   if (this.card[initialKey] && Object.keys(this.card[initialKey])) {
      //     Object.keys(this.card[initialKey]).forEach(key => {
      //       content[key] = {
      //         value: this.showPending ? preferHighlight(key, initialKey) : preferHighlight(key),
      //         state: this.showPending ? 'pending' : 'reverted'
      //       }
      //     })
      //   }
      // })
      return content
    },
    format: function() {
      const service = this.data.cells
      ? 'gsheets' : (this.data.fileType ? {
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'gdocs'
      }[this.data.fileType] || this.data.service
      : this.data.service)
      // const fileCardServices = [
      //   'gsheets'
      // ]
      if (this.data.imageUrl)
        return 'media'
      else if (this.data.type === 'file') {
        switch (service) {
          case 'sifter':
          case 'zoho':
            return 'issue'
          case 'gdocs':
            return 'doc'
          case 'gsheets':
            return 'sheet'
          case 'gslides':
            return 'slide'
          case 'gmail':
            return 'email'
          default:
            return 'basic'
        }
      } else {
        switch (service) {
          case 'gsheets':
            return 'row'
          default:
            return 'basic'
        }
      }
    },
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
      return {
        doc: '/static/images/icons/formats/doc.png',
        sheet: '/static/images/icons/formats/sheet.png',
        row: '/static/images/icons/formats/row.png',
        issue: '/static/images/icons/formats/bug.png',
        card: '/static/images/icons/formats/card.png',
        email: '/static/images/icons/formats/email.png',
      }[this.format] || {
        webpage: '/static/images/icons/formats/webpage.png',
        file: '/static/images/icons/formats/file.png',
      }[this.data.type] || {
        gmail: '/static/images/icons/formats/email.png',
        gdrive: '/static/images/icons/formats/doc.png',
        gdocs: '/static/images/icons/formats/doc.png',
        gslides: '/static/images/icons/formats/doc.png',
        dropbox: '/static/images/icons/formats/doc.png',
        trello: '/static/images/icons/formats/card.png',
      }[this.data.service] || (this.data.fileID ? '/static/images/icons/formats/file.png' : '/static/images/iconGrey.png')
    },
    fullText: function() {
      return (this.card.title ? this.card.title + '\n\n' : '') + this.text
        + (this.card.cardList && this.card.cardList.length ? '\n- ' + (this.card.cardList || []).map(item => item.description).join('\n- ') : '')
        + (this.card.cells && this.card.cells.length ? '\n- ' + (this.card.cells || []).filter(cell => cell.content.length).map(cell => cell.content).join('\n- ') : '')
      //  + this.listCards.map(function(listCard) {
      //   return '\n- ' + listCard.description
      // })
    },
    fontSize: function() {
      // const self = this
      // return 16 + 2 * Math.floor(Math.min(5, 100 / (self.text.length))) + 'px'
      return 16 + 'px'
    },
    errorMessage: function() {
      const self = this
      return self.error && self.error.message ? self.error.message : (!self.card || !Object.keys(self.card).length) && !self.loading ? 'No card found!' : null
    },
    warningMessage: function() {
      const self = this
      return self.card.pendingDelete ? 'This card is pending deletion' : (this.triedtoEdit ? 'Docs editing is coming soon! Try editing a Google Sheet card.' : null)
    },
    numberOfPendingChanges: function() {
      return Object.keys(this.card.pendingContent).filter(key => this.card.pendingContent[key] && this.card.pendingContent[key].length && this.card.pendingContent[key] !== this.card[key]).length
    },
    lastUpdatedText: function() {
      const daysOld = parseInt(Math.floor((new Date() - new Date(this.card.modified * 1000)) / (1000 * 60 * 60 * 24)))
      if (daysOld === 0)
        return 'Today'
      else if (daysOld === 1)
        return '1 Day Ago'
      else if (daysOld < 7)
        return daysOld + ' Days Ago'
      else if (daysOld < 10)
        return '1 Week Ago'
      else if (daysOld < 29)
        return parseInt(Math.round(daysOld / 7)) + ' Weeks Ago'
      else
        return new Date(this.card.modified * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(' 2018', '')
    },
    userIsSavvy: function () {
      return !!(this.userRole === 'admin' || (this.card && (!this.card.topics || !this.card.topics.length || (this.userTopics && typeof this.userTopics === 'object' && this.userTopics.constructor === Array && this.userTopics.filter(topic => this.card.topics.indexOf(topic) > -1).length))))
    },
    fileFormat: function () {
      return this.data.type === 'file' && ['sifter', 'zoho'].indexOf(this.data.service) === -1 && this.format !== 'media'
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
      if (val && self.content.listCards && self.content.listCards.value)
        self.content.listCards.value.forEach(function(listCard) {
          self.tempListCards[listCard.objectID] = JSON.parse(JSON.stringify(listCard))
        })
    }
  },
  created: function() {
    this.syncData()
    // @NOTE: Temporarily disabling highlightedContent, as it's breaking 'content'
    // this.highlightedContent = this.card._highlightResult || this.highlightResult
    Vue.use(ToggleButton)
    if (this.card.newlyCreated)
      this.editing = true
  },
  updated: function () {
    // @NOTE: Temporarily disabling highlightedContent, as it's breaking 'content'
    // this.highlightedContent = this.card._highlightResult || this.highlightResult
  },
  methods: {
    update: function(data) {
      console.log('update (card)', data)
      this.card[data.field] = data.value
    },
    getService(card, file) {
      const defaultService = {
        name: '📂 ' + (this && this.user && this.user.data && this.user.data.organisation && this.user.data.organisation.id ? this.user.data.organisation.id : 'Team') + ' Drive'
      }
      const services = {
        gdrive: {
          name: 'Google Drive',
          icon: '/static/images/icons/gdrive.png',
          url: 'https://drive.google.com/',
        },
        gdocs: {
          name: 'Google Drive',
          icon: '/static/images/icons/gdrive.png',
          url: 'https://drive.google.com/',
        },
        gsheets: {
          name: 'Google Drive',
          icon: '/static/images/icons/gdrive.png',
          url: 'https://drive.google.com/',
        },
        gslides: {
          name: 'Google Drive',
          icon: '/static/images/icons/gdrive.png',
          url: 'https://drive.google.com/',
        },
        gmail: {
          name: 'Gmail',
          icon: '/static/images/icons/gmail.png',
          url: 'https://mail.google.com/',
        },
        sifter: {
          name: 'Sifter',
          icon: '/static/images/icons/sifter.png'
        },
        confluence: {
          name: '📂 Confluence',
        },
        zoho: {
          name: 'Zoho',
          icon: '/static/images/icons/zoho.png'
        },
        gsites: {
          name: 'Google Sites',
          icon: '/static/images/icons/gsites.png'
        },
        trello: {
          name: 'Trello',
          icon: '/static/images/icons/trello.png',
          url: 'https://trello.com/',
        },
        dropbox: {
          name: 'Dropbox',
          icon: '/static/images/icons/dropbox.png',
          url: 'https://dropbox.com/',
        },
      }
      const fileTypes = {
        'application/vnd.google-apps.document': 'gdocs',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'gdocs',
        'application/vnd.google-apps.spreadsheet': 'gsheets',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'gsheets',
        'application/vnd.google-apps.presentation': 'gslides',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'gslides',
      }
      if (file && file.folder)
        return { name: '📂 ' + file.folder + ' Drive' }
      // else if (file && file.subService)
      //   return services[file.subService] || defaultService
      else if (file && file.service)
        return services[file.service] || defaultService
      // else if (card && card.subService)
      //   return services[card.subService] || defaultService
      else if (card && card.service)
        return services[card.service] || defaultService
      else if (card && (card.fileType || card.mimeType || file.fileType || file.mimeType))
        return services[fileTypes[(card.fileType || card.mimeType || file.fileType || file.mimeType)]] || defaultService
      else
        return defaultService
    },
    getFileIcon: function(file) {
      if (!file || (!file.mimeType && !file.fileType))
        return '/static/images/iconGrey.png'
      switch (file.mimeType || file.fileType) {
        case 'application/vnd.google-apps.document':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return '/static/images/icons/gdocs.png'
        case 'application/vnd.google-apps.spreadsheet':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          return '/static/images/icons/gsheets.png'
        case 'application/vnd.google-apps.presentation':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          return '/static/images/icons/gslides.png'
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
    },
    getFileTitle: function(file) {
      return this.format === 'issue' ? 'Issue #' + (this.card.integrationFields.key || this.card.integrationFields.number) : file && file.title ? file.title : ''
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
      console.log('cardletClick (card.vue)', card)
      card.parentCard = this.card
      if (!this.editing) this.$emit('cardClick', card)
    },
    fileClick: function (file) {
      this.$emit('fileClick', this.card, file)
    },
    serviceClick: function (service) {
      if (service && service.url)
        this.$emit('serviceClick', this.card, service)
    },
    createCard: function() {
      // Hi
    },
    editCard: function() {
      if (this.card.fileType !== 'application/vnd.google-apps.document')
        this.editing = true
      else
        this.triedtoEdit = true
    },
    deleteCard: function() {
      const self = this
      self.loading = true
      self.$emit('deleteCard', self.card.objectID, result => {
        console.log('callback successful', result)
        self.loading = false
        if (result.error) {
          self.error = result.error
        }
      }, err => {
        console.log('error returned', err)
        self.error = {
          err: err,
          message: 'Whoops! Something went wrong.'
        }
      })
    },
    cancelEdit: function() {
      const self = this
      self.syncData()
      self.editing = false
      self.error = null // @TODO: Brainstorm any situations where this isn't a good idea?
      // self.tempListCards = {} ????
      setTimeout(function() {
        self.syncData() // Shouldn't be necessary if data were properly being wtached deeply
      }, 10)
    },
    saveEdit: function(card) {
      // Can specify the 'card' argument to override what is saved (e.g. in cancelPendingDelete)
      const self = this
      self.editing = false
      self.loading = true
      setTimeout(function() {
        if (self.card.sources && self.card.sources.filter(source => source.name === 'Journalist').length === 0)
          self.card.sources.push({
            type: 'author',
            name: 'Journalist'
          })
        self.card.listCards = self.listCards
        if (self.content.listCards && self.content.listCards.value)
          self.content.listCards.value.forEach(function(listCard) {
            self.tempListCards[listCard.objectID] = listCard
          })
        self.$emit('updateCard', card || self.card, result => {
          console.log('callback successful', result)
          self.loading = false
          if (result.error) {
            self.error = result.error
            self.editing = true
          }
          self.tempListCards = {}
          // self.syncData() // Shouldn't be necessary if data were properly being wtached deeply
        }, function(err) {
          console.log('error returned', err)
          self.error = {
            err: err,
            message: 'Whoops! Something went wrong.'
          }
          self.editing = true
          self.tempListCards = {}
        })
        self.card = {}
      }, 5)
    },
    verify: function(approve) {
      console.log('verify', approve)
      const self = this
      const data = {
        objectID: self.card.objectID,
        approve: approve,
        callback: result => {},
      }
      self.editing = false
      self.loading = true
      self.$emit('verifyCard', data, function(result) {
        console.log('callback successful')
        self.loading = false
        if (result.error) {
          self.error = result.error
        }
      }, function(e) {
        console.log(e)
        self.tempListCards = {}
      })
    },
    contentUpdate: function(content) {
      const self = this
      Object.keys(content).forEach(key => {
        self.data[key] = content[key]
        self.card[key] = content[key]
      })
    },
    cancelPendingDelete: function() {
      const self = this
      const card = {
        objectID: self.card.objectID,
        pendingDelete: false,
      }
      this.saveEdit(card)
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
    react: function(reaction) {
      const self = this
      self.$emit('react', { reaction: reaction, card: self.card })
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
    margin: 10px;
    width: calc(100% - 60px);
    max-width: 380px;
    padding: 0;
    // border-radius: 10px;
    word-wrap: break-word;
    overflow-wrap: break-word;
    background: white;
    cursor: pointer;
    overflow: hidden;
    // transition: margin .3s, transform .3s;

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
    &.loading {
      div, img, p {
        opacity: 0.5;
      }
      .spinner {
        display: block;
        opacity: 1;
        padding: 20px 0;
      }
    }
    &:not(.editing) {
      .field {
        &.pending::after, &.reverted::after {
          display: block;
          font-size: 12px;
          margin-right: 8px;
          text-align: right;
          font-weight: normal;
          font-style: italic;
        }
        &.pending, &.reverted {
          border: solid 0px;
          border-right-width: 4px;
        }
        &.pending {
          border-color: orange;
          &::after {
            content: "Pending Update";
            color: orange;
          }
        }
        &.reverted {
          border-color: blue;
          &::after {
            content: "Most Recent Verified Content";
            color: blue;
          }
        }
      }
    }

    .spinner {
      display: none;
    }

    button {
      &.left {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        margin-right: -2px;
      }
      &.right {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        margin-left: -2px;
      }
      &.center {
        border-radius: 0;
        margin-left: -2px;
        margin-right: -2px;
      }
      &.cancel {
        background: #ffb6c9;
      }
      &.save {
        background: #b8ecc0;
      }
      &.delete:hover {
        background: #ffaaaa;
      }
      &.selected {
        background: #ddd;
      }
    }
    .buttons {
      bottom: 15px;
      left: 20px;
      margin: 65px 4px -45px;
      padding: 6px 12px;

      &:focus {
        outline:none;
      }
      &.reaction {
        position: relative;
        left: auto;
        text-align: center;

        button {
          margin: 15px 5px 0;
          font-size: 16px;
          padding: 5px 15px;
        }
      }
    }
    button.small, .buttons.small button {
      margin: -2px;
      font-size: 12px;
      padding: 0.5em 1em;
    }
    .buttons-top-right {
      position: absolute;
      top: 5px;
      right: 5px;
      margin: 5px;
      // margin: -5px -5px 10px 20px;
      button {
        display: none;
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

    .content {
      margin: 5px;
      padding: 10px;
      // margin-left: 50px;
      min-height: 60px;

      strong {
        font-weight: 800;
        font-style: normal;
        color: #888;
      }
      p {
        line-height: 1.5;
      }
      a {
        text-decoration: inherit;
        padding: 0 4px;
        border: 2px solid $explaainLink;
        background-color: $explaainLink;
        color: inherit;
        border-radius: 4px;

        &:hover {
          color: white;
          border: 2px solid $savvy;
          background-color: $savvy;

          strong {
            color: white;
          }
        }
      }

      img {
        max-width: calc(100% - 10px);
        border-radius: $radius;
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
      margin: 18px 5px 0 18px;
      max-width: 35px;
      max-height: 35px;
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
      float: right;
      font-size: 14px;
      // font-style: italic;
      text-align: right;
      color: #999;
      padding: 10px;
      margin: 10px 5px 5px;

      svg {
        color: #00cc00;
      }
      span {
        font-weight: bold;
      }
    }
    .content {
      .field:first-child {
        margin-left: 45px;
        margin-bottom: 15px;
      }
      .title {
        font-weight: bold;
        font-size: 1.2em;
      }
      .description ul {
        padding-left: 30px;
      }
    }
    a.file {
      @extend .block;
      display: block;
      margin: 25px;
      overflow: hidden;
      padding: 0px;
      transition: background-color .3s;
      color: inherit;
      text-decoration: inherit;

      &:hover {
        background: #f5f5f5;
      }

      .thumb {
        height: 150px;
        background-color: #f5f5f5;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        border-bottom: 1px solid #eee;
      }
      .name {
        padding: 10px;

        img {
          margin-top: -6px;
        }
      }

      section.file-card-body {
        overflow: hidden;
        padding: 5px;
        margin: 5px;

        > img.file-icons {
          height: 60px;
          max-height: none;
          max-width: none;
          padding-left: 0;
        }
        > h3 {
          min-height: 50px;
        }
      }
      img {
        height: 25px;
        float: left;
        margin: -8px 5px 0 -4px;
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
    button {
      &:hover {
        background: #eee;
      }
      &.approve {
        position: relative;
        margin-right: -1px;
        color: green;
        border-color: green;
        &:hover {
          color: white;
          background: green;
          opacity: 1;

          svg {
            color: white;
          }
        }

        svg {
          color: green;
        }
      }
    }
    footer {
      margin: 0 5px 5px;
      padding: 0 5px 55px;
      min-height: 25px;
      // -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.05);

      > p.modified {
        margin-top: 10px;
        padding-top: 0;
      }

      .sources {
        margin: 0 5px -45px;
        padding: 30px 5px 5px;
        font-size: 14px;

        .source-individual {
          display: inline-block;

          &:first-child {
            margin-top: -30px;
          }

          p {
            margin: 5px 5px 0;
            padding: 0;
          }
          a.source-link {
            @extend .block;
            display: inline-block;
            margin: 5px;
            padding: 10px 15px;

            &:hover {
              background: #f3f3f3;
            }

            img {
              margin: -5px 10px -2px 0;
              padding: 0;
              max-width: 30px;
              max-height: 25px;
            }
          }
        }

        a {
          color: inherit;
          text-decoration: none;
          font-weight: bold;

          &:hover {
            color: $savvy;
          }
        }
      }
    }
    // .pending {
    //   color: grey;
    //   font-size: 0.8em;
    // }
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
        margin-left: 5px;
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
      max-width: 480px;
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
  @media (min-width: 430px) {
    .explorer:not(.sidebar) .main-explorer .card:not(.cardlet) {
      margin: 10px calc(50% - 203px);
    }
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
</style>
