<template>
  <div class="settings">
    <h1>Profile Settings</h1>
    <div><b>First Name:</b> <input v-model="user.data.name.first"></div>
    <div><b>Last Name:</b> <input v-model="user.data.name.last"></div>
    <div><b>Email Address:</b> <input v-model="user.data.email"></div>
    <button type="button" name="button">Save Changes</button>
  </div>
</template>

<script>
export default {
  name: 'Files',
  props: {
    user: {
      type: Object,
      default: {
        uid: '01234',
        data: {
          name: {
            first: 'Matthew',
            last: 'Morley'
          },
          email: 'matt@explaain.com'
        }
      }
    }
  },
  data () {
    return {

    }
  },
  created: function() {
    this.getSettings()
  },
  methods: {
    getSettings: function() {

    }
  }
}
</script>

<style lang="scss">

  @import '../styles/main.scss';

  .settings {
    @extend .block;
    padding: 30px;
  }

  .routerView > .settings > div, .routerView > .settings > h1 {
    // @extend .blockSpacing;
    margin: 0 10px;
    padding: 10px;
  }

</style>
