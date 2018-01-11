<template>
  <div class="login">
    <!-- <h1>🙌 Welcome to Savvy!</h1> -->
    <!-- <h2>Sign in with below to get started</h2> -->
    <img class="image-main" src="../assets/connect.png" alt="">
    <h1>Connect Savvy to Google Drive 🚀</h1>
    <h2>Use the Savvy + Google Drive integration to securely search for files and answers within files, directly from within Slack.</h2>
    <!-- <div>Sign in to <input v-if="noOrg" type="text" v-model="organisationID" placeholder="myorg"> <span v-if="!noOrg"></span>.heysavvy.com</div> -->
    <!-- <button :disabled="auth.authState == 'pending'" @click="auth.toggleSignIn()">{{authButtonText}}</button> -->
    <p style="font-style: italic">
      "What are our brand guidelines?"&nbsp;&nbsp;●&nbsp;&nbsp;
      "Where is the privacy policy?"&nbsp;&nbsp;●&nbsp;&nbsp;
      "How do we issue a refund?"
    </p>
    <button class="connect" @click="connectSource"><img src="../assets/gdrive.png" alt=""><span>Google Drive</span></button>
    <img class="compliance" src="../assets/aicpa.png" alt="">
    <img class="compliance" src="../assets/pci.png" alt="">
  </div>
</template>

<script>
/* global Kloudless */
  import IconButton from './explorer/ibutton.vue'
  import axios from 'axios'
  import '../scripts/kloudless.authenticator.js'

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
    components: {
      ibutton: IconButton,
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
    },
    methods: {
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
        if (!self.addingSource) {
          self.addingSource = true
          // axios.post('http://localhost:5000/add-source', {
          axios.post('//savvy-nlp--staging.herokuapp.com/add-source', {
            organisationID: self.organisation.id,
            source: result
          }).then(res => {
            self.addingSource = false
            console.log(res.data.results)
          }).catch(e => {
            self.addingSource = false
            console.log(e)
          })
        }
      },
    }
  }
</script>

<style lang="scss">
  @import '../styles/main.scss';

  div.login {
    // display: flex;
    // padding-top: 50px;
    text-align: center;

    > div {
      @extend .blockSpacing;
    }
    h1, h2 {
      text-align: center;
    }
    input {
      text-align: right;
    }
    button {
      display: block;
      margin: auto;
      // flex: 0 0 auto;

      img {
        display: block;
        float: left;
        max-height: 40px;
      }
      span {
        display: block;
        padding: 10px 5px 10px 52px;
      }
    }
    button.connect {
      margin-top: 40px;
    }
    img.image-main {
      max-width: 250px;
    }
    img.compliance {
      max-width: 40px;
      margin: 15px 5px;
    }
  }
</style>
