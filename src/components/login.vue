<template>
  <div class="login">
    <!-- <div>Sign in to <input v-if="noOrg" type="text" v-model="organisationID" placeholder="myorg"> <span v-if="!noOrg"></span>.heysavvy.com</div> -->
    <button :disabled="auth.authState == 'pending'" @click="auth.toggleSignIn()">{{authButtonText}}</button>
  </div>
</template>

<script>
  export default {
    name: 'Login',
    props: [
      'organisation',
      'auth',
    ],
    data () {
      return {
        noOrg: true
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
      authButtonText: function() {
        const self = this
        var text
        switch (self.auth.authState) {
          case 'loggedIn':
            text = 'Sign out'
            break
          case 'loggedOut':
            text = 'Sign in with Google'
            break
          case 'pending':
            text = 'Working...'
            break
        }
        return text
      }
    },
    created: function() {
      if (this.organisationID)
        this.noOrg = false
    }
  }
</script>

<style lang="scss">
  @import '../styles/main.scss';

  div.login {
    // display: flex;
    // text-align: center;

    >div {
      @extend .blockSpacing;
    }
    input {
      text-align: right;
    }
    button {
      display: block;
      // flex: 0 0 auto;
    }
  }
</style>
