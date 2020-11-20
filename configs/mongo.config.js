const mongoose = require('mongoose');
const chalk = require('chalk');
// please hide connect string !!!
// mongoose.set('debug', true);
mongoose.set('autoIndex', false);
console.log(process.env.ENVIRONMENT !== 'dev' ? process.env.MONGODB_URI_PROD : process.env.MONGODB_LOCAL);
module.exports = mongoose.connect(process.env.ENVIRONMENT !== 'dev' ? process.env.MONGODB_URI_PROD : process.env.MONGODB_LOCAL, {
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