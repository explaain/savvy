import log from 'loglevel'
import Q from 'q'
import Algolia from 'algoliasearch'

log.setLevel('debug')

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
          const cards = content.hits.map(card => correctCard(card))
          fetchListItemCards(cards)
          .then(function(results) {
            console.log('results', results)
            var allHits
            try {
              allHits = cards.concat(results)
            } catch (e) {
              console.log(e)
            }
            console.log('allHits', allHits)
            d.resolve(allHits)
          })
        }
      })
      return d.promise
    }

    const searchCards = function(user, searchText, hitsPerPage) {
      const d = Q.defer()
      log.debug(user)
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
        console.log('fetchListItemCards results', results)
        const cards = results.map(result => result.value)
        cards.forEach(card => {
          card.fetched = true
        })
        d.resolve(cards)
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
          const card = correctCard(content)
          console.log('gotCard:', card)
          d.resolve(card)
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
      if (card.sentence) delete card.sentence
      if (card.text) delete card.text
      if (card.description) delete card.description
      return card
    }

    const compoundSearch = function(user, searchText) {
      const d = Q.defer()
      const maxLength = 400
      const searchTextArray = []
      const hitsPerPage = Math.min(Math.max(Math.ceil(10 / (searchText.length / maxLength)), 3), 12)
      for (var i = 0; i < searchText.length; i += maxLength)
        searchTextArray.push(searchText.substring(i, i + maxLength))
      const promises = searchTextArray.map(function(t, j) {
        return searchCards(user, t, hitsPerPage)
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

    const removeDuplicates = (originalArray, objKey) => {
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

    this.advancedSearch = advancedSearch
    this.searchCards = searchCards
    this.compoundSearch = compoundSearch
    this.removeDuplicates = removeDuplicates
  }

}

export default Search
