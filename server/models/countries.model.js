const mongoose = require('mongoose');

const countries = new mongoose.Schema({
    name: {
        type: String,
        index: true
    }
}, {
    collection: 'countries'
});

mongoose.model('countries', countries);