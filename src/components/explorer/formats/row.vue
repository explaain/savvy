<template lang="html">
  <div class="content">
    <field class="row-header" label="description" :content="content.description" :editing="editing" @update="update" :truncate="full"></field>
    <list v-if="content.cells" :listItems="{value: content.cells.value.map((cell, i) => i), state: 'pending'}" :listCards="{value: content.cells.value, state: 'pending'}" :full="full" :allCards="allCards" :editing="editing"></list>
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
  }
}
</script>

<style lang="scss">
.row-header p {
  font-weight: bold;
}
</style>
