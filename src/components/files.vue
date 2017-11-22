<template>
  <div class="files">
    <header class="files-settings">
      <ibutton icon="cloud" text="Connect to Your Files" :click="toggleConnect"></ibutton>
      <ibutton icon="refresh" text="Refresh" :click="getFiles"></ibutton>
      <form class="new-user" v-if="showingConnect">
        <ibutton icon="google" text="Google Drive" :click="inviteNewUser"></ibutton>
        <ibutton icon="glass" text="Confluence" :click="inviteNewUser"></ibutton>
      </form>
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
        files: [],
        showingConnect: false
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
      toggleConnect: function() {
        this.showingConnect = !this.showingConnect
      },
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
