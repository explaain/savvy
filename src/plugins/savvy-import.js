import log from 'loglevel'
import Q from 'q'
import ExplaainAuthor from './explaain-author.js'
import '../scripts/api.js'
/* global gapi */

log.setLevel('debug')

// const escapeRegExp = function(str) {
//   return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&') // str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
// }

// Client ID and API key from the Developer Console
var CLIENT_ID = '400087312665-71alk1rdb1lp6q9tkcgdcrj6d4u7dflb.apps.googleusercontent.com'
var API_KEY = 'AIzaSyBU0SEu3orHAoJ5eqxIJXS2VfyqXm1HoMU'

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']

// Authorization scopes required by the API multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/drive.readonly'

const Import = {
  install(Vue, options) {
    console.log('Import Installed')
    this.authorizeButton = document.getElementById('authorize-button')
    this.signoutButton = document.getElementById('signout-button')
    Vue.use(ExplaainAuthor, this.authorParams)
  },

  /**
  *  On load, called to load the auth2 library and API client library.
  */
  beginImport: function() {
    gapi.load('client:auth2', this.initClient)
  },

  /**
  *  Initializes the API client library and sets up sign-in state
  *  listeners.
  */
  initClient: function () {
    console.log(this)
    gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(function () {
      console.log(4)
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus)

      self.user.authProvider = 'google'
      self.user.uid = gapi.auth2.getAuthInstance().currentUser.Ab.El // 104380110279658920175
      console.log('self.getUser().uid')
      console.log(self.getUser().uid)

      // Handle the initial sign-in state.
      this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
      this.authorizeButton.onclick = this.handleAuthClick
      this.signoutButton.onclick = this.handleSignoutClick
    }).catch(function(e) {
      console.log(e)
    })
  },

  /**
  *  Called when the signed in status changes, to update the UI
  *  appropriately. After a sign-in, the API is called.
  */
  updateSigninStatus: function(isSignedIn) {
    console.log(isSignedIn)
    if (isSignedIn) {
      this.authorizeButton.style.display = 'none'
      this.signoutButton.style.display = 'block'

      if (getParameterByName('import') === 'true') this.importFromFiles()
    } else {
      this.authorizeButton.style.display = 'block'
      this.signoutButton.style.display = 'none'
      this.handleAuthClick()
    }
  },

  /**
  *  Sign in the user upon button click.
  */
  handleAuthClick: function(event) {
    gapi.auth2.getAuthInstance().signIn()
    .then(function(res) {
      self.user.authProvider = 'google'
      self.user.uid = res.El
      console.log(res)
    }).catch(function(e) {
      console.log(e)
    })
  },

  /**
  *  Sign out the user upon button click.
  */
  handleSignoutClick: function(event) {
    gapi.auth2.getAuthInstance().signOut()
  },

  /**
  * Append a pre element to the body containing the given message
  * as its text node. Used to display the results of the API call.
  *
  * @param {string} message Text to be placed in pre element.
  */
  appendPre: function(message) {
    var pre = document.getElementById('main')
    var textContent = document.createElement('p')
    textContent.appendChild(document.createTextNode(message))
    pre.appendChild(textContent)
  },

  resetDb: function () {
    const d = Q.defer()
    if (self.getUser().uid === '101118387301286232222')
      self.deleteAllCards()
      .then(function () {
        const initialCards = [
          {
            'context': [],
            'entities': {},
            'intent': 'setTask.URL',
            'sender': '101118387301286232222',
            'sentence': 'TechCrunch News:\r\n\r\nMACE has raised £500k from Angel List to help its efforts expanding the company\'s business SaaS model. Customers include Disney, Adobe and YouTube.',
            'hasAttachments': true,
            'userID': '101118387301286232222',
            'dateCreated': 1507109266738,
            'triggerURL': 'mail.google.com',
            'actionSentence': 'Breaking news',
            'attachments': [
              {
                'type': 'image',
                'url': 'https://s0.wp.com/wp-content/themes/vip/techcrunch-2013/assets/images/techcrunch.opengraph.default.png'
              }
            ],
          },
          {
            'context': [],
            'entities': {},
            'intent': 'setTask.URL',
            'sender': '101118387301286232222',
            'sentence': 'MACE vs ACME Competitor Analysis:\r\n\r\n- They don\'t integrate with AWS\r\n- They don\'t offer a free trial\r\n- Customer satisfaction in 3* on Trustpilot vs us at 4.5*\r\n- They don\'t have case studies',
            'hasAttachments': false,
            'userID': '101118387301286232222',
            'dateCreated': 1507109266738,
            'triggerURL': 'mail.google.com',
            'actionSentence': 'Breaking news',
          },
        ]
        const promises = initialCards.map(function(card) {
          return ExplaainAuthor.saveCard(card)
        })
        return Q.allSettled(promises)
      }).then(function () {
        console.log('yoyoyoyoyoyo')
        d.resolve()
      }).catch(function(e) {
        d.reject(e)
      })
    else
      d.resolve()
    return d.promise
  },

  /**
  * Print files.
  */
  importFromFiles: function() {
    self.setLoading()

    this.resetDb()
    .then(function () {
      return gapi.client.drive.files.list({
        'pageSize': 10,
        'fields': 'nextPageToken, files(id, name, mimeType)'
      })
    }).then(function(response) {
      console.log(response)
      var files = response.result.files
      if (files && files.length > 0) {
        const win = []
        const lose = []
        var cardsCounted = 0
        const filePromises = files.filter(function(file) {
          return file.mimeType === 'application/vnd.google-apps.document'
        }).map(function(file, i, filteredFiles) {
          return gapi.client.drive.files.export({
            'fileId': file.id,
            'mimeType': 'text/plain'
          }).then(function(response) {
            const cards = self.convertFileToCards(response.body, file)
            cardsCounted += cards.length
            cards.forEach(function(card) {
              // appendPre(card.text)
            })
            const savePromises = cards.map(function(card) {
              card.sender = self.user.uid
              card.callback = self.modalCallback
              console.log(card)
              return ExplaainAuthor.saveCard(card)
              .then(function(res) {
                self.loaderCards++
                self.loader = 100 * (self.loaderCards / cardsCounted)
              }).catch(function(e) {
                console.log(e)
              })
            })
            return Q.allSettled(savePromises)
          }).then(function(res) {
          }).catch(function(e) {
            console.log(e)
          })
        })
        Q.allSettled(filePromises)
        .then(function(res) {
          self.loader = -1
          console.log(res)
          console.log(win)
          console.log(lose)
          self.searchRecent()
        }).catch(function(e) {
          console.log(e)
          self.searchRecent()
        })
      } else {
        console.log('No files found.')
      }
    })
  }

}

function getParameterByName(name, url) {
  if (!url) url = window.location.href
  name = name.replace(/[[]]/g, '\\$&')
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  var results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

export default Import
