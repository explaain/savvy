<template lang="html">
  <div class="panel connect" :class="{'loading': loading}">
    <a class="service auto-service" :class="{'coming-soon': autoService.comingSoon}" v-if="autoService" @click="connectSource(autoService)">
      <h3>Click to connect to {{autoService.title}}</h3>
      <div class="logo">
        <span class="helper"></span>
        <img :src="autoService.logo" alt="">
      </div>
    </a>
    <h3>Connect to all your work apps here</h3>
    <p class="subheading">We'll index your 50 most recent files/boards/emails for each service you connect. <a href="https://heysavvy.drift.com/matt" target="_blank">Get&nbsp;in&nbsp;touch</a> to request more.</p>
    <section class="services">
      <a class="service" :class="{'coming-soon': service.comingSoon}" v-for="service in services" @click="connectSource(service)">
        <div class="logo">
          <span class="helper"></span>
          <img :src="service.logo" alt="">
        </div>
        <p>{{service.title}}</p>
      </a>
      <spinner v-if="loading"></spinner>
      <!-- <p class="spinner" v-if="loading"><img src="static/iconGrey.png" alt=""> <icon name="refresh" class="fa-spin fa-3x"></icon></p> -->
      <p v-if="message && message.text" class="message-block" :class="message.type || 'success'" ></icon>{{message.text}}</p>
    </section>
  </div>
</template>

<script>
// /* global Kloudless, window, gapi */
/* global Kloudless, window */
import LogRocket from 'logrocket'
import Raven from 'raven-js'
import axios from 'axios'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon.vue'
import '../scripts/jquery.js'
// import '../scripts/google.js'
import '../scripts/kloudless.authenticator.js'
import '../scripts/trello.js'
import Spinner from './spinner.vue'
// require('log-suppress').init(console)

var googleAuth2 = null

export default {
  props: [
    'services',
    'organisationID',
    'autoService',
  ],
  data: function() {
    return {
      loading: false,
      message: null,
      authPopup: null,
      googleAuth2: null,
    }
  },
  components: {
    Icon,
    Spinner,
  },
  created: function () {
    // console.log('gapi')
    // console.log(gapi)
    // console.log('gapi.load')
    // console.log(gapi.load)
    // gapi.load('auth2', function() {
    //   console.log('gapi.auth2')
    //   console.log(gapi.auth2)
    //   console.log('gapi.auth2.init')
    //   console.log(gapi.auth2.init)
    //   googleAuth2 = gapi.auth2.init({ // eslint-disable-line
    //     client_id: '704974264220-lmbsg98tj0f3q09lv4tk6ha46flit4f0.apps.googleusercontent.com',
    //     // Scopes to request in addition to 'profile' and 'email'
    //     // scope: 'https://www.googleapis.com/auth/gmail.readonly'
    //   })
    //   console.log('googleAuth2')
    //   console.log(googleAuth2)
    // })
  },
  methods: {
    connectSource: function(service) {
      console.log('service')
      console.log(service)
      if (service.comingSoon)
        return
      switch (service.id) {
        case 'gdrive':
        case 'dropbox':
          const params = {
            'client_id': '245u1N7lejDTHB0VtkNReEIpUItQLEs67I20xL0XD5DN0QDj',
            'scope': service.id + ':normal.storage',
          }
          const auth = Kloudless.authenticator(null, params, this.fromKloudless)
          auth.launch()
          break
        case 'trello':
          window.addEventListener('message', this.useTokenFromPopup, { once: true })
          console.log('added event listener')
          this.authPopup = window.open('https://trello.com/1/authorize?expiration=never&name=Savvy&scope=read,write&response_type=token&key=40bf04080255c5fe6b5e9643a9b9011b&return_url=' + encodeURIComponent(window.location.href) + '%2F&callback_method=postMessage', '_blank')
          // Trello.authorize({ type: 'popup', name: 'Savvy', scope: { read: true, write: true, account: false }, expiration: 'never', success: this.addSource1, error: this.errorAddingSource })
          break
        case 'gmail':
          if (googleAuth2)
            googleAuth2.grantOfflineAccess({ scope: 'https://www.googleapis.com/auth/gmail.readonly' }).then(this.receiveGmailCode)
          else
            window.open('https://connect.heysavvy.com/?org=' + this.organisationID + '&service=gmail')
          break
        case 'asana':
          // window.addEventListener('message', this.useTokenFromPopup, { once: true })
          // console.log('added event listener')
          this.authPopup = window.open('https://app.asana.com/-/oauth_authorize?client_id=615384312271855&redirect_uri=https%3A%2F%2Fconnect.heysavvy.com%2F&response_type=token&state="123=456"', '_blank')
          // Trello.authorize({ type: 'popup', name: 'Savvy', scope: { read: true, write: true, account: false }, expiration: 'never', success: this.addSource1, error: this.errorAddingSource })
          break
        default:
          break
      }
    },
    repeatTokenCollection: function(serviceName, tokenName, counter) {
      if (!counter) counter = 0
      setTimeout(() => {
        try {
          const popupHref = this.authPopup.location.href
          console.log('tokenName', tokenName)
          console.log('popupHref', popupHref)
          const token = getParameterByName(tokenName, popupHref)
          console.log('token', token)
          const result = {
            origin: serviceName
          }
          result[tokenName] = token
          // this.useTokenFromPopup(result)
        } catch (e) {
          if (counter < 30)
            this.repeatTokenCollection(serviceName, tokenName, counter + 1)
        }
      }, 1000)
    },
    receiveGmailCode: function(result) {
      result.origin = 'gmail'
      this.useTokenFromPopup(result)
    },
    useTokenFromPopup: function(result) {
      console.log('result11')
      console.log(result)
      if (this.authPopup)
        this.authPopup.close()
      const source = {
        organisationID: this.organisationID === 'connect' ? getParameterByName('org') : this.organisationID
      }
      switch (result.origin) {
        case 'kloudless':
          source.superService = 'kloudless'
          source.service = result.account.service
          source.accountID = result.account.id
          source.access_token = result.access_token
          source.raw_source = result.account
          source.scope = result.scope
          source.addedBy = result.account.account
          break
        case 'https://trello.com':
          source.service = 'trello'
          source.token = result.data
          break
        case 'gmail':
          source.superService = 'google'
          source.service = 'gmail'
          source.scopes = ['https://www.googleapis.com/auth/gmail.readonly']
          source.code = result.code
          break
      }
      if (source.service || source.superService) {
        source.title = this.services.find(service => service.id === source.service).title
        this.addSource(source)
      }
    },
    fromKloudless: function(result) {
      console.log('fromKloudless')
      result.origin = 'kloudless'
      this.useTokenFromPopup(result)
    },
    addSource: function(source) {
      console.log('source')
      console.log(source)
      const self = this
      self.message = null
      if (!self.loading) {
        self.loading = true
        setTimeout(function () {
          console.log('5 second timeout')
          if (self.loading) {
            console.log('hi')
            self.loading = false
            self.message = {
              text: 'Thanks for connecting up your ' + source.title + ' account! We\'re indexing your content right now and it\'ll be ready for you within a few minutes. ☕️'
            }
          }
        }, 5000)
        axios({
          method: 'post',
          // url: 'http://localhost:5050/add-source',
          url: 'https://savvy-nlp--staging.herokuapp.com/add-source',
          // timeout: 10000,
          data: source
        }).then(res => {
          console.log('res')
          console.log(res)
          if (!res.data || !res.data.success) {
            throw (res.data && res.data.error) || 'error'
          }
          self.loading = false
          self.message = {
            text: 'Great news - your files are now indexed and ready to search!'
          }
        }).catch(err => {
          self.loading = false
          console.error('Error Adding Source', err)
          LogRocket.captureMessage('Error Adding Source', {
            extra: {
              err: err,
              data: source
            }
          })
          Raven.captureMessage('Error Adding Source', {
            extra: {
              err: err,
              data: source
            }
          })
          self.message = {
            text: 'Something went wrong indexing your files!',
            type: 'error'
          }
        })
      }
    },
    errorAddingSource: function(error) {
      console.log('error')
      console.log(error)
    }
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

.panel {
  &.loading .services a.service {
    opacity: 0.5;
  }

  a.service {
    @extend .block;
    display: inline-block;
    cursor: pointer;

    &:hover {
      background: #f3f3f3;
      // opacity: 0.7;
    }
    &::after {
      content: ".";
      opacity: 0;
    }
    &.coming-soon {
      background: #f3f3f3;

      &:hover {
        background: #e9e9e9;
      }
      &::after {
        content: "Coming Soon";
        opacity: 1;
        position: relative;
        top: -170px;
        font-weight: bold;
        color: #aaa;
      }

      > div.logo, p {
        opacity: 0.2;
      }
    }
    &.auto-service {
      @extend .block;
      padding-left: 40px;
      padding-right: 40px;

      h3 {
        color: #777;
      }
    }

    > div.logo {
      height: 120px;
      padding: 5px;
      white-space: nowrap; /* this is required unless you put the helper span closely near the img */

      > span.helper {
        display: inline-block;
        height: 100%;
        vertical-align: middle;
      }
      > img {
        max-width: 100%;
        max-height: 100%;
        vertical-align: middle;
      }
    }
    > p {
      color: #777;
    }
  }

  p.subheading, .services {
    max-width: 640px;
  }
  p.subheading {
    margin: 20px 0;
  }
  .services {
    text-align: center;
    margin: auto;

    a.service {
      width: 120px;
      height: 160px;
    }

    .message-block {
      position: relative;
      padding: .75rem 1.25rem;
      margin-top: 1rem;
      margin-bottom: 1rem;
      border: 1px solid transparent;
      border-radius: .25rem;
      text-align: center;
      white-space: normal;

      &.error {
        color: #721c24;
        background-color: #f8d7da;
        border-color: #f5c6cb;
      }
      &.warning {
        color: #856404;
        background-color: #fff3cd;
        border-color: #ffeeba;
      }
      &.success {
        color: #155724;
        background-color: #d4edda;
        border-color: #c3e6cb;
      }
    }

    .spinner {
      position: absolute;
      opacity: 1;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 160px 0;

      img {
        opacity: 1;
        filter: grayscale(0);
      }
    }
  }
}

.sidebar-true {
  .panel .services a.service {
    width: 110px;
  }
}
</style>
