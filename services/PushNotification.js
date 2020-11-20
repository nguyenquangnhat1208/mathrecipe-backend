var admin = require("firebase-admin");
var serviceAccount  = require('./keys/bible-app-3-firebase-adminsdk-e2fs1-f0c9c2eff4.json');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount ),
    databaseURL: "https://bible-app-3.firebaseio.com"
})

module.exports.admin = admin;