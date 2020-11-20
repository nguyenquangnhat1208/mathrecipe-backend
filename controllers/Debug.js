const Debuger = require("../models/debug");
exports.CreateDebuger = async (req, res) => {
    let debuger = new Debuger({
        onWhere: req.body.onWhere,
        error: req.body.error
    })
    debuger.save((error, result) => {
        if (error)
            res.status(200).json({ status: false, msg: error, code: 'DEBUG' })
        res.status(200).json({ status: true, msg: 'DEBUG', data: result })
    })
}