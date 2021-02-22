const mongoose = require('mongoose');

const restrictedatsignsSchema = new mongoose.Schema({
    name: {
        type: String,
        index: true,
        unique:true
    }
}, {
    collection: 'restrictedatsigns'
});

restrictedatsigns = mongoose.model('restrictedatsigns', restrictedatsignsSchema);
 module.exports = restrictedatsigns;
