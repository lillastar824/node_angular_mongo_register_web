const mongoose = require('mongoose');

const lastNames = new mongoose.Schema({
    name: {
        type: String,
        index: true
    }
}, {
    collection: 'lastNames'
});

mongoose.model('lastNames', lastNames);