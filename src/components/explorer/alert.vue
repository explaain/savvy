<template lang="html">
  <transition name="alert">
    <div class="alert" v-if="show" placement="top" :type="type" width="400px">
      <strong><icon name="check"></icon>{{title}}</strong>
    </div>
  </transition>
</template>

<script>
  import 'vue-awesome/icons'
  import Icon from 'vue-awesome/components/Icon.vue'

  export default {
    props: [
      'show',
      'type',
      'duration',
      'title'
    ],
    components: {
      icon: Icon
    }
  }
</script>

<style lang="css">
  .alert {
    position: fixed;
    top: 10px;
    left: 40px;
    right: 40px;
    color: #3c763d;
    background-color: #dff0d8;
    border-color: #d6e9c6;
    padding: 15px;
    margin-bottom: 20px;
    border: 1px solid transparent;
    border-radius: 4px;
    text-align: center;
  }

  /*
   * The following styles are auto-applied to elements with
   * transition="modal" when their visibility is toggled
   * by Vue.js.
   *
   * You can easily play with the modal transition by editing
   * these styles.
   */

  .alert-enter {
    opacity: 0;
  }

  .alert-leave-active {
    opacity: 0;
  }

  .alert-enter .alert-container,
  .alert-leave-active .alert-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
</style>
