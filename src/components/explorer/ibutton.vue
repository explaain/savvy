<template lang="html">
  <button type="button" @click.stop="clickEvent"> <!-- Have added "stop" so that the popup doesn't close - hopefully this won't have any knock-on effects -->
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

<style lang="scss">
  .fa-icon {
    margin-right: 0.25em;
  }
</style>
