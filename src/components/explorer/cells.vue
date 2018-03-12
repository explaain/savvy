<template lang="html">
  <draggable v-model="listCards.value" :options="{ disabled: !editing, handle: '.drag', draggable: '.cardlet' }" class="list" v-if="listCards.value.length || editing">
    <cardlet v-for="item in (full || listFull || listCards.value.length <= 6 ? listCards.value : listCards.value.slice(0, 6).concat([{ objectID: 0, description: 'Show more...' }]))" :editing="editing" :card="item" :key="item.objectID" @cardletClick="cardletClick" @remove="removeListItem"></cardlet>
    <section class="buttons" v-if="editing">
      <!-- <ibutton class="left" icon="plus" text="Create List Item" :click="addListItem"></ibutton>
      <ibutton class="right" icon="search" text="Insert Card Into List" :click="toggleListSearch" :class="{selected: showListSearch}"></ibutton> -->
      <search v-if="showListSearch" @select="addListItem" :allCards="allCards" :setCard="setCard" :auth="auth"></search>
    </section>
  </draggable>
</template>

<script>
import Vue from 'vue'
import Clipboards from 'vue-clipboards'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon.vue'
import VueMarkdown from 'vue-markdown'
import Draggable from 'vuedraggable'
import IconButton from './ibutton.vue'
import Cardlet from './cardlet.vue'
import Editable from './editable.vue'
import EditableMarkdown from './editable-markdown.vue'
import Search from './search.vue'

Vue.use(Clipboards)

export default {
  props: [
    'listItems',
    'listCards',
    'full',
    'allCards',
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
      tempListCards: {},
      showListSearch: false,
      listFull: false,
    }
  },
  watch: {
    editing: function(val) {
      const self = this
      if (val)
        self.listCards.value.forEach(function(listCard) {
          self.tempListCards[listCard.objectID] = JSON.parse(JSON.stringify(listCard))
        })
    }
  },
  methods: {
    update: function(data) {
      console.log('update (basic)', data)
      this.$emit('update', data)
    },
    cardletClick: function(card) {
      if (card.objectID === 0) this.listFull = true
      else if (!this.editing) this.$emit('cardClick', card)
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
      if (!self.listItems) Vue.set(self.content, 'listItems', [])
      self.listItems.push(card.objectID)
    },
    removeListItem: function(data) {
      if (this.listItems) {
        const listIndex = this.listItems.indexOf(data.objectID) // Doesn't account for same item appearing twice in list
        this.listItems.splice(listIndex, 1)
      } else {
        return null
      }
    },
    toggleListSearch: function() {
      this.showListSearch = !this.showListSearch
    },
  }
}
</script>

<style lang="scss">
@import '../../styles/main.scss';

.list {
  margin: 20px 0 10px;

  section.buttons {
    margin: 10px 0;
  }
}
</style>
