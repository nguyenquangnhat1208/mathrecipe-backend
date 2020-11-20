let mongoose = require('mongoose');

const schemaOptions = {
    versionKey: false,
    timestamps: { installed_day: 'created_at' }
};
let url = new mongoose.Schema({
    url_youtube: { type: String, default: "" },
    url_bulb: { type: String, default: "" },
    url_book : { type: String, default: "" },
    url_burgemenu: { type: String, default: "" },
    url_ear: { type: String, default: "" },
}, schemaOptions)

module.exports = mongoose.model("url", url);