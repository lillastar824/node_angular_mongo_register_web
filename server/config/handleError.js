const mail = require('./mailer');
const logger = require('./log');
const { messages } = require('./const');

function logError(err, req, res) {
    //log error in file system
    logger.error(err);
    if (req) {
        sendErrorEmail([err?(err.stack?err.stack:err):'', req.headers], req.protocol + '://' + req.get('host') + req.originalUrl);
    } else {
        sendErrorEmail([err?(err.stack?err.stack:err):'', err.sql], process.env.APP_URL || 'Error');
    }
    if (res) {
        res.send({ status: 'error', message: messages.SOMETHING_WRONG_RETRY, data: {} });
    }
    return;
}

function replaceErrors(key, value) {
    if (value instanceof Error) {
        let error = {};

        Object.getOwnPropertyNames(value).forEach((key) => {
            error[key] = value[key];
        });
        return error;
    }
    return value;
}

function sendErrorEmail(err, url) {
    // const mailOptions = {
    //     to: `athandle123@gmail.com`,
    //     subject: `Exception URL: ${url}`,
    //     html: `Hi , <br/>   ${JSON.stringify(err, replaceErrors)}`
    // };
    // mail(mailOptions);
    var data = {
        //name of the email template that we will be using
        templateName: "error_email",
        receiver: 'athandle123@gmail.com',
        dynamicdata: { error_string: JSON.stringify(err, replaceErrors), environment: url }
    };

    mail.sendEmailSendGrid(data);
}
module.exports = logError;