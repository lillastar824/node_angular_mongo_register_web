'use strict';

var twilio = require('twilio');
var phoneNumber = process.env.TWILIO_PHONE_NUMBER;
var accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Auth Token from www.twilio.com/console
var client = new twilio(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;

module.exports.sendTextMessage = async(messageAttributes, cb) => {
    var tempParams = {
        to: messageAttributes.to,
        receivername: messageAttributes.receivername,
        sender: messageAttributes.sender,
        message: messageAttributes.message
    };
    return sendTextMessageFunction(tempParams, (val) => {
        if (typeof (cb) !== 'undefined') {
            return cb(val);
        }
        return;
    });
};

var sendTextMessageFunction = async (messageOptions, callback) => {

    if (process.env.NODE_ENV === "local" || process.env.EMAIL_ACTIVE == 0)
    {
        console.log(messageOptions,"messageOptions");
        setTimeout(function () {
            if (typeof (callback) !== 'undefined') {
                callback(true);
            }
        }, 1000);
    } else if (!messageOptions.to) {
        if (typeof (callback) !== 'undefined') {
            callback(true);
        }
    } else
    {
        new twilio(accountSid, authToken).messages
                .create({
                    body: messageOptions.message,
                    to: messageOptions.to, // Text this number
                    from: phoneNumber // From a valid Twilio number
                })
                .then(message => {
                    console.log(message,"message")
                            callback(true);
                })
                .catch((error) => {
                    console.error('Call failed!  Reason: ' + error.message);
                    callback(false);
                });
    }
}

exports.sendTextMessageFunction = sendTextMessageFunction;


