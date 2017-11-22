<template>
  <div class="join">
    <span v-if="noOrg"><input autofocus type="text" v-model="organisationID" placeholder="myorg">.heysavvy.com</span>
    <button :disabled="auth.authState == 'pending'" @click="joinOrg">Join <b>{{organisationID}}</b> organisation</button>
    <div class="error" v-if="errorMessage.length">{{errorMessage}}</div>
  </div>
</template>

<script>
  // This page expects the user to be logged in, and then allows them to confirm the organisation they're trying to join
  export default {
    name: 'Join',
    props: [
      'organisation',
      'auth',
    ],
    data () {
      return {
        noOrg: true,
        errorMessage: ''
      }
    },
    computed: {
      organisationID: {
        get: function() {
          return this.organisation.id
        },
        set: function(val) {
          this.organisation.id = val
        }
      },
    },
    created: function() {
      if (this.organisationID)
        this.noOrg = false
    },
    methods: {
      joinOrg: function() {
        const self = this
        self.auth.joinOrg(self.organisationID)
        .then(res => {})
        .catch(e => {
          // Unable to join organisation, probably cos there's no invite
          this.errorMessage = "Unfortunately you're not yet invited to this organisation - ask your team manager to invite you!"
        })
      }
    }
  }
</script>

<style lang="scss">
  @import '../styles/main.scss';

  div.join {
    input {
      text-align: right;
    }
    .error {
      @extend .blockSpacing;
      color: red;
    }
  }
</style>
