const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

var userLogSchema = new mongoose.Schema({
    userid: String,
    createdOn: {
        type: Date,
        default: Date.now, index: true
    },
    method: String,
    url: String,
    body: String,
    referer: String,
    userAgent: String
});

mongoose.model('UserLog', userLogSchema);