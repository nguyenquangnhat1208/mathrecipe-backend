let mongoose = require('mongoose');

const schemaOptions = {
    versionKey: false,
    timestamps: { installed_day: 'created_at' }
};
let colorApp = new mongoose.Schema({
    url_youtube: { type: String, default: "" },
    Description: { type: String, default: "" },
}, schemaOptions)

module.exports = mongoose.model("colorApp", colorApp);