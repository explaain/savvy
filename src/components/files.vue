<template>
  <div class="files">
    <header class="files-settings">
      <!-- <ibutton icon="cloud" text="Connect to Your Files" :click="toggleConnect"></ibutton> -->
      <!-- <ibutton icon="refresh" text="Refresh" :click="getFiles"></ibutton> -->
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
          <td>{{file.title}}</td>
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
    props: [
      'organisation',
      'auth',
      'files',
    ],
    data () {
      return {
        showingConnect: false,
        addingSource: false
      }
    },
    components: {
      ibutton: IconButton,
      icon: Icon
    },
  }
</script>

<style lang="scss">
@import '../styles/main.scss';

table.files {
  text-align: left;
}
</style>
