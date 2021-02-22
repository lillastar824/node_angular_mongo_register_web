const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

const atsignSchema = new mongoose.Schema({
    name: {
        type: String,
        index: true,
        unique: true
    },
}, {
    collection: 'atsigns'
});

module.exports = mongoose.model('Atsign', atsignSchema);