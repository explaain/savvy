<template>
  <div class="login">
    <button class="sign-in" :disabled="auth.authState == 'pending'" @click="auth.toggleSignIn()">{{authButtonText}}</button>
  </div>
</template>

<script>
  export default {
    name: 'Login',
    props: [
      'auth',
    ],
    data () {
      return {

      }
    },
    computed: {
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
    }
  }
</script>

<style lang="scss">
  @import '../styles/main.scss';

  div.login {
    display: flex;

    button {
      display: block;
      flex: 0 0 auto;
    }
  }
</style>
