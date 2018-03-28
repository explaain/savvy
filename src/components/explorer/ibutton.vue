<template lang="html">
  <button v-if="click" type="button" class="btn" v-bind:href="link" @click.stop="clickEvent"> <!-- Have added "stop" so that the popup doesn't close - hopefully this won't have any knock-on effects -->
    <icon v-if="icon" :name="icon"></icon>
    <img class="icon" v-if="image" :src="image" alt="">
    {{text}}
  </button>
  <a class="btn" v-else v-bind:href="link" :target="samePage ? '' : '_blank'"> <!-- Have added "stop" so that the popup doesn't close - hopefully this won't have any knock-on effects -->
    <icon v-if="icon" :name="icon"></icon>
    <img class="icon" v-if="image" :src="image" alt="">
    {{text}}
  </a>
</template>

<script>
  import 'vue-awesome/icons'
  import Icon from 'vue-awesome/components/Icon.vue'

  export default {
    props: [
      'icon',
      'image',
      'text',
      'click',
      'clickProps',
      'link',
      'samePage',
    ],
    components: {
      icon: Icon
    },
    data: function() {
      return {}
    },
    methods: {
      clickEvent: function() {
        const self = this
        if (self.click) {
          if (self.clickProps !== undefined)
            self.click(self.clickProps)
          else
            self.click()
        }
      }
    }
  }
</script>

<style lang="scss">
  .btn {
    > img.icon {
      height: 1.4em;
      margin: -4px 6px 0 0;
    }
  }
  .fa-icon {
    margin-right: 0.25em;
  }
</style>
