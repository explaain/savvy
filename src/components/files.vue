<template>
  <div class="files">
    <header class="files-settings">
      <ibutton icon="cloud" text="Connect to Your Files" :click="toggleConnect"></ibutton>
      <ibutton icon="refresh" text="Refresh" :click="getFiles"></ibutton>
      <form class="new-user" v-if="showingConnect">
        <ibutton icon="google" text="Google Drive" :click="connectSource"></ibutton>
        <ibutton icon="glass" text="Confluence"></ibutton>
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
/* global Kloudless */
  import 'vue-awesome/icons'
  import Icon from 'vue-awesome/components/Icon.vue'
  import axios from 'axios'
  import '../scripts/kloudless.authenticator.js'
  import IconButton from './explorer/ibutton.vue'

  export default {
    name: 'Files',
    props: [
      'organisation',
      'auth'
    ],
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
      connectSource: function() {
        const self = this
        const params = {
          'client_id': '245u1N7lejDTHB0VtkNReEIpUItQLEs67I20xL0XD5DN0QDj',
          'scope': 'gdrive:normal.storage'
        }
        const auth = Kloudless.authenticator(null, params, self.addSource)
        auth.launch()
      },
      addSource: function(result) {
        console.log(result)
        const self = this
        axios.post('http://localhost:5000/add-source', {
          // axios.post('http://savvy-nlp--staging.herokuapp.com/add-source', {
          organisationID: self.organisation.id,
          source: result
        }).then(res => {
          console.log(res.data.results)
        }).catch(e => {
          console.log(e)
        })
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
