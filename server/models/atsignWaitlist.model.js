const mongoose = require('mongoose');

const atsignSchema = new mongoose.Schema({
    userid: {
        type: String,
        // unique: true
    },
    atsignName: {
        type: String
    },
    createdOn:{
        type: String,
        default: Date.now
    }
}, {
    collection: 'atsignwaitlist'
});

mongoose.model('Atsignwaitlist', atsignSchema);