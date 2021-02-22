require('dotenv').config();
require('./models/db');
require('./config/passportConfig');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const logError = require('./config/handleError');
const {decryptAtsign} = require('./config/UtilityFunctions');
const mongoose = require('mongoose');
const UserLog = mongoose.model('UserLog');
const JwtHelper = require('./config/JwtHelper');

const rtsIndex = require('./routes/index.router');
const {errors} = require('celebrate')
var path = require('path');
const helmet = require('helmet')
const app = express();

app.use(helmet.frameguard());
// Node schedule email
// let schedule = require('node-schedule')
// const UserController = require('./controllers/user.controller');
// var RenewalNotificationSheduler = schedule.scheduleJob('00 32 19 * * *',UserController.sendRenewalNotification);
// var RenewalNotificationShedulerPast30 = schedule.scheduleJob('01 32 19 * * *',UserController.sendRenewalNotificationPast30);
// var RenewalNotificationShedulerPast60 = schedule.scheduleJob('02 32 19 * * *',UserController.sendRenewalNotificationPast60);
// var RenewalNotificationShedulerPast61 = schedule.scheduleJob('03 32 19 * * *',UserController.sendRenewalNotificationPast61);
// var RenewalNotificationCurrent = schedule.scheduleJob('04 32 19 * * *',UserController.sendRenewalNotificationCurrent);
// UserController.sendRenewalNotification()
// UserController.sendRenewalNotificationPast30()
// UserController.sendRenewalNotificationPast60()
// UserController.sendRenewalNotificationPast61()
// UserController.sendRenewalNotificationCurrent()
// const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger.json');

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// middleware
app.use('/api/download', express.static(path.join(__dirname, 'csv')));

app.use(bodyParser.json());
app.use(cors());
app.use(passport.initialize());
app.use(function (req, res, next) {
let userId;
   userId = JwtHelper.getIdIfExists(req,res);
   
    const { method, url, body } = req;
    let bodyData;
    if (body.data) {
        bodyData = decryptAtsign(body.data);
    } else {
        bodyData = body;
    }
    let skipRoutes=['/api/authenticate', '/api/health', '/api/randomatSign', '/api/all-users', '/api/getuserlogs']

    if (!skipRoutes.includes(url)) {       
        let userLog = new UserLog();
        userLog.userid = userId ? userId : '';
        userLog.method = method;
        userLog.url = url;
        userLog.body = JSON.stringify(bodyData);
        userLog.referer = req.headers.referer;
        userLog.userAgent = req.headers['user-agent'];
        userLog.save();
        next();
    }
    else {
        next();
    }
});

app.use('/api', rtsIndex);
app.disable('x-powered-by');
app.use(errors())
// error atsign
app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        var valErrors = [];
        Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
        res.status(422).send(valErrors)
    } else {
        //console.log(err);
    }
});


// start server
if (process.env.NODE_ENV === 'production') {
    var https = require('https');
    var fs = require('fs');
    var serverOptions = {
        ca: fs.readFileSync("/var/ssl/athandle/bundle.crt"),
        key: fs.readFileSync('/var/ssl/athandle/server.key'),
        cert: fs.readFileSync('/var/ssl/athandle/server.crt')
    };
    server = https.createServer(serverOptions, app);
    server.listen(443);
} else {
    app.listen(process.env.PORT, () => console.log(`Server started at port : ${process.env.PORT}`));
}
process.on('uncaughtException', (err) => {
    logError(err);
});

process.on('unhandledRejection', (err) => {
    logError(err);
});

module.exports = app;