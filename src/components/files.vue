<template>
  <div class="team">
    <button type="button" @click="getFiles">Refresh</button>
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
export default {
  name: 'Files',
  data () {
    return {
      files: []
    }
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
