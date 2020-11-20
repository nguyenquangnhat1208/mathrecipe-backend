const Scripture = require('../models/scripture');
const BibleVerse = require('../models/bibleVerse');
var Url = require('../models/url');

const storageImage_s3 = require('../middleware/aws_cloud_storage');
const sharp = require('sharp');
var fs = require('fs');
const { uploadImage, deleteImage } = require('../middleware/gc_cloud_storage');
// exports.selectScripture = async (req, res) => {
//     let data;

//     if (req.query.search) {
//         data = await Scripture.find({ $text: { $search: req.query.search } });
//     } else {
//         data = await Scripture.find({}).sort({created_at:-1});
//     }
//     let result = [];
//     data.map((e, i) => {
//         result.push({ "id": e._id, "text": e.TenScripture });
//     })
//     res.status(200).json(result);
// }
exports.GetScripture = (req, res) => {
    const options = {
        // offset: req.query.start,
        offset: req.body.start,
        page: req.body.draw,
        limit: req.body.length,
        sort: { createdAt: -1 },
        collation: {
            locale: 'en'
        }
    };
    Scripture.paginate({}, options, (error, result) => {
        if (error) {
            res.status(200).json({ status: false, msg: error, code: 'ERR_GET_Scripture' });
        } else {
            res.status(200).json({ status: true, data: result.docs, recordsTotal: result.limit, recordsFiltered: result.totalDocs })
        }
    })
}
exports.GetScriptureForMobile = async (req, res) => {
    req.checkQuery('start', 'start is empty !').notEmpty();
    req.checkQuery('limit', 'limit is empty !').notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        res.status(200).json({ status: false, msg: errors, code: 'ERR_CREATE_BibleVerse' });
    } else {
        try {
            const options = {
                offset: req.query.start,
                // page: req.query.page,
                sort: { createdAt: -1 },
                limit: req.query.limit,
                collation: {
                    locale: 'en'
                }
            };
            let url = await Url.findOne();
            // console.log(url.url_youtube);
            Scripture.paginate({ status: true }, options, (error, result) => {
                if (error) {
                    res.status(200).json({ status: false, msg: error, code: 'ERR_GET_Scripture' });
                } else {
                    let data = result.docs;
                    data[0].urlKey = url.url_youtube
                    res.status(200).json({ status: true, data: data, recordsTotal: result.limit, recordsFiltered: result.totalDocs })
                }
            })
        } catch (error) {
            console.log(error);
            res.status(200).json({ status: false, msg: "error", code: 'ERR_GET_Scripture' });
        }
    }
}

//--------------------------------------------on cloud----------------------------------------------------


exports.CreateScriptureOnCloud = async (req, res) => {
    req.checkBody('title', 'title is empty !').notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        res.status(200).json({ status: false, msg: errors, code: 'ERR_CREATE_SCRIPTURE' });
    } else {
        const file = req.file;
        let check = await Scripture.findOne({ title: req.body.title });
        if (!check) {
            if (file) {
                var urlImage = await uploadImage(file);
                var scripture = new Scripture({
                    title: (req.body.title.toUpperCase()).trim(),
                    urlKey: req.body.urlKey,
                    public_id: urlImage.name,
                    thumbnail_url: urlImage.url,
                    thumbnail_url_app: urlImage.url,
                    image_url: urlImage.url,
                    status: req.body.status
                });
            } else {
                var scripture = new Scripture({
                    title: (req.body.title.toUpperCase()).trim(),
                    urlKey: req.body.urlKey,
                    status: req.body.status
                });
            }
            scripture.save((error, result) => {
                if (error)
                    res.status(200).json({ status: false, msg: error, code: 'ERR_CREATE_SCRIPTURE' })
                res.status(200).json({ status: true, msg: 'Create scripture success', data: result })
            })

        } else {
            res.status(200).json({ status: false, msg: "already exist", code: 'ERR_CREATE_SCRIPTURE' })
        }
    }
}

exports.UpdateScriptureOnCloud = async (req, res) => {
    req.checkBody('title', 'title is empty !').notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        res.status(200).json({ status: false, msg: errors, code: 'ERR_CREATE_SCRIPTURE' });
    } else {
        const file = req.file;

        let scripture = await Scripture.findOne({ _id: req.body._id });
        if (scripture) {
            if (file) {
                var urlImage = await uploadImage(file);
                if (scripture.public_id)
                    deleteImage(scripture.public_id);
                scripture.set({
                    title: (req.body.title.toUpperCase()).trim(),
                    urlKey: req.body.urlKey,
                    public_id: urlImage.name,
                    thumbnail_url: urlImage.url,
                    thumbnail_url_app: urlImage.url,
                    image_url: urlImage.url,
                    status: req.body.status
                });
            } else {
                scripture.set({
                    title: (req.body.title.toUpperCase()).trim(),
                    urlKey: req.body.urlKey,
                    status: req.body.status
                });
            }
            scripture.save((error, result) => {
                if (error)
                    res.status(200).json({ status: false, msg: error, code: 'ERR_UPDATE_SCRIPTURE' })
                res.status(200).json({ status: true, msg: 'Update scripture success', data: result })
            })
        } else {
            res.status(200).json({ status: false, msg: "not found", code: 'ERR_UPDATE_SCRIPTURE' });
        }
    }
}

exports.DeleteScriptureOnCloud = async (req, res) => {
    req.checkParams('id', 'id is empty !').notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        res.status(200).json({ status: false, msg: errors[0], code: 'ERR_CREATE_Scripture' });
    } else {
        let scripture = await Scripture.findOne({ _id: req.params.id });
        let bibleVerse = await BibleVerse.find({ scripture_id: scripture._id });
        if (bibleVerse.length == 0) {
            if (scripture.public_id)
                deleteImage(scripture.public_id);
            scripture.remove((error, result) => {
                if (error)
                    res.status(200).json({ status: false, msg: error, code: 'ERR_DELETE_Scripture' });
                res.status(200).json({ status: true, msg: 'Delete ' + result.title + ' success' });
            });
        } else {
            res.status(200).json({ status: false, msg: "This scripture is used", code: 'ERR_DELETE_Scripture' });
        }
    }
}