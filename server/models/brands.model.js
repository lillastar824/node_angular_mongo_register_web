const mongoose = require('mongoose');

const brandsSchema = new mongoose.Schema({
    name: {
        type: String,
        index: true,
        unique:true
    }
}, {
    collection: 'brands'
});

 brands = mongoose.model('brands', brandsSchema);
 module.exports = brands;
