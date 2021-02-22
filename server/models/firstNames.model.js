const mongoose = require('mongoose');

const firstNames = new mongoose.Schema({
    name: {
        type: String,
        index: true
    }
}, {
    collection: 'firstNames'
});

mongoose.model('firstNames', firstNames);