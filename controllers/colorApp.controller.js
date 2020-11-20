var ColorApp = require('../models/colorApp');

exports.GetColorApp = async (req, res) => {
    let colorApp = await ColorApp.findOne();
    if (colorApp) {
        res.status(200).json({ status: true, data: colorApp })
    } else {
        await new ColorApp({
            url_youtube: "null",
            Description: "null",
        }).save((error, result) => {
            if (error)
                res.status(200).json({ status: false, msg: error, code: 'ERR_UPDATE_COLORAPP' })
            else
                res.status(200).json({ status: true, data: result })
        });
    }
}
exports.UpdateColorApp = async (req, res) => {
    try {
        let colorApp = await ColorApp.findOne();
        if (colorApp) {
            colorApp.set(req.body);
            colorApp.save((error, result) => {
                if (error)
                    res.status(200).json({ status: false, msg: error, code: 'ERR_UPDATE_COLORAPP' })
                else
                    res.status(200).json({ status: true, msg: 'Update success', data: result })
            })
        } else {
            res.status(200).json({ status: false, msg: "Can't find colorApp", code: 'ERR_UPDATE_COLORAPP' })
        }
    } catch (error) {
        res.status(500).json({ status: false, msg: error, code: 'ERR_UPDATE_COLORAPP' })
    }
}
