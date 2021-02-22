'use strict';
const mongoose = require('mongoose'),
    timeStamp = require('mongoose-timestamp'),
    Schema = mongoose.Schema;

const CronSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    date: {
        type: String,
    },
    status: {
        type: String,
        default: 'EXECUTING',
        enum: ['EXECUTING', 'SUCCESS', 'ERROR']
    }
});

CronSchema.plugin(timeStamp)
CronSchema.index({ name: 1, date: 1 },{unique:true})

module.exports = mongoose.model('cron', CronSchema);