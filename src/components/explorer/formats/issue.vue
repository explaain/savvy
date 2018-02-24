conten<template lang="html">
  <div class="main" v-if="(full && content.highlight) || content.title || content.description || editing">
    <h3 style="margin: 15px 0 10px;">Enter your bug details:</h3>
    <div class="label" v-if="full && content.highlight"><span class="top-hit" v-if="content.highlight"><icon name="bolt"></icon> Top Hit</span><span class="type"><!--<icon name="clock-o"></icon> Memory--></span></div>
    <div class="content" @click="linkClick">
      <editable-markdown v-if="content.title || editing" :content="content.title" :editable="editing" @update="content.title = $event" placeholder="Title" class="title"></editable-markdown>
      <editable-markdown :content="content.description" :editable="editing" @update="content.description = $event" :style="{'font-size': fontSize }" placeholder="Description"></editable-markdown>
      <!-- <editable-markdown v-if="content.service === 'sifter'" :content="text" :editable="editing" @update="text = $event" :style="{'font-size': fontSize }" placeholder="Category"></editable-markdown> -->
      <draggable v-model="listCards" :options="{ disabled: !editing, handle: '.drag', draggable: '.cardlet' }" class="list" v-if="listCards.length || editing">
        <cardlet v-for="item in listCards" :editing="editing" :card="item" :key="item.objectID" @cardletClick="cardletClick" @remove="removeListItem"></cardlet>
        <section class="buttons" v-if="editing">
          <!-- <ibutton class="left" icon="plus" text="Create List Item" :click="addListItem"></ibutton>
          <ibutton class="right" icon="search" text="Insert Card Into List" :click="toggleListSearch" :class="{selected: showListSearch}"></ibutton> -->
          <search v-if="showListSearch" @select="addListItem" :allCards="allCards" :setCard="setCard" :auth="auth"></search>
        </section>
      </draggable>
      <img v-if="full && content.attachments && content.attachments[0]" v-bind:src="content.attachments[0].url">
    </div>
    <ul v-if="content.integrationFields.status" class="status" :class="content.integrationFields.status && content.integrationFields.status.toLowerCase()">
      <li class="open">Open</li>
      <li class="resolved">Resolved</li>
      <li class="closed">Closed</li>
    </ul>
    <p class="spinner" v-if="!content"><icon name="refresh" class="fa-spin fa-3x"></icon></p>
    <p class="extractedFrom" v-if="full && content.extractedFrom">Extracted from <a v-bind:href="content.extractedFrom.url" target="_blank">{{content.extractedFrom.title}}</a></p>
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
      content: {},
      tempListCards: {},
      showListSearch: false
    }
  },
  computed: {
    updating: function() {
      return this.content.updating || false
    },
    listCards: function() {
      const self = this
      const listCards = (self.content._highlightResult && self.content._highlightResult.listCards) || self.content.listCards || []
      return listCards.map((content, i) => {
        return {
          objectID: self.content.listItems[i],
          content: {
            description: content.value || content
          }
        }
      })
    },
    text: function() {
      const text = this.content.description || ''
      // if (!text || !text.length) console.log(text)
      const snippetLength = 100
      const snippetStart = Math.max(text.indexOf('**') - (snippetLength / 2), 0)
      return this.full ? text : text.trunc(snippetStart, snippetLength, true)
    },
    //   set: function(val) {
    //     this.content.description = val
    //   }
    // },
    fullText: function() {
      return (this.content.title ? this.content.title + '\n\n' : '') + this.text + this.listCards.map(function(listCard) {
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
    content: {
      handler: function(val) {
        const self = this
        if (Object.keys(val).filter(key => JSON.stringify(val[key]) !== JSON.stringify(self.data[key])).length) {
          console.log('content updated!')
          this.$emit('contentUpdate', val)
        }
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
      this.content = JSON.parse(JSON.stringify(this.data))
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
          description: ''
        }
      self.tempListCards[card.objectID] = card
      if (!self.content.listItems) Vue.set(self.content, 'listItems', [])
      self.content.listItems.push(card.objectID)
    },
    removeListItem: function(data) {
      const listIndex = this.content.listItems.indexOf(data.objectID) // Doesn't account for same item appearing twice in list
      this.content.listItems.splice(listIndex, 1)
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
    // > .open {
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
    // &.open, &.reopened {
    //   > .resolved {
    //     background: #eee;
    //     border-left-color: #eee;
    //     color: #eee;
    //   }
    // }
    // &.open, &.reopened, &.resolved {
    //   > .closed {
    //     background: #ddd;
    //     border-left-color: #ddd;
    //     color: #ddd;
    //   }
    // }
    // &.resolved, &.closed {
    //   > .open, .reopened {
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
    min-width: 250px;
    box-sizing: border-box;
    padding: 0;
    list-style-type: none;
    font-size: 13px;
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
      &.open, &.reopened {
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

    &.open li.open, &.reopened li.open {
      background: #EF9A3B;
      font-weight: bold;
      &:after {
        border-left-color: #EF9A3B;
      }
    }
    &.resolved li.resolved {
      background: #34BA9C;
      font-weight: bold;
      &:after {
        border-left-color: #34BA9C;
      }
    }
    &.closed li.closed {
      background: #409AD5;
      font-weight: bold;
      &:after {
        border-left-color: #409AD5;
      }
    }
  }
}
</style>
