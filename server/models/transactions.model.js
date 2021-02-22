const mongoose = require('mongoose');

const atsignSchema = new mongoose.Schema({
    paymentIntentId: {
        type: String
        // trim: true, index: true, unique: true, sparse: true
    },
    userId: {
        type: String
    },
    amount: {
        type: Number
    },
    status: {
        type: String
    },
    atsignName: [{
        premiumAtsignType: {
            type: String
        },
        atsignName: {
            type: String,
            // trim: true, index: true, unique: true, sparse: true
        },
        payAmount: {
            type: Number
        }
    }],
    orderId: {
        type: String,
        trim: true,
        index: true,
        unique: true,
        sparse: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    promotionalCodeDetails: {
        type: {
            promotionalCardAmount: { type: String },
            promotionalCode: { type: String }
        }
    },
    type:{
        type:String
    }
}, {
    collection: 'transactions'
});

module.exports = mongoose.model('Transactions', atsignSchema);