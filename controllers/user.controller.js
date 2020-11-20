var User = require('../models/user');

exports.GetUser = (req, res) => {
    try {
        const options = {
            offset: req.body.start,
            page: req.body.draw,
            sort: { updated_at: -1 },
            limit: req.body.length,
            collation: {
                locale: 'en'
            }
        };
        User.paginate({}, options, (error, result) => {
            if (error) {
                res.status(200).json({ status: false, msg: error, code: 'ERR_GET_USER' });
            } else {
                res.status(200).json({ status: true, data: result.docs, recordsTotal: result.limit, recordsFiltered: result.totalDocs })
            }
        })
    } catch (error) {
        console.log(error);
    }
}
exports.CreateUser = async (req, res) => {
    try {
        req.checkBody('email', 'email is null !').notEmpty();
        req.checkBody('password', 'password is null!').notEmpty();
        const errors = req.validationErrors();
        if (errors) {
            res.status(200).json({ status: false, msg: errors, code: 'ERR_CREATE_USER' });
        } else {
            let emailCheck = await User.findOne({ email: req.body.email });
            if (emailCheck) {
                res.status(200).json({ status: false, msg: "This username already exist", code: 'ERR_CREATE_USER' })
            } else {
                var user = new User({
                    email: req.body.email,
                    password: req.body.password,
                    role: req.body.role,
                });
                await user.save((error, result) => {
                    if (error)
                        res.status(200).json({ status: false, msg: error, code: 'ERR_CREATE_USER' })
                    res.status(200).json({ status: true, msg: 'Create success!', data: result })
                })
            }
        }
    }
    catch (err) {
        res.status(500).json({ status: false, msg: err, code: 'ERR_CREATE_USER' })
    }
}
exports.UpdateUser = async (req, res) => {
    req.checkParams('id', 'ID is null !').isMongoId();
    req.checkBody('email', 'Username is null !').notEmpty();
    req.checkBody('password', 'Password is null !').notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        res.status(200).json({ status: false, msg: errors, code: 'ERR_UPDATE_USER' });
    } else {
        try {
            const user = await User.findById(req.params.id);
            if (user) {
                const usercheck = await User.findOne({ email: req.body.email });
                if (user.email === req.body.email) {
                    user.set(req.body);
                    user.save((error, result) => {
                        if (error)
                            res.status(200).json({ status: false, msg: error, code: 'ERR_UPDATE_USER' })
                        else
                            res.status(200).json({ status: true, msg: 'Update success!', data: user })
                    })
                } else {
                    if (!usercheck) {
                        user.set(req.body);
                        user.save((error, result) => {
                            if (error)
                                res.status(200).json({ status: false, msg: error, code: 'ERR_UPDATE_USER' })
                            else
                                res.status(200).json({ status: true, msg: 'Update success!', data: user })
                        })
                    } else {
                        res.status(200).json({ status: false, msg: 'Data not found', code: 'ERR_UPDATE_USER' })
                    }
                }
            } else {
                res.status(200).json({ status: false, msg: 'Data not found', code: 'ERR_UPDATE_USER' })
            }
        } catch (error) {
            res.status(500).json({ status: false, msg: error, code: 'ERR_UPDATE_USER' })
        }
    }
}
exports.changePassword = async (req, res) => {
    req.checkBody('id', 'ID trống !').notEmpty();
    req.checkBody('password', 'Mật khẩu trống !').notEmpty();
    req.checkBody('confirm_password', 'Xác nhận mật khẩu trống !').notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        res.status(200).json({ status: false, msg: errors, code: 'ERR_UPDATE_USER' });
    } else {
        if (req.body.password === req.body.confirm_password) {
            let user = await User.findById(req.body.id);

            if (user) {
                user.set({ password: req.body.password });
                user.save();
                res.status(200).json({ status: true, msg: "Change password success !" })
            } else {
                res.status(200).json({ status: false, msg: "Can not change password !" });
            }
        } else {
            res.status(200).json({ status: false, msg: "Password wrong !" });
        }
    }
}
exports.DeleteUser = async (req, res) => {
    req.checkParams('id', 'id is null !').notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        res.status(200).json({ status: false, msg: errors[0], code: 'ERR_DELETE_ACCOUNT' });
    } else {
        let countU = await User.find();
        if (countU.length == 1) {
            res.status(200).json({ status: false, msg: "Can not delete this account !!!" });
        } else
            User.findByIdAndDelete(req.params.id, (error, result) => {
                if (error)
                    res.status(200).json({ status: false, msg: error, code: 'ERR_DELETE_ACCOUNT' });
                res.status(200).json({ status: true, msg: 'Delete ' + result.email + ' success!' });
            })
    }
}