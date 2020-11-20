var Url = require('../models/url');

exports.geturl = async (req, res) => {
    let url = await Url.findOne();
    if (url) {
        res.status(200).json({ status: true, url: [url] })
    } else {
        await new Url({
            url_youtube: "null",
            url_bulb: "null",
            url_book: "null",
            url_burgemenu: "null",
            url_ear: "null",
        }).save((error, result) => {
            if (error)
                res.status(200).json({ status: false, msg: error, code: 'ERR_UPDATE_URL' })
            else
                res.status(200).json({ status: true, data: result })
        });
    }
}
exports.Updateurl = async (req, res) => {
    try {
        let url = await Url.findOne();
        if (url) {
            url.set(req.body);
            url.save((error, result) => {
                if (error)
                    res.status(200).json({ status: false, msg: error, code: 'ERR_UPDATE_URL' })
                else
                    res.status(200).json({ status: true, msg: 'Update success', data: result })
            })
        } else {
            res.status(200).json({ status: false, msg: "Can't find url lunch", code: 'ERR_UPDATE_URL' })
        }
    } catch (error) {
        res.status(500).json({ status: false, msg: error, code: 'ERR_UPDATE_URL' })
    }
}
