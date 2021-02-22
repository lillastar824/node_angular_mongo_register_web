'use strict';
const mongoose = require('mongoose'),
    timeStamp = require('mongoose-timestamp'),
    Schema = mongoose.Schema;

let AtsignDetailSchema = new Schema({
    userId: {
        type: String
    },
    atsignName: {
        type: String,
        // unique: true
    },
    inviteCode: {
        type: String,
        // unique: true,
    },
    atsignType: {
        type: String
    },
    premiumAtsignType: {
        type: String
    },
    inviteLink: {
        type: String
    },
    atsignCreatedOn: {
        type: Date
    },
    payAmount: {
        type: Number
    },
    isActivated: {
        type: Number,
        default: 0
    },
    transferId: {
        type: String
    },
    lastPaymentValidFrom: {
        type: Date,
    },
    lastPaymentValidTill: {
        type: Date,
    },
    paymentDetails: [{
        period_start: {
            type: Date
        },
        period_end: {
            type: Date
        },
        amount_paid: {
            type: Number
        },
        billing_reason: {
            type: String
        },
        total: {
            type: Number
        },
    }],
    status: {
        type: String
    },
    transferId:{
        type:String
    }
});
// ["ACTIVE","TRANSFERRING","DELETED"]
// AtsignDetailSchema.index({ atsign: 1 }, { unique: true })

AtsignDetailSchema.plugin(timeStamp)

let index = mongoose.model('AtsignDetail', AtsignDetailSchema);
module.exports = index


// db.getCollection('users').find({}).forEach(user => {
//     user.atsignDetails.forEach(atsign => {
        
//         if (atsign.atsignName && atsign.atsignType && atsign.atsignCreatedOn) {
//             if(!atsign['payAmount']) print(atsign)
//             atsign['userId'] = user._id + ''
//             atsign['lastPaymentValidFrom'] = atsign.atsignCreatedOn;
//             let date = new Date(atsign.atsignCreatedOn)
//             date.setUTCHours(0);
//             date.setUTCMinutes(0);
//             date.setUTCSeconds(0);
//             date.setUTCMilliseconds(0);
//             date.setFullYear(date.getFullYear() + 1)
//             atsign['lastPaymentValidTill'] = date;
//             atsign['status'] = 'ACTIVE'
//             atsign['paymentDetails'] = [{
//                 period_start: atsign.atsignCreatedOn,
//                 period_end: date,
//                 amount_paid: atsign['payAmount']?atsign['payAmount']:0,
//                 billing_reason: 'BUY_ATSIGN',
//                 total: atsign['payAmount']? atsign['payAmount'].toFixed(0) : 0
//             }]
//             db.getCollection('atsigndetails').insertOne(atsign)
//         }
//     })
// })

// db.getCollection('atsigndetails').dropIndexes()
// db.getCollection('transactions').dropIndexes()
// index.syncIndexes().then(console.log);



// key removal script