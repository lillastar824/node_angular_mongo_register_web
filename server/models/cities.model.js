const mongoose = require('mongoose');

const cities = new mongoose.Schema({
    name: {
        type: String,
        index: true
    }
}, {
    collection: 'cities'
});

mongoose.model('cities', cities);