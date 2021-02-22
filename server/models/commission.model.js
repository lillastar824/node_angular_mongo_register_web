'use strict';
const mongoose = require('mongoose'),
    timeStamp = require('mongoose-timestamp'),
    Schema = mongoose.Schema;

let CommissionSchema = new Schema({
    atsign: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    commissionOfferedPercentage: {
        type: Number,
        required: true,
    },
    discountOfferedPercentage: {
        type: Number
    },
    finalCommission: {
        type: Number,
        required: true,
    },
    maxDiscountAmount: {
        type: Number,
    },
    orderAmount:{
        type:Number,
        required:true
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending',
        required: true,
    },
    metadata: {
        commsionForUserId: {
            type: String,
            required: true
        },
        orderData: {
            type: [Object],
            required: true
        },
        orderId:{
            type:String,
            required: true
        }
    },
    currency: {
        type: String
    },
    transactionId: {
        type: String,
        default: ''
    }
});

CommissionSchema.plugin(timeStamp)

module.exports = mongoose.model('Commission', CommissionSchema);