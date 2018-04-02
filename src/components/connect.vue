<template lang="html">
  <div class="panel connect">
    <h3>Connect to your work apps here</h3>
    <section class="services">
      <a class="service" :class="{'coming-soon': service.comingSoon}" v-for="service in services" @click="connectSource(service)">
        <div class="logo">
          <span class="helper"></span>
          <img :src="service.logo" alt="">
        </div>
        <p>{{service.title}}</p>
      </a>
      <p class="spinner" v-if="loading"><icon name="refresh" class="fa-spin fa-3x"></icon></p>
      <p v-if="message && message.text" class="message-block" :class="message.type || 'success'" ></icon>{{message.text}}</p>
    </section>
  </div>
</template>

<script>
/* global Kloudless, window */
import axios from 'axios'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon.vue'
import '../scripts/jquery.js'
import '../scripts/kloudless.authenticator.js'
import '../scripts/trello.js'
require('log-suppress').init(console)

export default {
  props: [
    'services',
    'organisationID',
  ],
  data: function() {
    return {
      loading: false,
      message: null,
      authPopup: null
    }
  },
  components: {
    Icon,
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
          window.addEventListener('message', this.retrieveTokenFromPopup, { once: true })
          console.log('added event listener')
          this.authPopup = window.open('https://trello.com/1/authorize?expiration=never&name=Savvy&scope=read,write&response_type=token&key=40bf04080255c5fe6b5e9643a9b9011b&return_url=' + encodeURIComponent(window.location.href) + '%2F&callback_method=postMessage', '_blank')
          // Trello.authorize({ type: 'popup', name: 'Savvy', scope: { read: true, write: true, account: false }, expiration: 'never', success: this.addSource1, error: this.errorAddingSource })
          break
        case 'asana':
          // window.addEventListener('message', this.retrieveTokenFromPopup, { once: true })
          // console.log('added event listener')
          this.authPopup = window.open('https://app.asana.com/-/oauth_authorize?client_id=615384312271855&redirect_uri=https%3A%2F%2Fconnect.heysavvy.com%2F&response_type=token&state="123=456"', '_blank')
          // Trello.authorize({ type: 'popup', name: 'Savvy', scope: { read: true, write: true, account: false }, expiration: 'never', success: this.addSource1, error: this.errorAddingSource })
          break
        default:
          break
      }
    },
    retrieveTokenFromPopup: function(result) {
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
          source.account = result.account
          source.scope = result.scope
          source.addedBy = result.account.account
          break
        case 'https://trello.com':
          source.service = 'trello'
          source.token = result.data
          break
      }
      if (source.service || source.superService) {
        source.title = this.services.find(service => service.id === source.service).title
        this.addSource(source)
      }
    },
    fromKloudless: function(result) {
      result.origin = 'kloudless'
      this.retrieveTokenFromPopup(result)
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
        // axios.post('http://localhost:5050/add-source'
        axios.post('https://savvy-nlp--staging.herokuapp.com/add-source'
        , source).then(res => {
          console.log('res')
          console.log(res)
          if (!res.data || !res.data.success) {
            throw (res.data && res.data.error) || 'error'
          }
          self.loading = false
          self.message = {
            text: 'Great news - your files are now indexed and ready to search!'
          }
        }).catch(e => {
          self.loading = false
          console.log(e)
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

.services {
  text-align: center;
  max-width: 640px;

  a.service {
    @extend .block;
    display: inline-block;
    width: 120px;
    height: 160px;
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
        vertical-align: middle;
      }
    }

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
}
</style>
