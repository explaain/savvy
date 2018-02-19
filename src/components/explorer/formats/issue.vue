<template lang="html">
  <div class="main" v-if="(full && card.highlight) || card.content.title || card.content.description || editing">
    <h3 style="margin: 15px 0 10px;" v-if="editing && card.service !== 'sifter'">Enter your card details:</h3>
    <h3 style="margin: 15px 0 10px;" v-if="editing && card.service === 'sifter'">Enter your bug details:</h3>
    <div class="label" v-if="full && card.highlight"><span class="top-hit" v-if="card.highlight"><icon name="bolt"></icon> Top Hit</span><span class="type"><!--<icon name="clock-o"></icon> Memory--></span></div>
    <div class="content" @click="linkClick">
      <editable-markdown v-if="card.content.title || editing" :content="card.content.title" :editable="editing" @update="card.content.title = $event" placeholder="Title" class="title"></editable-markdown>
      <editable-markdown :content="text" :editable="editing" @update="text = $event" :style="{'font-size': fontSize }" placeholder="Description"></editable-markdown>
      <!-- <editable-markdown v-if="card.service === 'sifter'" :content="text" :editable="editing" @update="text = $event" :style="{'font-size': fontSize }" placeholder="Category"></editable-markdown> -->
      <draggable v-model="listCards" :options="{ disabled: !editing, handle: '.drag', draggable: '.cardlet' }" class="list" v-if="listCards.length || editing">
        <cardlet v-for="item in listCards" :editing="editing" :card="item" :key="item.objectID" @cardletClick="cardletClick" @remove="removeListItem"></cardlet>
        <section class="buttons" v-if="editing">
          <!-- <ibutton class="left" icon="plus" text="Create List Item" :click="addListItem"></ibutton>
          <ibutton class="right" icon="search" text="Insert Card Into List" :click="toggleListSearch" :class="{selected: showListSearch}"></ibutton> -->
          <search v-if="showListSearch" @select="addListItem" :allCards="allCards" :setCard="setCard" :auth="auth"></search>
        </section>
      </draggable>
      <img v-if="full && card.attachments && card.attachments[0]" v-bind:src="card.attachments[0].url">
    </div>
    <ul class="status" :class="card.integrationFields.status.toLowerCase()">
      <li class="opened">Open</li>
      <li class="resolved">Resolved</li>
      <li class="closed">Closed</li>
    </ul>
    <!-- <p class="modified" v-if="card.modified && card.service !== 'sifter'"><icon name="check" v-if="new Date() - card.modified*1000 < 6*604800000"></icon> Updated: <span>{{new Date(card.modified*1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(' 2018', '')}}</span></p> -->
    <!-- <p class="modified" v-if="card.service === 'sifter' && card.integrationFields && card.integrationFields.status"><icon name="check" v-if="card.integrationFields.status !== 'Open'"></icon><span>{{card.integrationFields.status}}</span></p> -->
    <p class="spinner" v-if="!card"><icon name="refresh" class="fa-spin fa-3x"></icon></p>
    <p class="extractedFrom" v-if="full && card.extractedFrom">Extracted from <a v-bind:href="card.extractedFrom.url" target="_blank">{{card.extractedFrom.title}}</a></p>
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
import IconButton from './../ibutton.vue'
import Cardlet from './../cardlet.vue'
import Editable from './../editable.vue'
import EditableMarkdown from './../editable-markdown.vue'
import Search from './../search.vue'

Vue.use(Clipboards)

export default {
  props: [
    'data',
    'full',
    'allCards',
    'setCard',
    'auth',
    'position',
    'highlight',
    'editing'
  ],
  components: {
    Icon,
    VueMarkdown,
    ibutton: IconButton,
    Cardlet,
    Editable,
    Draggable,
    Search,
    EditableMarkdown
  },
  data: function() {
    return {
      card: {},
      tempListCards: {},
      showListSearch: false
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
          content: {
            description: content.value || content
          }
        }
      })
    },
    // listCards: {
    //   get: function() {
    //     const self = this
    //     return self.card.content.listItems ? self.card.content.listItems.map(function(objectID) {
    //       return self.tempListCards[objectID] || JSON.parse(JSON.stringify(self.allCards[objectID] || null)) || { content: { description: 'Card Not Found' } }
    //     }) : []
    //   },
    //   set: function(newValue) { // Doesn't get called for deep events which could cause issues
    //     const self = this
    //     self.card.content.listItems = newValue.map(function(listCard) {
    //       self.tempListCards[listCard.objectID] = listCard // Is having this here good practice?
    //       return listCard.objectID
    //     })
    //   }
    // },
    text: {
      get: function() {
        const text = this.card.content.description || ''
        // if (!text || !text.length) console.log(text)
        const snippetLength = 100
        const snippetStart = Math.max(text.indexOf('**') - (snippetLength / 2), 0)
        return this.full ? text : text.trunc(snippetStart, snippetLength, true)
      },
      set: function(val) {
        this.card.content.description = val
      }
    },
    fullText: function() {
      return (this.card.content.title ? this.card.content.title + '\n\n' : '') + this.text + this.listCards.map(function(listCard) {
        return '\n- ' + listCard.content.description
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
    log.debug(this.data.objectID)
    this.syncData()
  },
  methods: {
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
    cardletClick: function(card) {
      if (!this.editing) this.$emit('cardClick', card)
    },
    addListItem: function(card) {
      console.log(card)
      const self = this
      if (!card)
        card = {
          objectID: 'TEMP_' + Math.floor(Math.random() * 10000000000),
          intent: 'store',
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
@import '../../../styles/main.scss';

.main {
  margin: 5px;
  margin-left: 50px;
  padding: 5px;
  min-height: 60px;

  label {
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 600;
    margin-left: 5px;
    margin-top: 20px;
    color: #999;
  }

  .content {
    // @extend .blockSpacing;
    // margin: 5px;
    // padding: 5px;

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
      border-radius: 5px;
    }
    .title {
      font-weight: bold;
      font-size: 1.2em;
    }
  }
  .status {
    // > div {
    //   // display: inline-block;
    //   // width: calc(33% - 5px);
    //   // margin: 0;
    //   // font-weight: bold;
    //   // text-transform: uppercase;
    //   // text-align: center;
    //   // padding: 10px;
    //   // font-size: 14px;
    // }
    // > .opened {
    //   background: #EF9A3B;
    //   border-left-color: #EF9A3B;
    //   color: #873817;
    // }
    // > .resolved {
    //   background: #34BA9C;
    //   border-left-color: #34BA9C;
    //   color: #04450E;
    // }
    // > .closed {
    //   background: #409AD5;
    //   border-left-color: #409AD5;
    //   color: #004738;
    // }
    //
    // &.opened, &.reopened {
    //   > .resolved {
    //     background: #eee;
    //     border-left-color: #eee;
    //     color: #eee;
    //   }
    // }
    // &.opened, &.reopened, &.resolved {
    //   > .closed {
    //     background: #ddd;
    //     border-left-color: #ddd;
    //     color: #ddd;
    //   }
    // }
    // &.resolved, &.closed {
    //   > .opened, .reopened {
    //     color: #EF9A3B;
    //   }
    // }
    // &.closed {
    //   > .resolved {
    //     color: #34BA9C;
    //   }
    // }
  }

  .status {
    display: block;
    height: 52px;
    box-sizing: border-box;
    padding: 0;
    list-style-type: none;
    font-family: arial;
    font-size: 12px;
    clear: both;
    line-height: 1em;
    margin: 0 24px 0 5px;
    text-align: center;

    li {
      box-sizing: border-box;
      float: left;
      padding: 10px 0 10px 15px;
      background: #333;
      color: #fff;
      position: relative;
      // border-top: 1px solid #666;
      // border-bottom: 1px solid #666;
      width: 32%;
      margin: 10px 1px;

      &:before {
        content: '';
        border-left: 16px solid #fff;
        border-top: 16px solid transparent;
        border-bottom: 16px solid transparent;
        position: absolute;
        top: 0;
        left: 0;
      }
      &:after {
        content: '';
        border-left: 16px solid #333;
        border-top: 16px solid transparent;
        border-bottom: 16px solid transparent;
        position: absolute;
        top: 0;
        left: 100%;
        z-index: 20;
      }
      &.opened, &.opened {
        background: #888;
        &:after {
          border-left-color: #888;
        }
      }
      &.resolved {
        background: #999;
        &:after {
          border-left-color: #999;
        }
      }
      &.closed {
        background: #aaa;
        &:after {
          border-left-color: #aaa;
        }
      }
    }

    &.opened li.opened, &.reopened li.opened {
      background: #EF9A3B;
      &:after {
        border-left-color: #EF9A3B;
      }
    }
    &.resolved li.resolved {
      background: #34BA9C;
      &:after {
        border-left-color: #34BA9C;
      }
    }
    &.closed li.closed {
      background: #409AD5;
      &:after {
        border-left-color: #409AD5;
      }
    }
  }
}
</style>
