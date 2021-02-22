const mongoose = require('mongoose');

const atsignSchema = new mongoose.Schema({
    key: {
        type: String,
        unique: true
    },
    value: {
        type: String
    }
}, {
    collection: 'atsignconfigs'
});

module.exports = mongoose.model('Atsignconfigs', atsignSchema);