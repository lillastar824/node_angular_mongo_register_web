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
    transferredObject: {
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
    },
    updatedBy: {
        type: String,
    },
    history: [{
        date: {
            type: Date,
        },
        action: {
            type: String,
            enum: ['TRANSFER_MAIL_RESEND']
        }
    }]
});

TransferAtsignSchema.plugin(timeStamp)

module.exports = mongoose.model('TransferAtsign', TransferAtsignSchema);