<template>
  <div class="team">
    <header class="settings">
      <ibutton icon="refresh" text="Refresh" :click="getFiles"></ibutton>
    </header>
    <div class="files">
      <h1>Files Currently Processed as Cards:</h1>
      <table class="files">
        <tr v-for="file in files">
          <td class="icon"><icon name="file-word-o"></icon></td>
          <td>{{file.name}}</td>
        </tr>
      </table>
    </div>
  </div>

</template>

<script>
  import 'vue-awesome/icons'
  import Icon from 'vue-awesome/components/Icon.vue'
  import IconButton from './explorer/ibutton.vue'

  export default {
    name: 'Files',
    data () {
      return {
        files: []
      }
    },
    components: {
      ibutton: IconButton,
      icon: Icon
    },
    created: function() {
      this.getFiles()
    },
    methods: {
      getFiles: function() {
        // Dummy Data
        this.files = [
          {
            name: 'Competitor analysis'
          },
          {
            name: 'Marketing spec'
          },
          {
            name: 'Onboarding sheet'
          },
          {
            name: 'Persona Brief'
          }
        ]
      }
    }
  }
</script>

<style lang="scss">

  @import '../styles/main.scss';

</style>
