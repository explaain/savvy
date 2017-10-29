const functions = require('./index.js')

const data = {
  organisation: 'explaain',
  objectID: 'uRwnD5DT5DULtBeulfws',
  content: {
    description: 'Hello Hello!'
  },
  author: '2lal5bFVYIhc7bOFfBne'
}
console.log('💎  Here\'s the data:', data)
functions.saveCard(data).then(function(response) {
  console.log('📪  The response!', response)
}).catch(function(e) {
  console.log('📛  Error!', e)
})
