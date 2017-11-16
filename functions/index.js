// eslint-disable-line
// @TODO Pass userID along EVERYWHERE and check they're allow to do stuff!

const properties = {
  algolia_app_id: 'I2VKMNNAXI',
  algolia_api_key: '1a865896c07d9c08f3e2f14736e840bf',
  algolia_index: 'Savvy' // Clearly not great
}

const AlgoliaSearch = require('algoliasearch')
const AlgoliaClient = AlgoliaSearch(properties.algolia_app_id, properties.algolia_api_key, { protocol: 'https:' })
// const AlgoliaIndex = AlgoliaClient.initIndex(properties.algolia_index)

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions')
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)
var db = admin.firestore()

/*                               */
/*                               */
/* ----------------------------- */
/* ---------- EVENTS ----------- */
/* ----------------------------- */

exports.onUserCreated = functions.auth.user().onCreate(event => {
  try {
    const user = event.data // The Firebase user.

    return setUser('public', user.uid, user)
    .then(res => { return })
    .catch(e => { console.log('📛 Error!', e) })
  } catch (e) {
    console.log('📛 Error!', e.status, ':', e.message)
    return
  }
})

exports.onCardCreated = functions.firestore
  .document('organisations/{organisation}/cards/{card}')
  .onCreate(event => {
    try {
      console.log('📬 Data just arrived:', smartObj(event.data))
      const data = firebaseToAlgolia(event.data)
      return new Promise((resolve, reject) => {
        getConfig('algolia', 'index')
        .then(indexKey => {
          console.log('creating:', data)
          AlgoliaClient.initIndex(indexKey)
          .addObject(data, function(err, content) {
            if (err) {
              const e = { code: 500, message: '📛 🔁  Failed to sync with Algolia! (Create)' }
              console.log('📛 Error!', e.status, ':', e.message)
              reject(new Error(e.message))
            } else {
              console.log('🔁  Synced with Algolia (Create)')
              resolve()
            }
          })
        })
      })
    } catch (e) {
      console.log('📛 Error!', e.status, ':', e.message || e)
      return new Error('📛 Error! ' + (e.message || e))
    }
}) // eslint-disable-line

exports.onCardUpdated = functions.firestore
  .document('organisations/{organisation}/cards/{card}')
  .onUpdate(event => {
    try {
      console.log('📬 Data just arrived:', smartObj(event.data))
      const data = firebaseToAlgolia(event.data)
      return new Promise((resolve, reject) => {
        getConfig('algolia', 'index')
        .then(indexKey => {
          console.log('updating:', data)
          AlgoliaClient.initIndex(indexKey)
          .saveObject(data, function(err, content) {
            if (err) {
              console.log('err', err)
              const e = { code: 500, message: '📛 🔁  Failed to sync with Algolia! (Update) - ' + err }
              console.log('📛 Error!', e.status, ':', e.message, err)
              reject(new Error(e.message))
            } else {
              console.log(content)
              console.log('🔁  Synced with Algolia (Update)')
              resolve()
            }
          })
        })
      })
    } catch (e) {
      console.log('📛 Error!', e.status, ':', e.message || e)
      return new Error('📛 Error! ' + (e.message || e))
    }
}) // eslint-disable-line

exports.onCardDeleted = functions.firestore
  .document('organisations/{organisation}/cards/{card}')
  .onDelete(event => {
    try {
      console.log('📬 Data just arrived:', smartObj(event.data))
      const objectID = getID(event.data)
      return new Promise((resolve, reject) => {
        getConfig('algolia', 'index')
        .then(indexKey => {
          AlgoliaClient.initIndex(indexKey)
          .deleteObject(objectID, function(err, content) {
            if (err) {
              const e = { code: 500, message: '📛 🔁  Failed to sync with Algolia! (Delete)' }
              console.log('📛 Error!', e.status, ':', e.message)
              reject(new Error(e.message))
            } else {
              console.log('🔁  Synced with Algolia (Delete)')
              resolve()
            }
          })
        })
      })
    } catch (e) {
      console.log('📛 Error!', e.status, ':', e.message || e)
      return new Error('📛 Error! ' + (e.message || e))
    }
}) // eslint-disable-line

/*                               */
/*                               */
/* ----------------------------- */
/* ---------- EXPORTS ---------- */
/* ----------------------------- */

exports.addUserToOrganisation = functions.https.onRequest((req, res) => {
  try {
    console.log('📬 Data just arrived:', smartObj(req.body))
    requireProps(req.body, ['organisationID', 'userID', 'verifiedEmails'])
    const data = req.body
    var user
    getUser(data.organisationID, data.userID)
    .then(snapshot => {
      console.log(smartIdObj(snapshot.data))
      res.status(200).json(smartIdObj(snapshot.data))
    }).catch(e => {
      getInvite(data.organisationID, data.verifiedEmails[0]) // For now just takes the first one
      .then(snapshot => {
        console.log(snapshot.data)
        console.log(smartIdObj(snapshot.data))
        user = snapshot.data
        return setUser(data.organisationID, data.userID, user)
      }).then(snapshot => {
        res.status(200).json(smartIdObj(user))
      }).catch(e => { console.log('📛 Error!', e); res.status(500).send(e) })
    })
  } catch (e) {
    console.log('📛 Error!', e)
    res.status(e.status || 500).send(e.message || e || '📛 Unknown Server Error')
  }
})

exports.getUserData = functions.https.onRequest((req, res) => {
  try {
    console.log('📬 Data just arrived:', smartObj(req.body))
    requireProps(req.body, ['organisationID', 'userID'])
    const data = req.body

    getUser(data.organisationID, data.userID)
    .then(snapshot => {
      console.log(snapshot.data)
      console.log(smartIdObj(snapshot.data))
      res.status(200).json(smartIdObj(snapshot.data))
    }).catch(e => { console.log('📛 Error!', e); res.status(500).send(e) })
  } catch (e) {
    console.log('📛 Error!', e)
    res.status(e.status || 500).send(e.message || e || '📛 Unknown Server Error')
  }
})

exports.changeUserTeamRole = functions.https.onRequest((req, res) => {
  try {
    console.log('📬 Data just arrived:', smartObj(req.body))
    requireProps(req.body, ['organisationID', 'userID', 'subjectUserID', 'teamID', 'role'])
    const data = req.body

    getUser(data.organisationID, data.subjectUserID)
    .then(subjectUser => { data.subjectUser = subjectUser; return getTeam(data.organisationID, data.teamID) })
    .then(team => {
      data.team = team
      const updatedUser = updateUserTeamRole(data.organisationID, data.subjectUser, data.team, data.role)
      return setUser(data.organisationID, data.subjectUser.id, updatedUser)
    }).then(snapshot => {
      return admin.auth().setCustomUserClaims(data.subjectUser.id, {admin: true}) // This is just experimenting currently
    }).then(snapshot => {
      res.status(200).json(snapshot)
    }).catch(e => { console.log('📛 Error!', e); res.status(500).send(e) })
  } catch (e) {
    console.log('📛 Error!', e)
    res.status(e.status || 500).send(e.message || e || '📛 Unknown Server Error')
  }
})

exports.checkPermissions = functions.https.onRequest((req, res) => {
  try {
    console.log('📬 Data just arrived:', smartObj(req.body))
    requireProps(req.body, ['organisationID', 'userID'])
    getUser(req.body.organisationID, req.body.userID)
    .then(snapshot => {
      console.log('🔑  Permission granted!')
      res.status(200).json(snapshot)
    }).catch(e => { console.log('📛 Error!', e); res.status(500).send(e) })
  } catch (e) {
    console.log('📛 Error!', e)
    res.status(e.status || 500).send(e.message || e || '📛 Unknown Server Error')
  }
})

exports.saveCard = functions.https.onRequest((req, res) => {
  try {
    console.log('📬 Data just arrived:', smartObj(req.body))
    requireProps(req.body, ['organisationID', 'userID', 'content'])
    const data = req.body
    if (data.objectID) data.cardID = data.objectID; delete data.objectID

    getUser(data.organisationID, data.userID)
    .then(user => {
      data.user = user // Not handling for if this isn't found
      return getCard(data.organisationID, data.cardID)
    }).catch(function(e) {
      return new Promise((resolve, reject) => { resolve() })
    }).then(card => {
      console.log('🌐🌐🌐 ' + (req.body.cardID || req.body.objectID) + ' 🌐🌐🌐 ' + (card ? card.data.content.description : '[BLANK]') + ' ➡️ ' + req.body.content.description)
      data.card = card || {
        data: {
          content: data.content,
          teams: data.teamIDs ? data.teamIDs.map(teamID => getTeamRef(data.organisationID, teamID)) : data.user.data.teams.map(team => team.team),
        }
      }
      console.log('data.card.data.teams', data.card.data.teams)
      const updatedCard = updateCard(data.organisationID, data.user, data.card, data.content, data.meta)
      if (card)
        return data.card.ref.set(updatedCard.data)
      else if (data.cardID)
        return getCardRef(data.organisationID, data.cardID).set(updatedCard.data)
      else
        return getCardsRef(data.organisationID).add(updatedCard.data)
    }).then(snapshot => {
      console.log('snapshot', snapshot)
      if (!data.cardID) data.cardID = getID(snapshot)
      return getCard(data.organisationID, data.cardID)
    }).then(card => {
      console.log('📂 Card Saved!', card)
      res.status(200).json(card)
    }).catch(e => { console.log('📛 Error!', e); res.status(500).send(e) })
  } catch (e) {
    console.log('📛 Error!', e.status, ':', e.message)
    res.status(e.status || 500).send(e.message || e || '📛 Unknown Server Error')
  }
})

exports.deleteCard = functions.https.onRequest((req, res) => {
  try {
    console.log('📬 Data just arrived:', smartObj(req.body))
    //
    // @TODO
    // @TODO
    // @TODO
    //
  } catch (e) {
    console.log('📛 Error!', e.status, ':', e.message)
    res.status(e.status || 500).send(e.message || e || '📛 Unknown Server Error')
  }
})

exports.getCards = functions.https.onRequest((req, res) => {
  try {
    console.log('📬 Data just arrived:', smartObj(req.body))
    requireProps(req.body, ['organisationID', 'userID', 'cardIDs'])

    const promises = req.body.cardIDs.map(cardID => {
      return getCard(req.body.organisationID, cardID)
    })
    Promise.all(promises)
    .then(cards => {
      console.log('🗂  Cards retrieved:', cards)
      res.status(200).send(cards)
    }).catch(e => { console.log('📛 Error!', e); res.status(500).send(e) })
  } catch (e) {
    console.log('📛 Error!', e.status, ':', e.message)
    res.status(e.status || 500).send(e.message || e || '📛 Unknown Server Error')
  }
})

exports.searchCards = functions.https.onRequest((req, res) => {
  try {
    console.log('📬 Data just arrived:', smartObj(req.body))
    //
    // @TODO
    // @TODO
    // @TODO
    //
  } catch (e) {
    console.log('📛 Error!', e.status, ':', e.message)
    res.status(e.status || 500).send(e.message || e || '📛 Unknown Server Error')
  }
})

exports.saveFiles = functions.https.onRequest((req, res) => {
  try {
    console.log('📬 Data just arrived:', smartObj(req.body))
    requireProps(req.body, ['organisationID', 'files'])

    const promises = req.body.files.map(file => {
      if (file.source) file.source = getSourceRef(req.body.organisationID, file.source)
      return getFilesRef(req.body.organisationID).add(file)
    })

    Promise.all(promises)
    .then(snapshot => {
      res.status(200).send(getID(snapshot))
    }).catch(e => { console.log('📛 Error!', e); res.status(500).send(e) })
  } catch (e) {
    console.log('📛 Error!', e.status, ':', e.message)
    res.status(e.status || 500).send(e.message || e || '📛 Unknown Server Error')
  }
})

exports.getSources = functions.https.onRequest((req, res) => {
  try {
    console.log('📬 Data just arrived:', smartObj(req.body))
    requireProps(req.body, ['organisationID'])

    getSources(req.body.organisationID)
    .then(sources => {
      res.status(200).send(sources)
    }).catch(e => { console.log('📛 Error!', e); res.status(500).send(e) })
  } catch (e) {
    console.log('📛 Error!', e.status, ':', e.message)
    res.status(e.status || 500).send(e.message || e || '📛 Unknown Server Error')
  }
})

exports.saveSource = functions.https.onRequest((req, res) => {
  try {
    console.log('📬 Data just arrived:', smartObj(req.body))
    requireProps(req.body, ['organisationID', 'platform', 'name', 'token'])

    getSourcesRef(req.body.organisationID).add({
      platform: req.body.platform,
      name: req.body.name,
      token: req.body.token
    }).then(snapshot => {
      res.status(200).send(getID(snapshot))
    }).catch(e => { console.log('📛 Error!', e); res.status(500).send(e) })
  } catch (e) {
    console.log('📛 Error!', e.status, ':', e.message)
    res.status(e.status || 500).send(e.message || e || '📛 Unknown Server Error')
  }
})

/*                               */
/*                               */
/* ----------------------------- */
/* --------- FUNCTIONS --------- */
/* ----------------------------- */

const getDoc = function(organisationID, collectionID, docID) {
  return new Promise((resolve, reject) => {
    console.log('📥  Getting doc', collectionID, docID)
    const ref = getDocRef(organisationID, collectionID, docID)
    ref.get().then(doc => {
      if (!doc.exists) {
        console.log('❌ Couldn\'t find object from ' + collectionID)
        reject(new Error(404))
      } else {
        console.log('🔍  Object from ' + collectionID + ' found:', /* ref, */ smartObj(doc.data()))
        console.log('a', doc.data().teams)
        console.log('b', JSON.stringify(doc.data().teams))
        resolve({ data: doc.data().data || doc.data(), ref: ref, objectID: docID })
      }
    })
  })
}

const getDocs = function(organisationID, collectionID, query) { // Query doesn't yet do anything
  return new Promise((resolve, reject) => {
    console.log('📥  Getting docs', collectionID)
    const ref = getCollectionRef(organisationID, collectionID)
    ref.get().then(docs => {
      console.log('🔍  Objects from ' + collectionID + ' found:', /* ref, */ docs.map(doc => smartObj(doc.data())))
      resolve(docs.map(doc => { return { data: doc.data().data || doc.data(), ref: ref.doc(doc.id), objectID: doc.id } }))
    }).catch(e => { console.log('📛 Error getting documents:', e); reject(e) })
  })
}

const getDocRef = (organisationID, collectionID, docID) => getCollectionRef(organisationID, collectionID).doc(docID)
const getCollectionRef = (organisationID, collectionID) => db.collection('organisations').doc(organisationID).collection(collectionID)

const getUser = (organisationID, userID) => getDoc(organisationID, 'users', userID)
const getTeam = (organisationID, teamID) => getDoc(organisationID, 'teams', teamID)
const getCard = (organisationID, cardID) => getDoc(organisationID, 'cards', cardID)
const getInvite = (organisationID, inviteID) => getDoc(organisationID, 'invites', inviteID)

const getSources = (organisationID) => getDocs(organisationID, 'sources')

const getUserRef = (organisationID, userID) => getDocRef(organisationID, 'users', userID) // eslint-disable-line
const getTeamRef = (organisationID, teamID) => getDocRef(organisationID, 'teams', teamID)
const getCardRef = (organisationID, cardID) => getDocRef(organisationID, 'cards', cardID)
const getSourceRef = (organisationID, sourceID) => getDocRef(organisationID, 'sources', sourceID)

const getUsersRef = organisationID => getCollectionRef(organisationID, 'users') // eslint-disable-line
const getTeamsRef = organisationID => getCollectionRef(organisationID, 'teams') // eslint-disable-line
const getCardsRef = organisationID => getCollectionRef(organisationID, 'cards')
const getFilesRef = organisationID => getCollectionRef(organisationID, 'files')
const getSourcesRef = organisationID => getCollectionRef(organisationID, 'sources')

const getID = function(snapshot) {
  console.log(5, snapshot)
  console.log(6, snapshot._referencePath)
  return snapshot._referencePath.segments[snapshot._referencePath.segments.length - 1]
}
const setDoc = function(organisationID, collectionID, docID, data) {
  return new Promise((resolve, reject) => {
    const ref = getDocRef(organisationID, collectionID, docID)
    ref.set(data).then(doc => {
      console.log('🔍 Object from ' + collectionID + ' found:', /* ref, */ doc.data())
      resolve({ data: doc.data(), ref: ref, objectID: docID })
    }).catch(function(err) {
      const e = { status: 500, message: '📛 Error setting object ' + docID + ' from ' + collectionID + ': ' + (err.message || err) }
      console.log('📛 Error!', e)
      reject(new Error(e))
    })
  })
}

const setUser = (organisationID, userID, data) => setDoc(organisationID, 'users', userID, data)
const setTeam = (organisationID, teamID, data) => setDoc(organisationID, 'teams', teamID, data) // eslint-disable-line
const setCard = (organisationID, cardID, data) => setDoc(organisationID, 'cards', cardID, data) // eslint-disable-line
const setSource = (organisationID, sourceID, data) => setDoc(organisationID, 'cards', sourceID, data) // eslint-disable-line

const getConfig = function(docID, varID) {
  return new Promise(function(resolve, reject) {
    db.collection('config').doc(docID).get()
    .then(data => {
      resolve(data.data()[varID])
    }).catch(e => {
      console.log('📛  Error!', e)
      reject(e)
    })
  })
}

const updateCard = (organisationID, user, card, content, meta) => updateCardMeta(updateCardContent(organisationID, user, card, content), meta)

const updateCardContent = function(organisationID, user, card, content) {
  const permission = getPermissionLevel(organisationID, user, card)
  console.log('🔑 Permission level: ' + permission)
  switch (permission) {
    case 'write':
      card.data.content = content // Should we merge here instead of replacing?
      break
    case 'submit':
      if (!card.data.pending) card.data.pending = []
      card.data.pending.push({ content: content, author: user.ref, submissionDate: new Date() })
      break
    default:
      // Something here?
  }
  return card
}

const updateCardMeta = (card, meta) => {
  if (meta)
    card.data.meta = meta
  console.log('🗂 Final card: ', card)
  return card
}

const updateUserTeamRole = function(organisationID, user, team, role) {
  var updated = false
  user.data.teams = user.data.teams.map(userTeam => {
    if (userTeam.team._referencePath.segments[userTeam.team._referencePath.segments.length - 1] === team.objectID) {
      userTeam.role = role
      updated = true
    }
    return userTeam
  })
  if (!updated)
    user.data.teams.push({ team: team.ref, role: role })
  console.log('👤 Updated user:', user)
  return user
}

const getPermissionLevel = function(organisationID, user, card) {
  console.log('📃👩‍👩‍👦‍👦  Card Teams: ', smartObj(card.data.teams))
  console.log('👤👩‍👩‍👦‍👦  User Teams: ', smartObj(user.data.teams))
  const roles = user.data.teams.filter(function(userTeam) {
    return card.data.teams.filter(function(cardTeam) {
      return compareReferences(cardTeam, userTeam.team)
    }).length > 0
  }).map(userTeam => {
    return userTeam.role
  })
  console.log('🎓 Roles: ', roles)
  if (roles.indexOf('manager') > -1)
    return 'write'
  else if (roles.indexOf('member') > -1)
    return 'submit'
  else
    return null
}

// const algoliaGet = function(index, objectID) {
//   return new Promise((resolve, reject) => {
//     index.getObject(objectID, function(err, content) {
//       if (err) {
//         const e = { code: 500, message: '📛 🔁  Failed to sync with Algolia! (Delete)' }
//         console.log('📛 Error!', e.status, ':', e.message)
//         reject(new Error(e.message))
//       } else {
//         console.log('🔁  Synced with Algolia (Delete)')
//         resolve(content)
//       }
//     })
//   })
// }

/*                               */
/*                               */
/* ----------------------------- */
/* --------- UTILITIES --------- */
/* ----------------------------- */

const firebaseToAlgolia = function(data) {
  const card = {
    objectID: getID(data._ref),
    description: data.data().content.description,
    teams: data.data().teams.map(team => getID(team))
  }
  if (data.data().pending) card.pending = data.data().pending.map(submission => submission.content.description)
  console.log('🔎 Algolia card:', card)
  return card
}

const compareReferences = (ref1, ref2) => ref1._referencePath.segments.join('/') === ref2._referencePath.segments.join('/') // Should check _firestore as well?

const requireProps = function(data, props, orProps) {
  // Eventually this should check for types too - or could just start using Flow: https://devhints.io/flow
  props.forEach(function(key) {
    if (data[key] == null) delete data[key]
    if (!data[key]) {
      const e = { status: 400, message: 'No ' + key + ' data found in request.' }
      console.log('📛 Error!', e.status, ':', e.message)
      throw new Error(e)
    }
  })
  if (orProps)
    orProps.forEach(function(group) { // These are groups of properties where at least one in the group must be present
      if (group.filter(function(key) {
        if (data[key] == null) delete data[key]
        return !!data[key]
      }).length === 0) {
        const e = { status: 400, message: 'None of ' + group.join(' or ') + ' found in request.' }
        console.log('📛 Error!', e.status, ':', e.message)
        throw new Error(e)
      }
    })
}

const smartObj = function (smartVar) {
  var newVar = JSON.parse(JSON.stringify(smartVar))
  if (newVar && newVar._referencePath)
    newVar = newVar._referencePath.segments.join('/')
  else if (typeof newVar === 'object')
    Object.keys(newVar).forEach(key => {
      if (newVar[key] === null)
        delete newVar[key]
      else
        newVar[key] = smartObj(newVar[key])
    })
  else if (newVar.constructor === Array)
    newVar.map(el => {
      return smartObj(el)
    })
  return newVar
}

const smartIdObj = function (smartVar) {
  var newVar = JSON.parse(JSON.stringify(smartVar))
  if (newVar && newVar._referencePath)
    newVar = getID(newVar)
  else if (typeof newVar === 'object')
    Object.keys(newVar).forEach(key => {
      if (newVar[key] === null)
        delete newVar[key]
      else
        newVar[key] = smartIdObj(newVar[key])
    })
  else if (newVar.constructor === Array)
    newVar.map(el => {
      return smartIdObj(el)
    })
  return newVar
}
