<template lang="html">
  <div class="content">
    <field v-show="!editing" class="row-header title" label="description" :content="content.description" :editing="editing" @update="update" :truncate="full"></field>
    <list v-if="content.cells" :listItems="{value: content.cells.value.map((cell, i) => i), state: 'pending'}" :listCards="{value: content.cells.value.map((cell, i) => { if (!cell.objectID) cell.objectID = i; return cell }), state: 'pending'}" :full="full" :allCards="allCards" @update="update" @cardletClick="cardletClick" :editing="editing"></list>
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
      console.log('update (row)', data)
      if (data.field === 'list') data.field = 'cells'
      this.$emit('update', data)
    },
    cardletClick: function(card) {
      console.log('cardletClick (row.vue)', card)
      this.$emit('cardletClick', card)
    },
  }
}
</script>

<style lang="scss">
.row-header {
  min-height: 30px;

  p {
    font-weight: bold;
  }
}
</style>
