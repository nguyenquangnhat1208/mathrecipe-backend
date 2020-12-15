var admin = require("firebase-admin");
var serviceAccount  = require('./keys/mathnote-firebase-adminsdk-19vgb-138423eb2d.json');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mathnote-default-rtdb.firebaseio.com"
})

module.exports.admin = admin;


