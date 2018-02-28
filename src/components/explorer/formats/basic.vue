<template lang="html">
  <div class="content" @click="linkClick">
    <editable-markdown class="title field" :class="displayContent.title && displayContent.title.state" v-if="displayContent.title || editing" :content="displayContent.title.value" :editable="editing" @update="content.title = $event" placeholder="Title"></editable-markdown>
    <editable-markdown class="field" :class="displayContent.description && displayContent.description.state" :content="text" :editable="editing" @update="content.description = $event" :style="{'font-size': fontSize }" placeholder="Description"></editable-markdown>
    <draggable v-model="listCards" :options="{ disabled: !editing, handle: '.drag', draggable: '.cardlet' }" class="list" v-if="listCards.length || editing">
      <cardlet v-for="item in listCards" :editing="editing" :card="item" :key="item.objectID" @cardletClick="cardletClick" @remove="removeListItem"></cardlet>
      <section class="buttons" v-if="editing">
        <!-- <ibutton class="left" icon="plus" text="Create List Item" :click="addListItem"></ibutton>
        <ibutton class="right" icon="search" text="Insert Card Into List" :click="toggleListSearch" :class="{selected: showListSearch}"></ibutton> -->
        <search v-if="showListSearch" @select="addListItem" :allCards="allCards" :setCard="setCard" :auth="auth"></search>
      </section>
    </draggable>
    <img :class="displayContent.attachments && displayContent.attachments.state" v-if="full && displayContent.attachments && displayContent.attachments.value && displayContent.attachments.value[0]" v-bind:src="displayContent.attachments.value[0].url">
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
    'editing',
    'showPending',
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
      showListSearch: false,
    }
  },
  computed: {
    updating: function() {
      return this.content.updating || false
    },
    displayContent: function() {
      // @TODO: figure out how listCards fit into this
      const displayContent = {}
      Object.keys(this.content).filter(key => key !== 'pendingContent').forEach(key => {
        displayContent[key] = {
          value: this.content[key],
          state: 'verified'
        }
      })
      if (this.content.pendingContent && Object.keys(this.content.pendingContent)) {
        Object.keys(this.content.pendingContent).forEach(key => {
          displayContent[key] = {
            value: this.showPending ? this.content.pendingContent[key] : this.content[key],
            state: this.showPending ? 'pending' : 'reverted'
          }
        })
      }
      return displayContent
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
      const text = this.displayContent.description ? this.displayContent.description.value : ''
      const snippetLength = 100
      const snippetStart = Math.max(text.indexOf('**') - (snippetLength / 2), 0)
      return this.full ? text : text.trunc(snippetStart, snippetLength, true)
    },
    fullText: function() {
      return (this.displayContent.title ? this.displayContent.title + '\n\n' : '') + this.text + this.listCards.map(function(listCard) {
        return '\n- ' + listCard.description
      })
    },
    fontSize: function() {
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

.content {
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
}
</style>
