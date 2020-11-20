const Scripture = require('../models/scripture');
const storageImage_s3 = require('../middleware/aws_cloud_storage');
const sharp = require('sharp');
var fs = require('fs');
const BibleVerse = require('../models/bibleVerse');
const { uploadImage, deleteImage } = require('../middleware/gc_cloud_storage');
const { log } = require('debug');
const { add } = require('winston');

exports.GetBibleVerse = (req, res) => {
    req.checkQuery('scripture_id', `scripture_id is wrong!`).isMongoId();
    // req.checkQuery('page', 'page is empty !').isMongoId();
    // req.checkQuery('length', 'length is empty !').isMongoId();
    const errors = req.validationErrors();
    if (errors) {
        res.status(200).json({ status: false, msg: errors, code: 'ERR_CREATE_BibleVerse' });
    } else {
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
        console.log(req.query.scripture_id);
        BibleVerse.paginate({ scripture_id: req.query.scripture_id }, options, (error, result) => {
            if (error) {
                res.status(200).json({ status: false, msg: error, code: 'ERR_GET_BibleVerse' });
            } else {
                res.status(200).json({ status: true, data: result.docs, recordsTotal: result.limit, recordsFiltered: result.totalDocs })
            }
        })
    }
}
exports.GetAllBibleVerse = (req, res) => {
    BibleVerse.find({ status: true }, (error, result) => {
        if (error) {
            res.status(200).json({ status: false, msg: error, code: 'ERR_GET_ALL_BibleVerse' });
        } else {
            res.status(200).json({ status: true, data: result })
        }
    }).select('image_url no_title no_content')
}
exports.GetBibleVerseForMobile = (req, res) => {
    req.checkQuery('scripture_id', `scripture_id is wrong!`).isMongoId();
    req.checkQuery('start', 'start is empty !').notEmpty();
    req.checkQuery('limit', 'limit is empty !').notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        res.status(200).json({ status: false, msg: errors, code: 'ERR_CREATE_BibleVerse' });
    } else {
        const options = {
            offset: req.query.start,
            // page: req.query.page,
            sort: { createdAt: -1 },
            limit: req.query.limit,
            collation: {
                locale: 'en'
            }
        };
        BibleVerse.paginate({ scripture_id: req.query.scripture_id, status: true }, options, (error, result) => {
            if (error) {
                res.status(200).json({ status: false, msg: error, code: 'ERR_GET_BibleVerse' });
            } else {

                res.status(200).json({ status: true, data: result.docs, recordsTotal: result.limit, recordsFiltered: result.totalDocs })
            }
        })
    }
}
exports.GetBibleVerseForSwiper = (req, res) => {
    req.checkQuery('scripture_id', `scripture_id is wrong!`).isMongoId();
    const errors = req.validationErrors();
    if (errors) {
        let arr = [];
        BibleVerse.find({ status: true }, (error, result) => {
            result.map(e => {
                arr.push(e.image_url);
            })
            res.status(200).json(arr);
        }).select('image_url').sort({ createdAt: -1 });
    } else {
        let arr = [];
        BibleVerse.find({ scripture_id: req.query.scripture_id, status: true }, (error, result) => {
            // result.map(e => {
            //     arr.push(e.image_url);
            // })
            res.status(200).json(result);
        }).select('image_url url_bulb url_book url_burgemenu url_ear').sort({ createdAt: -1 });
    }
}

//--------------------------------------------on cloud----------------------------------------------------

exports.CreateBibleVerseOnCloud = async (req, res) => {
    // req.checkBody('title', 'title is empty !').notEmpty();
    req.checkBody('scripture_id', 'scripture_id is empty !').isMongoId();
    const errors = req.validationErrors();
    if (errors) {
        res.status(200).json({ status: false, msg: errors, code: 'ERR_CREATE_SCRIPTURE' });
    } else {
        const file = req.file;
        let check = await Scripture.findOne({ _id: req.body.scripture_id });
        if (check) {
            if (file) {
                var urlImage = await uploadImage(file);
                var bibleVerse = new BibleVerse({
                    scripture_id: req.body.scripture_id,
                    thumbnail_url: urlImage.url,
                    public_id: urlImage.name,
                    thumbnail_url_app: urlImage.url,
                    url_ear: req.body.url_ear,
                    url_burgemenu: req.body.url_burgemenu,
                    url_book: req.body.url_book,
                    url_bulb: req.body.url_bulb,
                    image_url: urlImage.url,
                    no_title: req.body.no_title,
                    no_content: req.body.no_content,
                    status: req.body.status
                });
            } else {
                var bibleVerse = new BibleVerse({
                    scripture_id: req.body.scripture_id,
                    url_ear: req.body.url_ear,
                    url_burgemenu: req.body.url_burgemenu,
                    url_book: req.body.url_book,
                    url_bulb: req.body.url_bulb,
                    no_title: req.body.no_title,
                    no_content: req.body.no_content,
                    status: req.body.status
                });
            }

            bibleVerse.save((error, result) => {
                if (error)
                    res.status(200).json({ status: false, msg: error, code: 'ERR_CREATE_BibleVerse' })
                res.status(200).json({ status: true, msg: 'Create BibleVerse success', data: result })
            })

        } else {
            res.status(200).json({ status: false, msg: "not found", code: 'ERR_CREATE_BibleVerse' })
        }
    }
}
exports.UpdateScriptureOnCloud = async (req, res) => {
    // req.checkBody('title', 'title is empty !').notEmpty();
    req.checkBody('scripture_id', 'scripture_id is empty !').isMongoId();
    req.checkBody('_id', 'scripture_id is empty !').isMongoId();
    const errors = req.validationErrors();
    if (errors) {
        res.status(200).json({ status: false, msg: errors, code: 'ERR_CREATE_SCRIPTURE' });
    } else {
        const file = req.file;
        let bibleVerse = await BibleVerse.findOne({ _id: req.body._id });
        if (bibleVerse) {

            if (file) {
                //delete old image
                if (bibleVerse.public_id)
                    deleteImage(bibleVerse.public_id);

                var urlImage = await uploadImage(file);
                bibleVerse.set({
                    scripture_id: req.body.scripture_id,
                    thumbnail_url: urlImage.url,
                    public_id: urlImage.name,
                    thumbnail_url_app: urlImage.url,
                    url_ear: req.body.url_ear,
                    url_burgemenu: req.body.url_burgemenu,
                    url_book: req.body.url_book,
                    url_bulb: req.body.url_bulb,
                    image_url: urlImage.url,
                    no_title: req.body.no_title,
                    no_content: req.body.no_content,
                    status: req.body.status
                });
            } else {
                bibleVerse.set({
                    scripture_id: req.body.scripture_id,
                    url_ear: req.body.url_ear,
                    url_burgemenu: req.body.url_burgemenu,
                    url_book: req.body.url_book,
                    url_bulb: req.body.url_bulb,
                    no_title: req.body.no_title,
                    no_content: req.body.no_content,
                    status: req.body.status
                });
            }

            bibleVerse.save((error, result) => {
                if (error)
                    res.status(200).json({ status: false, msg: error, code: 'ERR_UPDATE_BibleVerse' })
                res.status(200).json({ status: true, msg: 'Update bibleVerse success', data: result })
            })
        } else {
            res.status(200).json({ status: false, msg: "not found", code: 'ERR_UPDATE_BibleVerse' });
        }
    }
}

exports.DeleteScriptureOnCloud = async (req, res) => {
    req.checkParams('id', 'id is empty !').notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        res.status(200).json({ status: false, msg: errors[0], code: 'ERR_CREATE_Scripture' });
    } else {
        let bibleVerse = await BibleVerse.findOne({ _id: req.params.id });
        if (bibleVerse) {
            if (bibleVerse.public_id)
                deleteImage(bibleVerse.public_id);
            bibleVerse.remove((error, result) => {
                if (error)
                    res.status(200).json({ status: false, msg: error, code: 'ERR_DELETE_Scripture' });
                res.status(200).json({ status: true, msg: 'Delete ' + result.title + ' success' });
            });
        } else {
            res.status(200).json({ status: false, msg: 'id not found' });
        }
    }
}