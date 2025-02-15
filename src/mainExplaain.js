// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import log from 'loglevel'
import Controller from './controller'
// import router from './router'
// import Dashboard from './dashboard'
// import Chrome from './components/chrome/chrome'
import Popup from './components/explorer/popup'

require('./styles/index.css')

Vue.config.productionTip = false

const GlobalConfig = { // eslint-disable-line
  firebase: {
    apiKey: 'AIzaSyBU0SEu3orHAoJ5eqxIJXS2VfyqXm1HoMU',
    authDomain: 'forgetmenot-1491065404838.firebaseapp.com',
    databaseURL: 'https://forgetmenot-1491065404838.firebaseio.com',
    projectId: 'forgetmenot-1491065404838',
    storageBucket: '',
    messagingSenderId: '400087312665'
  },
  author: {
    url: '//' + (process.env.BACKEND_URL || 'forget-me-not--staging.herokuapp.com') + '/api/memories',
    importUrl: '//' + (process.env.BACKEND_URL || 'forget-me-not--staging.herokuapp.com') + '/api/import'
  },
  organisation: {
    id: getParameterByName('organisation') || 'nords'
  },
  auth: {
    user: {
      data: {
        teams: []
      },
    }
  }
}
GlobalConfig.auth.user.organisation = GlobalConfig.organisation

/* eslint-disable no-new */
const App = new Vue({
  el: '#dashboard',
  // router,
  // render: h => h(Dashboard, {
  render: h => h(Popup, {
    props: {
      explaain: true,
      Controller: Controller,
      sidebar: true,
      initialCard: {
        objectID: getParameterByName('cardID') || getAnchorString() || null,
        query: getParameterByName('q') || null,
        sameAs: [getParameterByName('sameAs')] || null
      },
      frameID: getParameterByName('frameId') || false,
      closePopup: closePopup
      // testing: true
    }
  })
})

function closePopup() {
  if (window.parent)
    window.parent.postMessage({ frameId: self.frameID, action: 'explaain-hide-overlay' }, '*')
}

window.addEventListener('message', function(event) {
  switch (event.data.action) {
    case 'open':
      const data = event.data
      if (data.key) data.objectID = getObjectIdFromKey(data.key)
      data.toURI = data.objectID
      data.toLayerKeys = [data.objectID]
      if (data.sameAs && typeof data.sameAs === 'string') data.sameAs = [data.sameAs]
      console.log('yieldAndShowCard', data)
      log.trace('yieldAndShowCard', data)
      App.$emit('yieldAndShowCard', data)
  }
}, false)

function getObjectIdFromKey(key) {
  const split = key ? key.split('?')[0].split('/') : [null]
  return split[split.length - 1]
}

function getParameterByName(name, url) {
  if (!url) url = window.location.href
  name = name.replace(/[\[\]]/g, '\\$&') // eslint-disable-line
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  const results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

function getAnchorString() {
  const hash = window.location.hash.substring(1)
  const anchor = hash.split('?')[0].split('/')[0]
  return anchor
}
