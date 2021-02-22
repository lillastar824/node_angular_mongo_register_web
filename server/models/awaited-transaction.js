'use strict';
const mongoose = require('mongoose'),
    timeStamp = require('mongoose-timestamp'),
    Schema = mongoose.Schema;

let AwaitedTransactionSchema = new Schema({
    intent:{type:Object},
    userid: { type: String, required: true },
    inviteCode:{type:String},
    cartData:[Object],
    orderAmount:Number,
    completeOrderId:Number,
    cartAmount:Number
},{strict:false});

AwaitedTransactionSchema.plugin(timeStamp)

module.exports = mongoose.model('AwaitedTransaction', AwaitedTransactionSchema);