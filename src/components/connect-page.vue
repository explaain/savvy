<template>
  <div class="login">
    <!-- <h1>🙌 Welcome to Savvy!</h1> -->
    <!-- <h2>Sign in with below to get started</h2> -->
    <img class="image-main" src="../assets/connect.png" alt="">
    <h1>Connect Savvy to Your Content 🚀</h1>
    <h2>Use the Savvy integrations to securely search for files, emails and answers within them.</h2>
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
    <!-- <button class="connect" v-if="!doneMessage" @click="connectSource"><img src="../assets/gdrive.png" alt=""><span>Google Drive</span></button> -->
    <connect :services="services" :organisationID="organisationID" :autoService="autoService"></connect>
    <img class="compliance" src="../assets/aicpa.png" alt="">
    <img class="compliance" src="../assets/pci.png" alt="">
  </div>
</template>

<script>
  import IconButton from './explorer/ibutton.vue'
  import Connect from './connect.vue'

  export default {
    name: 'Login',
    data () {
      return {
        doneMessage: false,
        autoService: null,
        organisation: {},
        services: [
          {
            title: 'Google Drive',
            id: 'gdrive',
            logo: '/static/images/icons/gdrive.png',
          },
          {
            title: 'Trello',
            id: 'trello',
            logo: '/static/images/icons/trello.png',
          },
          {
            title: 'Dropbox',
            id: 'dropbox',
            logo: '/static/images/icons/dropbox.png',
          },
          {
            title: 'Gmail',
            id: 'gmail',
            logo: '/static/images/icons/gmail.png',
          },
          {
            title: 'Asana',
            id: 'asana',
            logo: '/static/images/icons/asana.png',
            comingSoon: true,
          },
          {
            title: 'Sifter',
            id: 'sifter',
            logo: 'https://www.pcmag.com/sm/pcmagus/photo/default/sifterlogo6_14fe.png',
            comingSoon: true,
          },
          {
            title: 'Zoho',
            id: 'zoho',
            logo: 'https://d7uddx54veb4a.cloudfront.net/wp-content/uploads/2016/10/logo-zoho.png',
            comingSoon: true,
          },
          {
            title: 'Confluence',
            id: 'confluence',
            logo: 'https://wac-cdn.atlassian.com/dam/jcr:a22c9f02-b225-4e34-9f1d-e5ac0265e543/confluence_rgb_slate.png',
            comingSoon: true,
          },
        ]
      }
    },
    components: {
      ibutton: IconButton,
      Connect,
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
      if (!this.organisation.id)
        this.organisation.id = getParameterByName('org')
      if (!this.autoService) {
        const serviceName = getParameterByName('service')
        var service = this.services.filter(service => service.id === serviceName)
        if (service.length)
          this.autoService = service[0]
      }
    },
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
    max-width: 800px;
    margin: auto;

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
