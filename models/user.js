var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
const mongoosePaginate = require('mongoose-paginate-v2');

var UserSchema = new mongoose.Schema({

    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: { type: String, default: "" },

}, {
    timestamps: true
});

UserSchema.pre('save', function (next) {

    var user = this;
    var SALT_FACTOR = 5;

    if (!user.isModified('password')) {
        return next();
    }

    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {

        if (err) {
            return next(err);
        }

        bcrypt.hash(user.password, salt, null, function (err, hash) {

            if (err) {
                return next(err);
            }

            user.password = hash;
            next();

        });

    });

});

UserSchema.methods.comparePassword = function (passwordAttempt, cb) {

    bcrypt.compare(passwordAttempt, this.password, function (err, isMatch) {

        if (err) {
            return cb(err);
        } else {
            cb(null, isMatch);
        }
    });

}
UserSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', UserSchema);