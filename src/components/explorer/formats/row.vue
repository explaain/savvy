<template lang="html">
  <div class="content">
    <field v-show="!editing" class="row-header" label="description" :content="content.description" :editing="editing" @update="update" :truncate="full"></field>
    <list v-if="content.cells" :listItems="{value: content.cells.value.map((cell, i) => i), state: 'pending'}" :listCards="{value: content.cells.value.map((cell, i) => { if (!cell.objectID) cell.objectID = i; return cell }), state: 'pending'}" :full="full" :allCards="allCards" @update="update" :editing="editing"></list>
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
  }
}
</script>

<style lang="scss">
.row-header p {
  font-weight: bold;
}
</style>
