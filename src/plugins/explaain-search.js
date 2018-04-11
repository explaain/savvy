import log from 'loglevel'
import Q from 'q'
import axios from 'axios'
import Algolia from 'algoliasearch'

log.setLevel('debug')

const Search = {
  install(Vue, algoliaParams, userAuth) {
    console.log('Installing ExplaainSearch', algoliaParams, userAuth)
    const AlgoliaClient = Algolia(algoliaParams.appID, userAuth.data.algoliaApiKey, {
      protocol: 'https:'
    })
    const AlgoliaIndex = AlgoliaClient.initIndex(algoliaParams.index)
    const AlgoliaCardsIndex = AlgoliaClient.initIndex(userAuth.data.organisationID + '__Cards')
    var AlgoliaFileIndex
    if (!algoliaParams.noFiles)
      AlgoliaFileIndex = AlgoliaClient.initIndex(userAuth.data.organisationID + '__Files')

    // Need to sort this out - only for Explaain currently and probably shouldn't be here!
    const saveCard = card => new Promise(function(resolve, reject) {
      console.log('saveCard', card)
      const cardToSave = JSON.parse(JSON.stringify(card))
      const keys = ['description', 'title', 'listCards']
      keys.forEach(key => {
        if (cardToSave.content[key] && !cardToSave[key]) cardToSave[key] = cardToSave.content[key]
      })
      delete cardToSave.content
      AlgoliaCardsIndex.addObject(cardToSave, function(err, content) {
        if (err) {
          console.log('Error - Card Not Saved!', err)
          reject(err)
        } else {
          console.log('Card Saved:', content)
          resolve(content)
        }
      })
    })

    const calculateUniqueID = card => {
      const splitBySlash = card.sameAs[0].split('/')
      return splitBySlash[splitBySlash.length - 1]
    }

    /**
    * Gets a card, generating and saving it if necessary
    *
    * @param  {Object} data - Should have one of [objectID, sameAs, query]
    * @param  {String} [data.objectID]
    * @param  {Array} [data.sameAs]
    * @param  {String} [data.query]
    * @param  {String} [data.refresh] - Forces refresh if present and true
    * @return {Object} card
    */
    async function yieldCard(data) {
      console.log('yieldCard', data)
      var card, retrievedCard

      // Get unique identifyer - objectID, if not then sameAs
      if (!data.objectID && (!data.sameAs || !data.sameAs[0]) && data.query) {
        card = await generateFromQuery(data.query)
        data.sameAs = card.sameAs
      }

      // Check db, retrieve saved entry (if any)
      if (data.objectID) retrievedCard = await getCard(data.objectID)
      else if (data.sameAs && data.sameAs[0]) retrievedCard = await getFromSameAs(data.sameAs)

      if (!retrievedCard || data.refresh) {
        // If no saved entry, or refresh == true, make sure we've got a generated version, then save it
        if (!card) card = await generateFromSameAs(data.sameAs)
        if (retrievedCard)
          card.objectID = retrievedCard.objectID
        else
          card.objectID = calculateUniqueID(card)
        const savedCard = await saveCard(card)
        if (!card.objectID) card.objectID = savedCard.objectID
      } else {
        // Otherwise, set card to retrieved data
        card = retrievedCard
      }

      // Return card
      console.log('Returning card:', card)
      return card
    }

    const generateFromQuery = query => new Promise((resolve, reject) => {
      console.log('generateFromQuery', query)
      // axios.get('//lookup.dbpedia.org/api/search.asmx/KeywordSearch?QueryString=' + encodeURIComponent(query))
      axios.post('//savvy-nlp--staging.herokuapp.com/generate-card-data', { query: query })
      .then(res => {
        console.log(res)
        const card = dbpediaQueryToCards(res.data.results.ArrayOfResult.Result[0] || res.data.results.ArrayOfResult.Result)
        console.log('Generated from Query: ', card)
        resolve(card)
      }).catch(err => {
        console.log(err)
        reject(err)
      })
    })

    const generateFromSameAs = sameAs => new Promise(function(resolve, reject) {
      console.log('generateFromSameAs', sameAs)
      const data = []
      sameAs.forEach(uri => {
        const type = getSameAsType(uri)
        switch (type) {
          case 'dbpedia':
            data.push({
              type: 'dbpedia',
              uri: getDbpediaFetchURI(uri)
            })
            break
        }
      })
      Promise.all(data.map(source => axios.get(source.uri)))
      .then(res => {
        console.log(res)
        const cardsToCombine = res.map((sourceResults, i) => {
          console.log(sourceResults, i)
          return sourceDataToCard(data[i].type, sourceResults)
        })
        const card = combineLinkedData(cardsToCombine) // Should be better than just taking the first one!
        console.log('Generated from Query: ', card)
        resolve(card)
      }).catch(err => {
        console.log(err)
        reject(err)
      })
    })

    const getFromSameAs = sameAs => new Promise(function(resolve, reject) {
      console.log('getFromSameAs', sameAs)
      const filters = 'sameAs: "' + sameAs.join('" OR sameAs: "') + '"'
      searchCards(userAuth, '', null, { filters: filters })
      .then(hits => {
        if (hits && hits.length) {
          console.log('Found from sameAs:', hits[0])
          resolve(hits[0])
        } else {
          console.log('Not found from sameAs.')
          resolve(null)
        }
      })
    })

    const getSameAsType = uri => {
      if (uri.indexOf('dbpedia') > -1) { // Not very safe!
        return 'dbpedia'
      } else {
        return null
      }
    }

    const sourceDataToCard = (type, sourceData) => {
      console.log('sourceDataToCard', type, sourceData)
      var card
      switch (type) {
        case 'dbpedia':
          card = dbpediaToCards(sourceData)
      }
      return card
    }

    const combineLinkedData = data => {
      return data[0]  // @TODO
    }

    const getDbpediaFetchURI = uri => {
      return uri.replace('//dbpedia.org/resource/', '//dbpedia.org/data/') + '.json'
    }

    const tailorDescription = description => {
      const maxChars = 300
      description = description.replace(/ *\([^)]*\) */g, ' ').replace(/ \./g, '.')
      var sentences = description.split(/\. (?=[A-Z])/).map(s => s + '.')
      while (sentences.join(' ').length > maxChars && sentences.length > 1) {
        sentences.pop()
      }
      description = sentences.join(' ')
      return description
    }

    const dbpediaQueryToCards = data => {
      console.log('dbpediaQueryToCards', data)
      console.log(data.Description)
      console.log(data.Description.replace(/ *\([^)]*\) */g, ' '))
      return {
        content: {
          title: data.Label,
          description: tailorDescription(data.Description)
        },
        sameAs: [
          data.URI
        ],
        sources: [
          {
            type: 'source',
            name: 'Wikipedia',
            url: (data.URL || data.URI).replace('//dbpedia.org/resource/', '//en.wikipedia.org/wiki/')
          }
        ]
      }
    }

    const dbpediaToCards = data => {
      console.log('dbpediaToCards', data)
      const resource = data.request.responseURL.replace('//dbpedia.org/data', '//dbpedia.org/resource').replace('.json', '')
      console.log('resource', resource)
      const title = data.data[resource]['http://www.w3.org/2000/01/rdf-schema#label'].filter(lang => lang.lang === 'en')[0].value
      console.log('title', title)
      const description = tailorDescription(data.data[resource]['http://www.w3.org/2000/01/rdf-schema#comment'].filter(lang => lang.lang === 'en')[0].value)
      console.log('description', description)
      const wiki = data.data[resource]['http://xmlns.com/foaf/0.1/isPrimaryTopicOf'][0].value
      console.log('wiki', wiki)
      return {
        content: {
          title: title,
          description: description
        },
        sameAs: [
          resource
        ],
        sources: [
          {
            type: 'source',
            name: 'Wikipedia',
            url: wiki
          }
        ]
      }
    }

    const advancedSearch = function(params) {
      console.log('advancedSearch')
      const d = Q.defer()
      AlgoliaIndex.clearCache()
      AlgoliaIndex.search(params, function(e, content) {
        if (e) {
          log.trace(e)
          d.reject(e)
        } else {
          const cards = content.hits.map(async card => {
            const correctedCard = await correctCard(card, false)
            return correctedCard
          })
          AlgoliaFileIndex.search()
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

    const advancedChunkSearch = async params => {
      console.log('advancedChunkSearch')
      var cards = []
      if (params.filters && params.filters.indexOf('teams: ') > -1)
        delete params.filters // Removing teams as a filter for now
      if (params.hitsPerPage === null)
        delete params.hitsPerPage
      if (window.location.hostname === 'localhost')
        params.environment = 'local'
      AlgoliaCardsIndex.clearCache()
      console.log(params)
      // try {
      //
      // } catch (e) {
      //
      // }
      const content = await axios({
        method: 'post',
        // url: 'http://localhost:5000/api/memories/',
        url: 'https://savvy-api--live.herokuapp.com/api/memories/',
        timeout: 10000,
        data: {
          sender: params.sender,
          parameters: params,
          intent: 'query',
          query: params.query,
          organisationID: params.organisationID
        }
      })
      console.log('content')
      console.log(content)
      const hits = content.hits || (content.data && content.data.memories) || [] // Accounts for the fact that we are often now using savvy-api for this
      await hits.forEach(async hit => {
        const correctedCard = await correctCard(hit, false)
        cards.push(correctedCard)
      })
      var fileIDs = cards.map(card => card.fileID)
      fileIDs = fileIDs.filter((item, pos) => item && fileIDs.indexOf(item) === pos) // Remove blanks and duplicates
      if (fileIDs.length) {
        const files = await new Promise((resolve, reject) => {
          AlgoliaFileIndex.getObjects(fileIDs, (err, content) => {
            if (err)
              reject(err)
            else {
              resolve(content)
            }
          })
        })
        cards = cards.map(card => {
          card.files = files.results.filter(file => file && file.objectID === card.fileID)
          card.files.forEach(file => {
            if (!file.title) file.title = card.fileTitle
          })
          return card
        })
      }
      cards = combineDuplicateContents(cards)
      return cards
    }

    // const chunkGet = (objectID) => new Promise(function(resolve, reject) {
    //   console.log('chunkGet', objectID)
    //   AlgoliaCardsIndex.getObject(objectID, async (e, content) => {
    //     if (e) {
    //       log.trace(e)
    //       reject(e)
    //     } else {
    //       const card = await correctCard(content)
    //       const filePromise = new Promise((resolve, reject) => {
    //         if (card.fileID) {
    //           AlgoliaFileIndex.getObject(card.fileID, (err, content) => {
    //             if (err)
    //               reject(err)
    //             else
    //               resolve(content)
    //           })
    //         } else {
    //           resolve()
    //         }
    //       })
    //       filePromise
    //       .then(function(file) {
    //         if (file)
    //           card.file = file
    //         resolve(card)
    //       }).catch(err => {
    //         reject(err)
    //       })
    //     }
    //   })
    // })

    const searchCards = function(user, searchText, hitsPerPage, extraParams) {
      console.log('searchCards')
      const d = Q.defer()
      var params = {
        query: searchText,
        // filters: 'teams: "' + user.data.teams.map(team => { return team.team }).join('" OR teams: "') + '"',
        hitsPerPage: hitsPerPage || null
      }
      if (extraParams)
        params = Object.assign(params, extraParams)
      advancedChunkSearch(params)
      .then(function(hits) {
        log.trace(hits)
        d.resolve(hits)
      }).catch(function(e) {
        d.reject(e)
      })
      return d.promise
    }

    const fetchListItemCards = function(cards) {
      console.log('fetchListItemCards')
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

    const getCard = objectID => new Promise((resolve, reject) => {
      console.log('getCard', objectID)
      AlgoliaCardsIndex.getObject(objectID, async (e, content) => {
        if (e) {
          log.trace(e)
          reject(e)
        } else {
          const card = await correctCard(content, true)
          console.log('gotCard:', card)
          resolve(card)
        }
      })
    })

    const correctCard = async function(card, getFile) {
      console.log('correctCard', card)
      if (card.content && typeof card.content === 'string' && !card.description) {
        card.description = card.content
        delete card.content
      }
      if (card._highlightResult && card._highlightResult.content && card._highlightResult.content.value && typeof card._highlightResult.content.value === 'string' && !card._highlightResult.description) {
        card._highlightResult.description = card._highlightResult.content
        delete card._highlightResult.content
      }
      if (getFile && card.fileID) {
        const file = await new Promise((resolve, reject) => {
          AlgoliaFileIndex.getObject(card.fileID, (err, content) => {
            if (err)
              reject(err)
            else {
              resolve(content)
            }
          })
        })
        console.log('file')
        console.log(file)
        if (file && !file.title) file.title = card.fileTitle
        card.files = [file]
      }
      console.log('correctCard - RESULT', card)
      return card
    }

    const combineDuplicateContents = cards => {
      console.log('combineDuplicateContents', cards)
      cards.forEach((card2, j) => {
        cards.slice(0, j).forEach((card1, i) => {
          if (card1 && card1.description && card1.description.length && card1.description === card2.description) {
            if (card1.files && card2.files && card1.files.objectID !== card2.files.objectID)
              card1.files = card1.files.concat(card2.files)
            cards[j] = null
          }
        })
      })
      cards = cards.filter(card => card !== null)
      return cards
    }

    const compoundSearch = function(user, searchText) {
      console.log('compoundSearch')
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
      console.log('removeDuplicates')
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
    console.log('const')
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
    console.log('const')
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

    this.getCard = getCard
    this.advancedSearch = advancedSearch
    this.searchCards = searchCards
    this.compoundSearch = compoundSearch
    this.removeDuplicates = removeDuplicates
    this.saveCard = saveCard
    this.correctCard = correctCard
    this.yieldCard = yieldCard
  }

}

export default Search
