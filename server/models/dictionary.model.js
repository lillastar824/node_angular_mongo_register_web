const mongoose = require('mongoose');

const dictionary = new mongoose.Schema({
    name: {
        type: String,
        index: true
    }
}, {
    collection: 'dictionary'
});

mongoose.model('dictionary', dictionary);