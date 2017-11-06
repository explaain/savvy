import log from 'loglevel'
import Q from 'q'
import Algolia from 'algoliasearch'

log.setLevel('debug')

const escapeRegExp = function(str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&') // str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
}

const Search = {
  install(Vue, options) {
    log.trace(options)
    const AlgoliaClient = Algolia(options.appID, options.apiKey, {
      protocol: 'https:'
    })
    const AlgoliaIndex = AlgoliaClient.initIndex(options.index)

    const advancedSearch = function(params) {
      const d = Q.defer()
      AlgoliaIndex.clearCache()
      AlgoliaIndex.search(params, function(e, content) {
        if (e) {
          log.trace(e)
          d.reject(e)
        } else {
          fetchListItemCards(content.hits)
          .then(function() {
            d.resolve(content.hits)
          })
        }
      })
      return d.promise
    }

    const searchCards = function(user, searchText, hitsPerPage) {
      const d = Q.defer()
      const params = {
        query: searchText,
        filters: 'teams: "' + user.data.teams.map(team => { return team.team }).join('" OR teams: "') + '"',
        hitsPerPage: hitsPerPage || null
      }
      log.trace(params)
      advancedSearch(params)
      .then(function(hits) {
        log.trace(hits)
        d.resolve(hits)
      }).catch(function(e) {
        d.reject(e)
      })
      return d.promise
    }

    const fetchListItemCards = function(cards) {
      const d = Q.defer()
      const promises = []
      cards.forEach(function(card) {
        card = correctCard(card)
        card.content.listCards = []
        if (!card.content.listItems) card.content.listItems = []
        card.content.listItems.forEach(function(key) {
          // const p = Q.defer()
          promises.push(getCard(key)) // Do we need to notify the card or provide callbacks etc here?
          // promises.push(p.promise)
        })
      })
      log.trace(promises)
      Q.allSettled(promises)
      .then(function(results) {
        d.resolve(results)
      }).catch(function(e) {
        log.trace(e)
        d.reject(e)
      })
      return d.promise
    }

    const getCard = function(objectID) {
      const d = Q.defer()
      AlgoliaIndex.getObject(objectID, function(e, content) {
        if (e) {
          log.trace(e)
          d.reject(e)
        } else {
          d.resolve(content)
        }
      })
      return d.promise
    }

    const correctCard = function(card) {
      if (!card.content)
        card.content = {
          description: card.description || card.sentence || card.text,
          listItems: card.listItems || [],
        }
      console.log(JSON.stringify(card.content))
      if (card.sentence) delete card.sentence
      if (card.text) delete card.text
      if (card.description) delete card.description
      return card
    }

    const compoundSearch = function(userID, searchText) {
      const d = Q.defer()
      const maxLength = 400
      const searchTextArray = []
      const hitsPerPage = Math.min(Math.max(Math.ceil(10 / (searchText.length / maxLength)), 3), 12)
      for (var i = 0; i < searchText.length; i += maxLength)
        searchTextArray.push(searchText.substring(i, i + maxLength))
      const promises = searchTextArray.map(function(t, j) {
        return searchCards(userID, t, hitsPerPage)
      })
      Q.allSettled(promises)
      .then(function(res) {
        var results = [].concat.apply([], res.map(function(r) { return r.value }))
        results = removeDuplicates(results, 'objectID')
        log.trace(results)
        d.resolve(results)
      })
      .catch(function(e) {
        log.trace(e)
      })
      return d.promise
    }

    const removeDuplicates = function(originalArray, objKey) {
      var trimmedArray = []
      var values = []
      var value
      for (var i = 0; i < originalArray.length; i++) {
        value = originalArray[i][objKey]
        if (values.indexOf(value) === -1) {
          trimmedArray.push(originalArray[i])
          values.push(value)
        }
      }
      return trimmedArray
    }

    // const checkPageHit = function(pageData, results) {
    //   //Not yet accounting for capitals
    //   const boringWords = [
    //     'favourite',
    //     'world',
    //     'name',
    //     'this',
    //     'plan',
    //     'need',
    //     'best',
    //     'like',
    //     'the',
    //     'are',
    //     'is',
    //     'my',
    //     'my',
    //   ]
    //   const hits = []
    //   results.forEach(function(result, i) {
    //     log.trace('---')
    //     log.trace(i)
    //     var count = []
    //     result.context.forEach(function(c) {
    //       if (pageData.pageText.indexOf(c.value) > -1
    //       && hits.indexOf(result.objectID) == -1
    //       && c.value && c.value.length > 3
    //       && boringWords.indexOf(c.value) == -1
    //       && count.indexOf(c.value) == -1) {
    //         log.trace(c.value)
    //         count.push(c.value)
    //         (c.value.match(/ /g) || []).forEach(function() {
    //           count.push(c.value)
    //         })
    //       }
    //     })
    //     if (count.length > 2) {
    //       log.trace(result.sentence)
    //       hits.push(result)
    //     }
    //     log.trace('---')
    //   })
    //
    //   // return hits
    //   //Force no hits
    //   return []
    // }

    // const checkPageReminder = function(userID, pageData) {
    //   const d = Q.defer()
    //   log.trace(pageData)
    //   const urlRoot = pageData.baseUrl.replace('.com','').replace('.co.uk','').replace('.org','')
    //   const params = {
    //     query: '',
    //     filters: 'userID: ' + userID + ' AND (triggerUrl: ' + urlRoot + ' OR triggerUrl: ' + urlRoot + '.com OR triggerUrl: ' + urlRoot + '.co.uk OR triggerUrl: ' + urlRoot + '.org OR triggerURL: ' + urlRoot + ' OR triggerURL: ' + urlRoot + '.com OR triggerURL: ' + urlRoot + '.co.uk OR triggerURL: ' + urlRoot + '.org)'
    //   }
    //   log.trace('params')
    //   log.trace(params)
    //   advancedSearch(params)
    //   .then(function(reminders) {
    //     log.trace('reminders')
    //     log.trace(reminders)
    //     d.resolve(reminders)
    //   }).catch(function(e) {
    //     d.reject(e)
    //   })
    //   return d.promise
    // }

    const getPageResults = function(userID, pageData, allUserCards) {
      const d = Q.defer()
      // Gets all results
      const pageResults = {
        hits: [],
        reminders: [],
        pings: [],
        memories: [],
      }
      log.trace(userID, pageData)
      const gmailBoringPhrases = [
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
      gmailBoringPhrases.forEach(function(phrase) {
        pageData.pageText = pageData.pageText.replace(phrase, '')
      })
      const boringWords = [
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

      try {
        const allWords = []
        allUserCards.forEach(function(card) {
          var score = 0
          card.context.forEach(function(entity) {
            const val = String(entity.value)
            if (boringWords.indexOf(val.toLowerCase()) === -1 && val.length > 1) {
              const reg = new RegExp(escapeRegExp(val), 'gi')
              const points = (pageData.pageText.match(reg) || []).length * val.length
              score += points
              if (points && allWords.indexOf(val) === -1) allWords.push(val)
            }
          })
          if (score > 100)
            pageResults.hits.push(card)
          else if (score > 0)
            pageResults.memories.push(card)
        })
        log.debug(allWords)

        pageResults.reminders = allUserCards.filter(function(card) {
          const urlRoot = pageData.baseUrl.replace('.com', '').replace('.co.uk', '').replace('.org', '')
          log.info(card.triggerURL)
          return card.triggerURL && (card.triggerURL.indexOf(urlRoot) > -1 || card.triggerURL.indexOf(urlRoot) > -1)
        })
        pageResults.pings = pageResults.reminders // .concat(pageResults.hits)
        pageResults.pings.forEach(function(ping) { ping.highlight = true })
        // pageResults.memories = pageResults.pings.concat(pageResults.memories)
        pageResults.memories = removeDuplicates(pageResults.memories, 'objectID')
        log.debug(pageResults)
        d.resolve(pageResults)
      } catch (e) {
        log.error(e)
      }

      // compoundSearch(userID, pageData.pageText)
      // .then(function(results) {
      //   log.trace(1)
      //   log.trace(results)
      //   pageResults.memories = results
      //   // Checks whether a ping is required
      //   pageResults.hits = checkPageHit(pageData, results)
      //   log.trace(2)
      //   log.trace(pageResults.hits)
      //   return checkPageReminder(userID, pageData)
      // }).then(function(reminders) {
      //   pageResults.reminders = reminders
      //   log.trace(3)
      //   log.trace(pageResults.reminders)
      //   // Returns results plus ping
      //   pageResults.pings = pageResults.reminders.concat(pageResults.hits)
      //   pageResults.pings.forEach(function(ping) {
      //     log.trace(ping.objectID)
      //     ping.highlight = true
      //   })
      //   pageResults.memories = pageResults.pings.concat(pageResults.memories)
      //   pageResults.memories = removeDuplicates(pageResults.memories, 'objectID')
      //   log.trace(pageResults)
      //   d.resolve(pageResults)
      // }).catch(function(e) {
      //   log.trace(e)
      //   d.reject(e)
      // })
      return d.promise
    }

    this.advancedSearch = advancedSearch
    this.searchCards = searchCards
    this.compoundSearch = compoundSearch
    this.getPageResults = getPageResults
  }

}

export default Search
