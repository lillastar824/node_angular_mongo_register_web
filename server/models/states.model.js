const mongoose = require('mongoose');

const states = new mongoose.Schema({
    name: {
        type: String,
        index: true
    }
}, {
    collection: 'states'
});

mongoose.model('states', states);