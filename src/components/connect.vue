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
    </section>
  </div>
</template>

<script>
/* global Kloudless */
import axios from 'axios'
import '../scripts/kloudless.authenticator.js'

export default {
  props: [
    'services'
  ],
  components: {
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
        }).catch(e => {
          self.addingSource = false
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
}
</style>
