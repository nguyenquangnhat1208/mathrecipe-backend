// var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    //Passport register
    // passport.use('local.register', new LocalStrategy({
    //     usernameField: 'username',
    //     passswordField: 'password',
    //     passReqToCallback: true
    // }, function (req, username, password, done) {
    //     User.findOne({
    //         'username': username
    //     }, function (err, user) {
    //         if (err) {
    //             return done(err)
    //         }
    //         if (user) {
    //             console.log('username đã tồn tại')
    //             return done(null, false, {
    //                 message: 'username đã được sử dụng, vui lòng chọn email khác'
    //             })
    //         }

    //         var newUser = new User();
    //         newUser.info.firstname = req.body.firstname;
    //         newUser.info.lastname = req.body.lastname;
    //         newUser.local.email = email;
    //         newUser.local.password = password;

    //         newUser.save(function (err, result) {
    //             if (err) {
    //                 return done(err);
    //             } else {
    //                 return done(null, newUser);
    //             }
    //         });
    //     })
    // }));

    /* Passport login */
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, password, done) {
        // console.log(email,password);
        User.findOne({
            email: email
        }, function (err, user) {

            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false, req.flash('message', 'user not found'));
            }

            user.comparePassword(password, function (err, isMatch) {

                if (err) {
                    return done(err);
                }
                if (!isMatch) {
                    return done(null, false, req.flash('message', 'password incorrect'));
                }
                return done(null, user);

            });

        });
    }));
}