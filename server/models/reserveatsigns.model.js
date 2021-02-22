const mongoose = require('mongoose');

const atsignSchema = new mongoose.Schema({
    userid: {
        type: String,
        // unique: true
    },
    atsignName: {
        type: String,
        trim: true, index: true, unique: true, sparse: true
    },
    price: {
        type: Number,
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: null
    },
    timer_started: {
        type: Boolean,
        default: false
    },
    createdOn:{
        type: Date,
        default: Date.now
    },
    atsignType:{
        type: String
    }
}, {
    collection: 'reserveatsigns'
});

module.exports = mongoose.model('Reserveatsigns', atsignSchema);