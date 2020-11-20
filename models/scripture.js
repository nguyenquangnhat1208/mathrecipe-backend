let mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const schemaOptions = {
    versionKey: false,
    timestamps: { installed_day: 'created_at' }
};
let scripture = new mongoose.Schema({
    title: { type: String, default: "" },
    urlKey: { type: String, default: "" },
    public_id: { type: String, default: "" },
    thumbnail_url: { type: String, default: "" },
    image_url: { type: String, default: "" },
    status: { type: Boolean, default: false }

}, schemaOptions)
scripture.index({ 'title': 'text' });
scripture.plugin(mongoosePaginate);
module.exports = mongoose.model("scripture", scripture);