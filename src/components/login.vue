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
    <div class="done-message" v-if="doneMessage">
      Thanks for connecting up your Google Drive! We're indexing your content right now and it'll be ready for you on Slack within a few minutes.
    </div>
    <button class="connect" v-if="!doneMessage" @click="connectSource"><img src="../assets/gdrive.png" alt=""><span>Google Drive</span></button>
    <img class="compliance" src="../assets/aicpa.png" alt="">
    <img class="compliance" src="../assets/pci.png" alt="">
  </div>
</template>

<script>
/* global Kloudless */
  import LogRocket from 'logrocket'
  import IconButton from './explorer/ibutton.vue'
  import axios from 'axios'
  // import '../scripts/kloudless.authenticator.js'

  export default {
    name: 'Login',
    props: [
      'organisation',
      'auth',
    ],
    data () {
      return {
        noOrg: true,
        doneMessage: false
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
        self.doneMessage = true
        if (!self.addingSource) {
          self.addingSource = true
          // axios.post('http://localhost:5050/add-source', {
          axios.post('//savvy-nlp--staging.herokuapp.com/add-source', {
            organisationID: self.organisation.id === 'connect' ? getParameterByName('org') : self.organisation.id,
            superService: 'kloudless',
            source: result
          }).then(res => {
            self.addingSource = false
            console.log(res.data.results)
          }).catch(err => {
            self.addingSource = false
            console.error('Error Adding Source', err)
            LogRocket.captureMessage('Error Adding Source', {
              extra: {
                err: err,
                data: result
              }
            })
            self.message = {
              text: 'Something went wrong indexing your files!',
              type: 'error'
            }
          })
        }
      },
    }
  }

  function getParameterByName(name, url) {
    if (!url) url = window.location.href
    name = name.replace(/[[\]]/g, '\\$&')
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
    var results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
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
    .done-message {
      background: #ccffcc;
      border-radius: 10px;
      color: #006600;
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
