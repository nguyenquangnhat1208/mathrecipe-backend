let mongoose = require('mongoose');

const schemaOptions = {
    versionKey: false,
    timestamps: { installed_day: 'created_at' }
};
let debug = new mongoose.Schema({
    onWhere: { type: String, default: "" },
    error: { type: String, default: "" },
}, schemaOptions)
module.exports = mongoose.model("debug", debug);