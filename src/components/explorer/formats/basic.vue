<template lang="html">
  <div class="content">
    <field label="title" :content="content.title" :editing="editing" @update="update"></field>
    <field label="description" :content="content.description" :editing="editing" @update="update" :truncate="full"></field>
    <list v-if="content.listItems || content.cells" :listItems="content.listItems || {value: content.cells.value.map((cell, i) => i), state: 'pending'}" :listCards="content.listCards || {value: content.cells.value.map(cell => { return { description: cell.content } }), state: 'pending'}" :full="full" :allCards="allCards" :editing="editing" @cardletClick="cardletClick"></list>
    <img :class="content.attachments && content.attachments.state" v-if="full && content.attachments && content.attachments.value && content.attachments.value[0]" v-bind:src="content.attachments.value[0].url">
  </div>
</template>

<script>
import Field from './../field.vue'
import List from './../list.vue'

export default {
  props: [
    'content',
    'full',
    'allCards',
    'position',
    'editing',
  ],
  components: {
    Field,
    List,
  },
  methods: {
    update: function(data) {
      this.$emit('update', data)
    },
    cardletClick: function(card) {
      console.log('cardletClick (basic.vue)', card)
      this.$emit('cardletClick', card)
    },
  }
}
</script>
