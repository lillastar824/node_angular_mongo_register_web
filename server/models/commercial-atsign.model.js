'use strict';
const mongoose = require('mongoose'),
    timeStamp = require('mongoose-timestamp'),
    Schema = mongoose.Schema;

let CommercialAtsignSchema = new Schema({
    atsign: {
        type: String,
        required: true
    },
    commissionPercentage: {
        type: Number,
        required: true,
    },
    discountOfferedPercentage: {
        type: Number
    },
    maxDiscountAmount: {
        type: Number
    },
    ownerId: {
        type: String,
        required: true
    }
});

CommercialAtsignSchema.index({ atsign: 1 }, { unique: true })

CommercialAtsignSchema.plugin(timeStamp)

module.exports = mongoose.model('CommercialAtsign', CommercialAtsignSchema);