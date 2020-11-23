const mongoose = require('mongoose');
var fs = require('fs');
const nconf = require('nconf');
const chalk = require('chalk');
const path = require('path')
// please hide connect string !!!
// mongoose.set('debug', true);
nconf.argv().env().file({ file: path.join(__dirname, '../key.json') });
mongoose.set('autoIndex', false);
console.log(nconf.get("mongoDatabase"));
module.exports = mongoose.connect(nconf.get("mongoDatabase"), {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log("%s MongoDB connect success", chalk.green('✓'));
}).catch((error) => {
    console.log("%s MongoDB connect failed ", chalk.red('✗'));
    process.exit();
});