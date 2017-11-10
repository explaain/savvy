<template>
  <div class="team">
    <div class="files">
      <h1>Settings</h1>
      <p>Name: {{user.data.name}}</p>
      <p>Email: {{user.data.email}}</p>
    </div>
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
          name: 'Owen Jones',
          email: 'owen@jon.es'
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
