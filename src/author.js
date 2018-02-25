import axios from 'axios'

class Author {
  constructor(options) {
    console.log('Registering Author options', options)
    this.options = options
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
    return new Promise((resolve, reject) => {
      if (!self.options.url)
        reject(new Error('No url defined!'))
      if (data.content) {
        Object.keys(data.content).forEach(key => {
          if (!data[key]) data[key] = data.content[key]
          delete data.content[key]
        })
      }
      delete data.content
      axios.post(self.options.url, data)
      .then(response => {
        console.log('Card Saved!', response)
        resolve(response.data.memories[0])
      }).catch(e => {
        console.error(e)
        reject(e)
      })
    })
  }
  deleteCard(data) {
    console.log('deleteCard', data)
    const self = this
    return new Promise((resolve, reject) => {
      if (!self.options.url)
        reject(new Error('No url defined!'))
      axios.delete(self.options.url, {params: data}) // Is the params bit needed?
      .then(response => {
        console.log('Card Deleted!', response)
        resolve(response)
      }).catch(e => {
        console.log(e)
        reject(e)
      })
    })
  }
}

export default Author
