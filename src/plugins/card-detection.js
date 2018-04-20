import log from 'loglevel'
import Vue from 'vue'
import ExplaainSearch from './explaain-search.js'

const Detect = {
  install(options) {
    Vue.use(ExplaainSearch)
  },
  getPageResults(organisationID, user, pageData) {
    return new Promise(function(resolve, reject) {
      log.debug('Card Detection:', organisationID, user, pageData.pageText.substring(0, 100))
      algorithm(organisationID, user, pageData)
      .then(results => {
        console.log('Detection results:', results)
        resolve(results)
      })
    })
  }
}

const algorithm = (organisationID, user, pageData) => new Promise((resolve, reject) => {
  const pageResults = {
    hits: [],
    reminders: [],
    pings: [],
    memories: []
  }
  const gmailBoringPhrases = getGmailBoringPhrases()
  gmailBoringPhrases.forEach(function(phrase) {
    pageData.pageText = pageData.pageText.replace(phrase, '')
  })

  ExplaainSearch.compoundSearch(user, pageData.pageText)
  .then(cards => {
    try {
      const boringWords = getBoringWords()
      const allWords = []
      cards.forEach(card => {
        var score = 0
        card.content.description.split(' ').forEach(word => {
          if (boringWords.indexOf(word.toLowerCase()) === -1 && word.length > 1) {
            const reg = new RegExp(escapeRegExp(word), 'gi')
            const points = (pageData.pageText.match(reg) || []).length * word.length
            score += points
            if (points && allWords.indexOf(word) === -1) allWords.push(word)
          }
        })
        if (score > 100)
          pageResults.hits.push(card)
        else if (score > 0)
          pageResults.memories.push(card)
      })
      log.debug(allWords)

      pageResults.reminders = cards.filter(function(card) {
        const urlRoot = pageData.baseUrl.replace('.com', '').replace('.co.uk', '').replace('.org', '')
        log.info(card.triggerURL)
        return card.triggerURL && (card.triggerURL.indexOf(urlRoot) > -1 || card.triggerURL.indexOf(urlRoot) > -1)
      })
      pageResults.pings = pageResults.reminders.concat(pageResults.hits)
      pageResults.pings.forEach(function(ping) { ping.highlight = true })
      // pageResults.memories = pageResults.pings.concat(pageResults.memories)
      pageResults.memories = ExplaainSearch.removeDuplicates(pageResults.memories, 'objectID')
      log.debug(pageResults)
      resolve(pageResults)
    } catch (e) {
      log.error(e)
    }
  })
})

const escapeRegExp = str => {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&') // str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
}

const getGmailBoringPhrases = () => [
  'Skip to content',
  'Using',
  'with screen readers',
  'Search',
  'Mail',
  'COMPOSE',
  'Labels',
  'Inbox',
  'Starred',
  'Sent Mail',
  'Drafts',
  'More',
  '---------- Forwarded message ----------',
  'From: ',
  'Date: ',
  'Subject: ',
  'To: ',
  'Click here to Reply or Forward',
  'GB',
  'GB used',
  'Manage',
  'Program Policies',
  'Powered by Google',
  'Last account activity:',
  'hour ago',
  'hours ago',
  'Details',
]

const getBoringWords = () => [
  'i',
  'a',
  'of',
  'me',
  'my',
  'is',
  'im',
  'so',
  'all',
  'get',
  'how',
  'new',
  'out',
  'the',
  'use',
  'best',
  'name',
  'next',
  'take',
  'what',
  'image',
  'something',
]

export default Detect
