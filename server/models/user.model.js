const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String
        // required: 'Full name can\'t be empty'
    },
    email: {
        type: String,
        trim: true, index: true, unique: true, sparse: true
    },
    contact: {
        type: String,
        trim: true, index: true, unique: true, sparse: true
    },
    password: {
        type: String
        // required: 'Password can\'t be empty',
        // minlength: [4, 'Password must be atleast 4 character long']
    },
    saltSecret: {
        type: String
    },
    invitedBy: {
        type: String
    },
    referredBy: {
        type: String
    },
    cartReferalCode: {
        type: String,
        default: ''
    },
    invitedOn: {
        type: Date,
        default: Date.now,
        index:true
    },
    userStatus: {
        type: String
    },
    userRole: {
        type: String
    },
    mobileOtp: {
        type: String
    },
    otpGenerateTime: {
        type: Date
    },
    mobileVerified: {
        type: Boolean,
        default: false
    },
    isReserved: {
        type: String
    },
    reserveTime: {
        type: String,
        default: Date.now
    },
    premiumHandleType: {
        type: String
    },
    atsignDetails: [{
        inviteCode: {
            type: String,
            trim: true, index: true, unique: true, sparse: true
        },
        atsignType: {
            type: String
        },
        premiumAtsignType: {
            type: String
        },
        atsignName: {
            type: String,
            trim: true, index: true, unique: true, sparse: true
        },
        inviteLink: {
            type: String
        },
        atsignCreatedOn: {
            type: Date
        },
        payAmount: {
            type: Number
        },
        isActivated: {
            type: Number,
            default: 0
        },
        transferId: {
            type: String
        }
    }],
    productNotificationEmail: {
        type: Boolean
    },
    productNotificationMobile: {
        type: Boolean
    },
    inviteFriendDetails: [{
        inviteCodefriends: {
            type: String,
            trim: true, index: true, unique: true, sparse: true
        },
        used: {
            type: Boolean
        },
        inviteLink: {
            type: String
        },
        sentOn: {
            type: Date,
            default: Date.now
        }
    }],
    token: [String],
    lastLogin: {
        type: Date,
    },
    deleteReason: {
        type: String,
    },
    temp: {
        type: Object
    },
    lastVerification: {
        type: Date
    },
});

// Custom validation for email
// userSchema.path('email').validate((val) => {
//     emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//     return emailRegex.test(val);
// }, 'Invalid e-mail.');

// Events
userSchema.pre('save', function (next) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(this.password, salt, (err, hash) => {
            this.password = hash;
            this.saltSecret = salt;
            next();
        });
    });
});


// Methods
userSchema.methods.verifyPassword = function (password) {
    if (!this.password) {
        return false;
    }
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.generateJwt = function () {
    return jwt.sign({ _id: this._id },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXP
        });
}

module.exports = mongoose.model('User', userSchema);