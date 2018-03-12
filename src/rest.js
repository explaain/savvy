import axios from 'axios'

class Rest {
  constructor(url) {
    console.log('Registering REST url', url)
    this.url = url
  }
  async post(endpoint, data) {
    console.log('REST post request', data)
    const self = this
    const url = endpoint ? (isURL(endpoint) ? endpoint : self.url + endpoint) : self.url
    if (!url) {
      console.log('No url defined!')
      return new Error('No url defined!')
    }
    try {
      const r = await axios.post(url, data)
      const response = r.data
      if (response.success) {
        console.log('REST Success!', response)
        return response
      } else {
        console.log('REST Failure!', response)
        return new Error(response.error)
      }
    } catch (e) {
      console.log('REST Failure!', e)
      return new Error(e)
    }
  }
}

function isURL(str) {
  const pattern = new RegExp('^(https?://)')
  return pattern.test(str)
}

export default Rest
