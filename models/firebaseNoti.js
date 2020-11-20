let mongoose = require('mongoose');
const schemaOptions = {
    versionKey: false,
    timestamps: { installed_day: 'created_at' }
};
let firebasenoti = new mongoose.Schema({
    registrationToken: { type: String, default: "" },
    hour: { type: String, default: "" },
    minute: { type: String, default: "" },
}, schemaOptions)

module.exports = mongoose.model("firebasenoti", firebasenoti);