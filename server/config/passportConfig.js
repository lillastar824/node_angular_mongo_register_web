const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const { messages } = require('./../config/const');
const User = mongoose.model('User');

passport.use(
    new localStrategy({ usernameField: 'email' },
        (username, password, done) => {
            User.findOne({ email: username, userStatus: { $ne: 'Deleted' } },
                (err, user) => {
                    if (err)
                        return done(err);
                    // unknown user
                    else if (!user)
                        return done(null, false, { message: messages.UNREGISTER_EMAIL });
                    // wrong password
                    else if (!user.verifyPassword(password))
                        return done(null, false, { message: messages.INVALID_PASS });
                    // authentication succeeded
                    else
                        return done(null, user);
                });
        })
);