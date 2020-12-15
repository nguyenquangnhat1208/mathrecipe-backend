const moment = require('moment-timezone');
const FirebaseNoti = require('../models/firebaseNoti')
const admin = require("firebase-admin");
var serviceAccount = require('../services/keys/mathnote-firebase-adminsdk-19vgb-138423eb2d.json');
const BibleVerse = require('../models/bibleVerse');
const Scripture = require('../models/scripture');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mathnote-default-rtdb.firebaseio.com"
})
// moment().tz(process.env.TIMEZONE);
exports.SetNotification = async (req, res) => {
    req.checkBody('registrationToken', 'registrationToken is empty !').notEmpty();
    req.checkBody('timer', 'timer is empty !').notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        res.status(200).json({ status: false, msg: errors, code: 'ERR_CREATE_BibleVerse' });
    } else {
        try {
            var check = await FirebaseNoti.findOne({ registrationToken: req.body.registrationToken });
            var timer = moment(parseInt(req.body.timer)).tz(process.env.TIMEZONE);

            // console.log("timer:" + timer.format('HH:mm'));
            // console.log("utcOffset:" + timer.utcOffset());
            // console.log("utc:" + process.env.TIMEZONE);
            // console.log("hour:" + timer.hour());
            // console.log("minute:" + timer.minute());
            if (check) {
                check.set({
                    hour: timer.hour(),
                    minute: timer.minute(),
                });
                console.log("update", check);
                check.save((error, result) => {
                    if (error)
                        res.status(200).json({ status: false, msg: error, code: 'ERR_CREATE_NOTI' })
                    res.status(200).json({ status: true, msg: 'Update noti success' })
                });
            } else {
                let firebaseNoti = new FirebaseNoti({
                    registrationToken: req.body.registrationToken,
                    hour: timer.hour(),
                    minute: timer.minute(),
                })
                console.log("create", firebaseNoti);
                firebaseNoti.save((error, result) => {
                    if (error)
                        res.status(200).json({ status: false, msg: error, code: 'ERR_CREATE_NOTI' })
                    res.status(200).json({ status: true, msg: 'Create noti success' })
                });
            }
        } catch (error) {
            console.log(error);
            res.status(200).json({ status: false, msg: error });
        }
    }
}
exports.DisableNotification = async (req, res) => {
    req.checkBody('registrationToken', 'registrationToken is empty !').notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        res.status(200).json({ status: false, msg: errors, code: 'ERR_CREATE_BibleVerse' });
    } else {
        FirebaseNoti.findOneAndDelete({ registrationToken: req.body.registrationToken }, (error, result) => {
            if (error)
                res.status(200).json({ status: false, msg: error, code: 'ERR_CREATE_NOTI' })
            res.status(200).json({ status: true, msg: 'Delete remider success' })
        });
    }
}
async function sendNotification() {
    try {
        let currentTime = moment().tz(process.env.TIMEZONE);
        console.log("=> Now: " + currentTime.hour().toString() + ":" + currentTime.minutes().toString());
        let firebaseNoti = await FirebaseNoti.find({ hour: currentTime.hours().toString(), minute: currentTime.minutes().toString() });

        if (firebaseNoti.length > 0) {
            let script = await Scripture.find({ status: true });
            let array = [];//array scripture
            for (let i = 0; i < script.length; i++) {
                if (await BibleVerse.countDocuments({ scripture_id: script[i]._id }) > 0) {
                    array.push(script[i]._id)
                }
            }
            let rdm1 = Math.floor(Math.random() * array.length);
            let _idScripture = array[rdm1];

            let bibleVerse = await BibleVerse.find({ scripture_id: _idScripture, status: true }).sort({ createdAt: -1 });
            //covert to string array
            // let arr = Array.from(bibleVerse.map(e => e.image_url));
            //List device token to call
            let listToken = Array.from(firebaseNoti.map(e => e.registrationToken));
            let rdm = Math.floor(Math.random() * bibleVerse.length);
            const msg = {
                notification: { title: bibleVerse[rdm].no_title, body: bibleVerse[rdm].no_content },
                tokens: listToken,
                data: {
                    'click_action': 'FLUTTER_NOTIFICATION_CLICK',
                    // 'image_url': JSON.stringify(arr),
                    'current': rdm.toString(),
                    'scripture_id': _idScripture.toString()
                },
                apns: {
                    headers: {
                        'apns-priority': '10',
                    },
                    payload: {
                        aps: {
                            sound: 'default',
                        }
                    },
                },
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                    }
                },
            }
            admin.messaging().sendMulticast(msg)
                .then(response => {
                    console.log(response);
                })
                .catch(error => {
                    console.log(error);
                });
        }
    } catch (error) {
        console.log(error);
    }
}
exports.callfirebase = async (req, res) => {
    try {
        let currentTime = moment().tz(process.env.TIMEZONE);
        let hour, minute;
        if (req.query.hour && req.query.minute) {
            hour = req.query.hour.toString();
            minute = req.query.minute.toString();
        } else {
            hour = currentTime.hours().toString();
            minute = currentTime.minutes().toString();
        }
        console.log("=> send for: " + hour + ":" + minute);
        let firebaseNoti = await FirebaseNoti.find({ hour: hour, minute: minute }).lean();

        if (firebaseNoti.length > 0) {
            let script = await Scripture.find({ status: true });
            let array = [];//array scripture
            for (let i = 0; i < script.length; i++) {
                if (await BibleVerse.countDocuments({ scripture_id: script[i]._id }) > 0) {
                    array.push(script[i]._id)
                }
            }
            let rdm1 = Math.floor(Math.random() * array.length);
            let _idScripture = array[rdm1];

            let bibleVerse = await BibleVerse.find({ scripture_id: _idScripture, status: true }).sort({ createdAt: -1 });
            //covert to string array
            // let arr = Array.from(bibleVerse.map(e => e.image_url));
            //List device token to call
            let listToken = Array.from(firebaseNoti.map(e => e.registrationToken));
            let rdm = Math.floor(Math.random() * bibleVerse.length);
            const msg = {
                notification: { title: bibleVerse[rdm].no_title, body: bibleVerse[rdm].no_content },
                tokens: listToken,
                data: {
                    'click_action': 'FLUTTER_NOTIFICATION_CLICK',
                    // 'image_url': JSON.stringify(arr),
                    'current': rdm.toString(),
                    'scripture_id': _idScripture.toString()
                },
                apns: {
                    headers: {
                        'apns-priority': '10',
                    },
                    payload: {
                        aps: {
                            sound: 'default',
                        }
                    },
                },
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                    }
                },
            }
            admin.messaging().sendMulticast(msg)
                .then(response => {
                    // console.log(response);
                    response.responses.forEach((element) => {
                        if (!element.success) {
                            console.log("-> error");
                            console.log(element.error);
                        }
                        else {
                            console.log(element);
                        }
                    })
                })
                .catch(error => {
                    console.log(">error");
                    console.log(error);
                });
        }
        res.status(200).json({ status: true, msg: 'send remider success' });
    } catch (error) {
        console.log(error);
        res.status(200).json({ status: false, msg: 'send remider failed' })
    }
}
// var interval = setInterval(sendNotification, 1000 * 60);
// setTimeout(function () {
//     setInterval(sendNotification, 60000);
//     sendNotification();
// }, (60 - moment().tz(process.env.TIMEZONE).seconds()) * 1000);

exports.testing = async (req, res) => {
    try {
        // let currentTime = moment().tz(process.env.TIMEZONE);
        // // let hour, minute;
        // // if (req.query.hour && req.query.minute) {
        // //     hour = req.query.hour.toString();
        // //     minute = req.query.minute.toString();
        // // } else {
        // //     hour = currentTime.hours().toString();
        // //     minute = currentTime.minutes().toString();
        // // }
        // // console.log("=> send for: " + hour + ":" + minute);
        // // let firebaseNoti = await FirebaseNoti.find({ hour: hour, minute: minute }).lean();

        // // if (firebaseNoti.length > 0) {
        //     let script = await Scripture.find({ status: true });
        //     let array = [];//array scripture
        //     for (let i = 0; i < script.length; i++) {
        //         if (await BibleVerse.countDocuments({ scripture_id: script[i]._id }) > 0) {
        //             array.push(script[i]._id)
        //         }
        //     }
        //     let rdm1 = Math.floor(Math.random() * array.length);
        //     let _idScripture = array[rdm1];

        //     let bibleVerse = await BibleVerse.find({ scripture_id: _idScripture, status: true }).sort({ createdAt: -1 });
        //     //covert to string array
        //     // let arr = Array.from(bibleVerse.map(e => e.image_url));
        //     //List device token to call
        //     let listToken = [req.body.token];
        //     console.log(listToken);
        //     let rdm = Math.floor(Math.random() * bibleVerse.length);
        //     const msg = {
        //         notification: { title: bibleVerse[rdm].no_title, body: bibleVerse[rdm].no_content },
        //         tokens: listToken,
        //         data: {
        //             'click_action': 'FLUTTER_NOTIFICATION_CLICK',
        //             // 'image_url': JSON.stringify(arr),
        //             'current': rdm.toString(),
        //             'scripture_id': _idScripture.toString()
        //         },
        //         apns: {
        //             headers: {
        //                 'apns-priority': '10',
        //             },
        //             payload: {
        //                 aps: {
        //                     sound: 'default',
        //                 }
        //             },
        //         },
        //         android: {
        //             priority: 'high',
        //             notification: {
        //                 sound: 'default',
        //             }
        //         },
        //     }
        //     admin.messaging().sendMulticast(msg)
        //         .then(response => {
        //             // console.log(response);
        //             response.responses.forEach((element) => {
        //                 if (!element.success) {
        //                     console.log("-> error");
        //                     console.log(element.error);
        //                 }
        //                 else {
        //                     console.log(element);
        //                 }
        //             })
        //         })
        //         .catch(error => {
        //             console.log(">error");
        //             console.log(error);
        //         });
        // // }
        console.log(req.body);
        res.status(200).json({ status: true, msg: 'send remider success' });
    } catch (error) {
        console.log(error);
        res.status(200).json({ status: false, msg: 'send remider failed' })
    }
}
