<template lang="html">
  <div class="connect">
    <h3>Connect to your work apps here</h3>
    <section class="services">
      <a v-for="service in services" @click="connectSource(service)">
        <div class="logo">
          <span class="helper"></span>
          <img :src="service.logo" alt="">
        </div>
        <p>{{service.title}}</p>
      </a>
      <p class="spinner" v-if="loading"><icon name="refresh" class="fa-spin fa-3x"></icon></p>
      <p class="message-block success" v-if="message"></icon>{{message}}</p>
    </section>
  </div>
</template>

<script>
/* global Kloudless */
import axios from 'axios'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon.vue'
import '../scripts/kloudless.authenticator.js'
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
    }
  },
  components: {
    Icon,
  },
  methods: {
    connectSource: function(service) {
      console.log(service)
      if (['gdrive'].indexOf(service.id) > -1)
        this.connectKloudlessSource()
    },
    connectKloudlessSource: function() {
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
      self.message = null
      if (!self.loading) {
        self.loading = true
        // axios.post('http://localhost:5050/add-source', {
        setTimeout(function () {
          console.log('5 second timeout')
          if (self.loading) {
            console.log('hi')
            self.loading = false
            self.message = 'Source Connected!'
          }
        }, 5000)
        axios.post('//savvy-nlp--staging.herokuapp.com/add-source', {
          organisationID: self.organisationID === 'connect' ? getParameterByName('org') : self.organisationID,
          superService: 'kloudless',
          source: result
        }).then(res => {
          self.loading = false
          self.message = 'Source Connected!'
          console.log(res.data.results)
        }).catch(e => {
          self.loading = false
          console.log(e)
        })
      }
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

  a {
    @extend .block;
    display: inline-block;
    width: 120px;
    height: 160px;
    cursor: pointer;

    &:hover {
      background: #f3f3f3;
      // opacity: 0.7;
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
