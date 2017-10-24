<template lang="html">
  <button type="button" @click="clickEvent">
    <icon :name="icon"></icon>
    {{text}}
  </button>
</template>

<script>
  import 'vue-awesome/icons'
  import Icon from 'vue-awesome/components/Icon.vue'

  export default {
    props: [
      'icon',
      'text',
      'click'
    ],
    components: {
      icon: Icon
    },
    data: function() {
      return {}
    },
    methods: {
      clickEvent: function() {
        if (this.click) {
          this.click()
        }
      }
    }
  }
</script>

<style lang="css">
</style>
