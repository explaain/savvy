<template lang="html">
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container" v-on-clickaway="away">

          <div class="modal-header">
            <slot name="header">
              Please enter your new memory
            </slot>
          </div>

          <div class="modal-body">
            <!-- <slot name="body">
              default body
            </slot> -->
            <textarea v-model="data.text" rows="6" placeholder="My secret superpower is invisibility"></textarea>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              <!-- default footer -->
              <button class="modal-default-button" @click="submitEvent">
                <icon name="check"></icon>
                Done
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  import 'vue-awesome/icons'
  import Icon from 'vue-awesome/components/Icon.vue'
  import { mixin as clickaway } from 'vue-clickaway'

  export default {
    props: [
      'submit',
      'data'
    ],
    mixins: [
      clickaway
    ],
    components: {
      icon: Icon
    },
    data: function() {
      return {}
    },
    methods: {
      submitEvent: function() {
        this.$emit('close')
        this.$emit('submit', this.data)
      },
      away: function() {
        this.$emit('close')
      }
    }
  }
</script>

<style lang="css">
  .modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
    display: table;
    transition: opacity .3s ease;
  }
  .explorer.sidebar .modal-mask {
    width: 50%;
  }

  .modal-wrapper {
    display: table-cell;
    vertical-align: middle;
  }

  .modal-container {
    max-width: 360px;
    width: calc(100% - 120px);
    margin: 0px auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
    transition: all .3s ease;
  }

  .modal-header h3 {
    margin-top: 0;
  }

  .modal-body {
    margin: 20px 0;
  }

  .modal-body textarea {
    width: calc(100% - 60px);
    resize: none;
  }

  .modal-footer {
    text-align: center;
  }

  .modal-default-button {
    /*float: right;*/
  }

  /*
   * The following styles are auto-applied to elements with
   * transition="modal" when their visibility is toggled
   * by Vue.js.
   *
   * You can easily play with the modal transition by editing
   * these styles.
   */

  .modal-enter {
    opacity: 0;
  }

  .modal-leave-active {
    opacity: 0;
  }

  .modal-enter .modal-container,
  .modal-leave-active .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
</style>
