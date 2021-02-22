'use strict';
const mongoose = require('mongoose'),
    timeStamp = require('mongoose-timestamp'),
    Schema = mongoose.Schema;

let TransferAtsignSchema = new Schema({
    atsign: {
        type: String,
        required: true
    },
    oldOwnerId: {
        type: String,
        required: true
    },
    newOwnerId: {
        type: String,
        required: true,
    },
    atsignType: {
        type: String,
        required: true
    },
    atsignPrice: {
        type: Number,
        required: true
    },
    atsignTransferPrice: {
        type: Number,
        required: true
    },
    transferedObject: {
        type: Object,
        required: true
    },
    transferredBy: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
});

TransferAtsignSchema.plugin(timeStamp)

module.exports = mongoose.model('TransferAtsign', TransferAtsignSchema);