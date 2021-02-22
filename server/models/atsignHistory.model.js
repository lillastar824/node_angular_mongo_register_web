const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

const atsignHistorySchema = new mongoose.Schema({
    // previousHandleName: {
    //     type: String
    // },
    atsignType: {
        type: String
    },
    // previousHandleType: {
    //     type: String,
    // },
    email: {
        type: String
        // unique: true
    },
    contact: {
        type: String
    },
    atsignName: {
        type: String
    },
    updatedOn: {
        type: Date,
        default: Date.now
    },
}, {
    collection: 'atsignHistory'
  });

// // Custom validation for email
// userSchema.path('email').validate((val) => {
//     emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//     return emailRegex.test(val);
// }, 'Invalid e-mail.');

// // Events
// userSchema.pre('save', function (next) {
//     bcrypt.genSalt(10, (err, salt) => {
//         bcrypt.hash(this.password, salt, (err, hash) => {
//             this.password = hash;
//             this.saltSecret = salt;
//             next();
//         });
//     });
// });


// // Methods
// userSchema.methods.verifyPassword = function (password) {
//     return bcrypt.compareSync(password, this.password);
// };

// userSchema.methods.generateJwt = function () {
//     return jwt.sign({ _id: this._id},
//         process.env.JWT_SECRET,
//     {
//         expiresIn: process.env.JWT_EXP
//     });
// }

mongoose.model('AtsignHistory', atsignHistorySchema);