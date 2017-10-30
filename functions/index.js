// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!")
// })





// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
var db = admin.firestore();


// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest((req, res) => {
  // Grab the text parameter.
  const first = req.query.first;
  const last = req.query.last;
  // // Push the new message into the Realtime Database using the Firebase Admin SDK.
  // admin.database().ref('/messages').push({original: original}).then(snapshot => {
  //   // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
  //   res.redirect(303, snapshot.ref);
  // });
  var docRef = db.collection('users').doc('alovelace');

  var setAda = docRef.set({
      first: first,
      last: last,
      born: 1815
  }).then(snapshot => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    res.status(200).json(snapshot.ref);
  })
});





exports.saveCard = functions.https.onRequest((req, res) => {
  const data = {
    organisationID: req.data.organisation,
    cardID: req.data.objectID,
    content: req.data.content,
    authorID: req.data.author || req.data.sender
  }

  getUser(data.organisationID, data.authorID)
  .then(user => { data.user = user.data; return getCard(data.organisationID, data.cardID) })
  .then(card => {
    data.card = card.data
    data.cardRef = card.ref
    const newCard = updateCardContent(data.organisationID, data.user, data.card, data.content)
    return data.cardRef.set(newCard)
  }).then(snapshot => {
    res.status(200).json(snapshot.ref)
  }).catch(e => res.error(e))
});

const getObject = function(organisationID, collectionID, objectID) {
  return new Promise((resolve, reject) => {
    const ref = db.collection('organisations').doc(organisationID).collection(collectionID).doc(userID)
    ref.get().then(doc => {
      if (!doc.exists) {
        console.log('❌ Couldn\'t find object from ' + objectType)
        reject(404)
      } else {
        console.log('🔍 Object from ' + objectType + ' found:', ref, doc.data());
        resolve({ data: doc.data(), ref: ref })
      }
    })
  })
}

const getUser = function(organisationID, userID) {
  return getObject(organisationID, 'users', userID)
}

const getTeam = function(organisationID, teamID) {
  return getObject(organisationID, 'teams', teamID)
}

const getCard = function(organisationID, cardID) {
  return getObject(organisationID, 'cards', cardID)
}

const getPermissionLevel = function(organisationID, user, card) {
  const roles = user.teams.filter(function(team) {
    return card.teams.indexOf(team.team) > -1
  }).map(function(team) {
    return team.role
  })
  if (roles.indexOf('manager') > -1)
    return 'write'
  else if (roles.indexOf('member') > -1)
    return 'submit'
  else
    return null
}

const updateCardContent = function(organisationID, user, card, content) {
  const permission = getPermissionLevel(organisationID, user, card)
  console.log('🔑 Permission level: ' + permission);
  switch (permission) {
    case 'write':
      card.content = content // Should we merge here instead of replacing?
      break;
    case 'read':
      card.pending.push(content) // Should we merge here instead of replacing?
      break;
    default:
      // Something here?
  }
  console.log('🗂 Final card: ', card);
  return card
}
