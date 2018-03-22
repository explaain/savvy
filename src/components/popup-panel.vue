<template lang="html">
  <div class="panel popup-panel">
    <h3 v-if="title">{{title}}</h3>
    <p v-if="description">{{description}}</p>
    <slot>

    </slot>
  </div>
</template>

<script>
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon.vue'

export default {
  props: [
    'title',
    'description',
  ],
  // data: function() {
  //   return {
  //
  //   }
  // },
  components: {
    Icon,
  },
  // methods: {
  // }
}
</script>

<style lang="scss">
@import '../styles/main.scss';


</style>
