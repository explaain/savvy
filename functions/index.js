// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!")
// })




const merge = require('merge')
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions')
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)
var db = admin.firestore()

exports.saveCard = functions.https.onRequest((req, res) => {
  try {
    console.log('📬 Data just arrived:', req.body)
    requireProps(req.body, ['organisationID', 'content', 'authorID'], [['objectID', 'teamID']])
    const data = req.body; data.cardID = req.body.objectID; if (data.objectID) delete data.objectID

    getUser(data.organisationID, data.authorID)
    .then(user => {
      data.user = user.data
      return getCard(data.organisationID, data.cardID)
    }).catch(function(e) {
      return new Promise((res, rej) => { res() })
    }).then(card => {
      data.card = card ? card.data : {
        content: data.content,
        teams: [ getTeamRef(data.teamID) ],
      }
      const updatedCard = updateCardContent(data.organisationID, data.user, data.card, data.content)
      if (card) {
        data.cardRef = card.ref
        return data.cardRef.set(updatedCard)
      } else if (data.cardID) {
        return getCardRef(data.organisationID, data.cardID).set(updatedCard)
      } else {
        return getCardsRef(data.organisationID).add(updatedCard)
      }
    }).then(snapshot => {
      if (!data.cardID) data.cardID = snapshot._referencePath.segments[snapshot._referencePath.segments.length - 1]
      return getCardRef(data.organisationID, data.cardID).get()
    }).then(doc => {
      const cardData = merge(doc.data(), { objectID: data.cardID })
      console.log('📂 Card Saved!', cardData)
      res.status(200).json(cardData)
    }).catch(e => { console.log('📛 Error!', e); res.status(500).send(e) })
  } catch (e) {
    console.log('📛 Error!', e.status, e.message)
    res.status(e.status || 500).send(e.message || 'Unknown Server Error')
  }
})

exports.changeUserTeamRole = functions.https.onRequest((req, res) => {
  try {
    console.log('📬 Data just arrived:', req.body)
    requireProps(req.body, ['organisationID', 'userID', 'teamID', 'role'])
    const data = req.body

    getUser(data.organisationID, data.userID)
    .then(user => { data.user = user.data; data.userRef = user.ref; return getTeam(data.organisationID, data.teamID) })
    .then(team => {
      data.team = team.data
      data.teamRef = team.ref
      const updatedUser = updateUserTeamRole(data.organisationID, data.user, data.team, data.teamID, data.teamRef, data.role)
      return data.userRef.set(updatedUser)
    }).then(snapshot => {
      return admin.auth().setCustomUserClaims(data.userID, {admin: true})
    }).then(snapshot => {
      res.status(200).json(snapshot)
    }).catch(e => { console.log('📛 Error!', e); res.status(500).send(e) })
  } catch (e) {
    console.log('📛 Error!', e)
    res.status(e.status || 500).send(e.message || 'Unknown Server Error')
  }
})






const getDoc = function(organisationID, collectionID, docID) {
  return new Promise((resolve, reject) => {
    const ref = db.collection('organisations').doc(organisationID).collection(collectionID).doc(docID)
    ref.get().then(doc => {
      if (!doc.exists) {
        console.log('❌ Couldn\'t find object from ' + collectionID)
        reject(404)
      } else {
        console.log('🔍 Object from ' + collectionID + ' found:', /* ref, */ doc.data())
        resolve({ data: doc.data(), ref: ref })
      }
    })
  })
}

const getDocRef = function(organisationID, collectionID, docID) {
  return getCollectionRef(organisationID, collectionID).doc(docID)
}
const getCollectionRef = function(organisationID, collectionID) {
  return db.collection('organisations').doc(organisationID).collection(collectionID)
}

const getUser = function(organisationID, userID) {
  return getDoc(organisationID, 'users', userID)
}
const getTeam = function(organisationID, teamID) {
  return getDoc(organisationID, 'teams', teamID)
}
const getCard = function(organisationID, cardID) {
  return getDoc(organisationID, 'cards', cardID)
}
const getUserRef = function(organisationID, userID) {
  return getDocRef(organisationID, 'users', userID)
}
const getTeamRef = function(organisationID, teamID) {
  return getDocRef(organisationID, 'teams', teamID)
}
const getCardRef = function(organisationID, cardID) {
  return getDocRef(organisationID, 'cards', cardID)
}
const getUsersRef = function(organisationID) {
  return getCollectionRef(organisationID, 'users')
}
const getTeamsRef = function(organisationID) {
  return getCollectionRef(organisationID, 'teams')
}
const getCardsRef = function(organisationID) {
  return getCollectionRef(organisationID, 'cards')
}

const updateCardContent = function(organisationID, user, card, content) {
  const permission = getPermissionLevel(organisationID, user, card)
  console.log('🔑 Permission level: ' + permission)
  switch (permission) {
    case 'write':
      card.content = content // Should we merge here instead of replacing?
      break
    case 'submit':
      card.pending ? card.pending.push(content) : card.pending = [content] // Should we merge here instead of replacing?
      break
    default:
      // Something here?
  }
  console.log('🗂 Final card: ', card)
  return card
}

const updateUserTeamRole = function(organisationID, user, team, teamID, teamRef, role) {
  var updated = false
  user.teams = user.teams.map(function(userTeam) {
    console.log(userTeam.team._referencePath.segments[userTeam.team._referencePath.segments.length - 1], teamID)
    if (userTeam.team._referencePath.segments[userTeam.team._referencePath.segments.length - 1] == teamID) {
      userTeam.role = role
      updated = true
    }
    return userTeam
  })
  console.log(updated)
  if (!updated) {
    user.teams.push({ team: teamRef, role: role })
  }
  console.log('👤 Updated user:', user)
  return user
}

const getPermissionLevel = function(organisationID, user, card) {
  console.log('📃👩‍👩‍👦‍👦  Card Teams: ', card.teams)
  console.log('👤👩‍👩‍👦‍👦  User Teams: ', user.teams)
  const roles = user.teams.filter(function(userTeam) {
    return card.teams.filter(function(cardTeam) {
      return compareReferences(cardTeam, userTeam.team)
    }).length > 0
  }).map(function(userTeam) {
    console.log(userTeam);
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

const compareReferences = function(ref1, ref2) {
  console.log(ref1._referencePath.segments.join('/'), ref2._referencePath.segments.join('/'));
  return ref1._referencePath.segments.join('/') == ref2._referencePath.segments.join('/') // Should check _firestore as well?
}

const requireProps = function(data, props, orProps) {
  props.forEach(function(key) {
    if (!data[key]) {
      const e = { status: 400, message: 'No ' + key + ' data found in request.' }
      throw new Error(e)
    }
  })
  orProps.forEach(function(group) { // These are groups of properties where at least one in the group must be present
    if (group.filter(function(key) {
      return !!data[key]
    }).length == 0) {
      const e = { status: 400, message: 'No ' + key + ' data found in request.' }
      throw new Error(e)
    }
  })
}
