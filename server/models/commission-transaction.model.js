'use strict';
const mongoose = require('mongoose'),
    timeStamp = require('mongoose-timestamp'),
    Schema = mongoose.Schema;

let CommissionTransactionSchema = new Schema({
    transactionId: {
        type: String,
        unique: true,
        index: true,
    },
    atsign: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    totalOrderAmount: {
        type: Number,
        required: true,
    },
    totalFinalCommission: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    status:{
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending',
        required: true,
    },
    metadata: {
        type:Object
    }
});

CommissionTransactionSchema.plugin(timeStamp)

module.exports = mongoose.model('CommissionTransaction', CommissionTransactionSchema);