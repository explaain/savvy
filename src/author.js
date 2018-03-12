import axios from 'axios'
import Rest from './rest'

class Author {
  constructor(options) {
    console.log('Registering Author options', options)
    this.options = options
    this.rest = new Rest(options.url)
  }
  importFromDrive(user) {
    console.log('importFromDrive', user)
    const self = this
    return new Promise((resolve, reject) => {
      axios.post(self.options.importUrl, user)
      .then((response) => {
        resolve(response)
      }).catch(e => {
        console.log(e)
        reject(e)
      })
    })
  }
  saveCard(data) {
    console.log('saveCard', data)
    const self = this
    console.log(self.options.url)
    return new Promise((resolve, reject) => {
      if (!self.options.url)
        reject(new Error('No url defined!'))
      if (data.content) delete data.content
      if (data.temporary) delete data.temporary
      if (data.newlyCreated) delete data.newlyCreated
      // @TODO: Move this error logic to a new library called Connect
      axios.post(self.options.url, data)
      .then(response => {
        console.log('Card Saved!', response)
        resolve({
          success: true,
          card: response.data.card
        })
      }).catch(e => {
        console.error(e)
        if (e && e.message) {
          if (e.message === 'Network Error') e.message = 'Network Error - Are you sure you\'re connected to the internet?'
          if (e.message === 'Request failed with status code 404') e.message = 'Whoops! Something went wrong - we\'re working on fixing it right now!'
        }
        resolve({
          success: false,
          error: e
        })
      })
    })
  }
  deleteCard(data) {
    console.log('deleteCard', data)
    const self = this
    return new Promise((resolve, reject) => {
      if (!self.options.url) {
        console.log('No url defined!')
        reject(new Error('No url defined!'))
      }
      axios.delete(self.options.url, { params: data })
      .then(response => {
        console.log('Card Deleted!', response)
        resolve(response.data)
      }).catch(e => {
        console.log(e)
        reject(e)
      })
    })
  }
  verifyCard(data) {
    console.log('verifyCard', data)
    return this.rest.post('http://localhost:5000/api/verify', data)
  }
}

export default Author
