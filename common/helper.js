const { Storage } = require('@google-cloud/storage');
const path = require('path')

const storage = new Storage({
    keyFilename: path.join(__dirname, '../key.json'),
    projectId: 'bible-friend-288110',
});
module.exports = storage