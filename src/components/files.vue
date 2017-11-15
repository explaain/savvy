<template>
  <div class="team">
    <header class="settings">
      <ibutton icon="refresh" text="Refresh" :click="getFiles"></ibutton>
    </header>
    <div class="files">
      <h1>List of Files</h1>
      <table>
        <tr v-for="file in files">
          <td>{{file.name}}</td>
        </tr>
      </table>
    </div>
  </div>

</template>

<script>
  import IconButton from './explorer/ibutton.vue'

  export default {
    name: 'Files',
    data () {
      return {
        files: []
      }
    },
    components: {
      ibutton: IconButton
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
