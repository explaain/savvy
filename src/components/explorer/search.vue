<template lang="html">
  <div class="search-container">
    <input autofocus type="text" placeholder="Search for cards..." v-model="query" @keyup.enter="search"><br>
    <div class="results" v-on-clickaway="clearResults">
      <cardlet class="non-editable" v-for="result in results" :card="result" :key="result.objectID" :editing="false" @cardletClick="selectResult"></cardlet>
    </div>
  </div>
</template>

<script>
import 'vue-awesome/icons'
import { mixin as clickaway } from 'vue-clickaway'
import Cardlet from './cardlet.vue'
import ExplaainSearch from '../../plugins/explaain-search.js'

export default {
  props: [
    'allCards',
    'setCard',
    'getUser',
  ],
  mixins: [ clickaway ],
  data: function() {
    return {
      query: '',
      resultList: [],
      loading: false
    }
  },
  computed: {
    results: function() {
      const self = this
      return self.resultList.map(function(objectID) {
        return self.allCards[objectID]
      })
    }
  },
  components: {
    cardlet: Cardlet,
  },
  methods: {
    clearResults: function() {
      this.resultList = []
    },
    selectResult: function(card) {
      this.clearResults()
      this.$emit('select', card)
    },
    search: function() {
      const self = this
      self.loading = true
      ExplaainSearch.searchCards(self.getUser().uid, self.query, 6)
      .then(function(hits) {
        self.loading = false
        self.resultList = hits.map(function(card) { return card.objectID })
        hits.forEach(function(hit) {
          self.setCard(hit.objectID, hit)
        })
      }).catch(function(err) {
        console.log(err)
      })
    },
    searchTempLocal: function() {
      const self = this
      const hits = [{'intent': 'storeMemory', 'sender': '1627888800569309', 'listItems': ['620064670', '620064680', '620064690', '620064700'], 'hasAttachments': false, 'userID': '1627888800569309', 'dateUpdated': 1508426117869, 'objectID': '619948630', 'description': 'Inject Meeting Notes'}, {'intent': 'storeMemory', 'sender': '1627888800569309', 'hasAttachments': false, 'userID': '1627888800569309', 'dateUpdated': 1508426117257, 'objectID': '620064700', 'description': 'Keep all signed timesheets and receipts'}, {'intent': 'storeMemory', 'sender': '1627888800569309', 'hasAttachments': false, 'userID': '1627888800569309', 'dateUpdated': 1508426117225, 'objectID': '620064690', 'description': 'Business model => pro version only'}, {'intent': 'storeMemory', 'sender': '1627888800569309', 'hasAttachments': false, 'userID': '1627888800569309', 'dateUpdated': 1508426117152, 'objectID': '620064680', 'description': 'Languages'}, {'intent': 'storeMemory', 'sender': '1627888800569309', 'hasAttachments': false, 'userID': '1627888800569309', 'dateUpdated': 1508426116967, 'objectID': '620064670', 'description': 'Finish card creation & editing'}, {'intent': 'storeMemory', 'sender': '1627888800569309', 'hasAttachments': false, 'userID': '1627888800569309', 'dateCreated': 1508425700874, 'dateUpdated': 1508425700874, 'objectID': '651610261', 'description': 'Asdf'}, {'intent': 'storeMemory', 'sender': '1627888800569309', 'listItems': ['645331361', '610938240', '610473050'], 'hasAttachments': false, 'userID': '1627888800569309', 'dateUpdated': 1508421510702, 'objectID': '639442471', 'description': 'Here is a list'}, {'intent': 'storeMemory', 'sender': '1627888800569309', 'hasAttachments': false, 'userID': '1627888800569309', 'dateUpdated': 1508421509549, 'objectID': '610938240', 'description': 'This is a brand new list'}, {'intent': 'storeMemory', 'sender': '1627888800569309', 'hasAttachments': false, 'userID': '1627888800569309', 'dateUpdated': 1508421508835, 'objectID': '645331361', 'description': 'A serious item'}, {'intent': 'storeMemory', 'sender': '1627888800569309', 'hasAttachments': false, 'userID': '1627888800569309', 'dateUpdated': 1508421508588, 'objectID': '610473050', 'description': 'Another list item'}]
      // self.cards = hits
      self.resultList = hits.map(function(card) { return card.objectID })
      hits.forEach(function(hit) {
        self.setCard(hit.objectID, hit)
      })
    },
  }
}
</script>

<style lang="css">
  .results {
    position: absolute;
    margin: -21px 10px;
    z-index: 100;
  }
</style>
