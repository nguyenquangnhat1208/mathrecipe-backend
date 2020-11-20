let mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const schemaOptions = {
    versionKey: false,
    timestamps: { installed_day: 'created_at' }
};
let bibleVerses = new mongoose.Schema({
    scripture_id: { type: mongoose.Schema.Types.ObjectId, ref: 'scripture' },
    public_id: { type: String, default: "" },
    thumbnail_url: { type: String, default: "" },
    image_url: { type: String, default: "" },
    // url_youtube: { type: String, default: "" },
    url_bulb: { type: String, default: "" },
    url_book: { type: String, default: "" },
    url_burgemenu: { type: String, default: "" },
    url_ear: { type: String, default: "" },
    no_title: { type: String, default: "" },
    no_content: { type: String, default: "" },
    status: { type: Boolean, default: false }

}, schemaOptions)
bibleVerses.plugin(mongoosePaginate);
module.exports = mongoose.model("bible_verses", bibleVerses);