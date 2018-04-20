import LogRocket from 'logrocket'
import Raven from 'raven-js'
import axios from 'axios'
import Rest from './rest' // @TODO: user this for everything and remove axios!

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
      axios({
        method: 'post',
        url: 'http://localhost:5000/api/memories/',
        // url: self.options.url,
        timeout: 10000,
        data: data
      }).then(response => {
        console.log('Card Saved!', response)
        resolve({
          success: true,
          card: response.data.card
        })
      }).catch(err => {
        console.error('Error Saving Card', err)
        LogRocket.captureMessage('Error Saving Card', {
          extra: {
            err: err,
            data: data
          }
        })
        Raven.captureMessage('Error Saving Card', {
          extra: {
            err: err,
            data: data
          }
        })
        const errorToReturn = {
          err: err,
          message: err.message
        }
        if (err && err.message) {
          if (err.message === 'Network Error') errorToReturn.message = 'Network Error - Are you sure you\'re connected to the internet?'
          if (err.message === 'Request failed with status code 404') errorToReturn.message = 'Whoops! Something went wrong - we\'re working on fixing it right now!'
        }
        resolve({
          success: false,
          error: errorToReturn
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
      axios({
        method: 'delete',
        url: 'http://localhost:5000/api/memories/',
        // url: self.options.url,
        timeout: 10000,
        params: data
      }).then(response => {
        console.log('Card Deleted!', response)
        resolve(response.data)
      }).catch(err => {
        console.error('Error Deleting Card', err)
        LogRocket.captureMessage('Error Deleting Card', {
          extra: {
            err: err,
            data: data
          }
        })
        Raven.captureMessage('Error Deleting Card', {
          extra: {
            err: err,
            data: data
          }
        })
        const errorToReturn = {
          err: err,
          message: err.message
        }
        if (err && err.message) {
          if (err.message === 'Network Error') errorToReturn.message = 'Network Error - Are you sure you\'re connected to the internet?'
          if (err.message === 'Request failed with status code 404') errorToReturn.message = 'Whoops! Something went wrong - we\'re working on fixing it right now!'
        }
        resolve({
          success: false,
          error: errorToReturn
        })
      })
    })
  }
  verifyCard(data) {
    console.log('verifyCard', data)
    // return this.rest.post('http://localhost:5000/api/verify', data)
    return this.rest.post('https://savvy-api--live.herokuapp.com/api/verify', data)
  }
}

export default Author
