const userService = require('../services/user.service');
const utility = require('../config/UtilityFunctions');
const { messages } = require('../config/const');
const mail = require('../config/mailer');
const { checkValidAtsign } = require('./atsign.controller');
const UserController = require('./user.controller')
const ObjectId = require('mongodb').ObjectID;
const User = require('./../models/user.model');
const AtsignConfigController = require('./atsignconfigs.controller');
const logError = require('../config/handleError');


exports.sendInviteLink = async (req, res) => {
    const email = req.body.email.toLowerCase()
    let inviteCode = req.body.inviteCode
    let origin = req.headers.origin
    let data = await userService.sendInviteLink(email,inviteCode,origin);
    if (data.status === 'logError') {
        res.status(400).send(data.message);
        logError(data.message,req);
    } else {
        res.send(data);
    }
}

module.exports.addUser = async (req, res) => {
    let cartData = req.body.userCart;
    let origin = req.headers.origin;
    let data = await userService.addUser(cartData,origin);
    if (data.status === 'logError') {
        res.status(400).send(data.message);
        logError(data.message,req);
    } else {
        res.send(data);
    }
}

module.exports.sendInvite = async (req, res, next) => {
    const { atsign } = req.body;
    const email = req.body.email.toLowerCase();
    let inviteCode;
    let inviteLink;
    let validAtsign;
    let data = {};
    let user = {};

    try {
        if (utility.isEmailValid(email)) {
            inviteCode = utility.generateInviteCode();
            user['atsignDetails'] = {
                "inviteCode": inviteCode
            };
            user['invitedBy'] = '';
            user['userStatus'] = 'Invited';
            user['userRole'] = 'User';
            user['email'] = email

            if (atsign) {
                validAtsign = await checkValidAtsign(atsign);
                if (validAtsign) {
                    inviteLink = (process.env.APP_URL || req.headers.origin) + '/welcome/' + inviteCode;
                    user['atsignDetails'] = {
                        "inviteCode": inviteCode,
                        "inviteLink": inviteLink
                    };
                    user['referredBy'] = validAtsign;
                    data = {
                        templateName: "signup_invite",
                        receiver: email,
                        dynamicdata: {
                            "invite_link": inviteLink
                        }
                    };
                } else {
                    res.send({ status: 'error', message: messages.INVALID_INVITE_CODE });
                }
            }
            else {
                data = {
                    templateName: "admin_user_joining_request",
                    receiver: process.env.ADMIN_REQUEST_EMAIL,
                    dynamicdata: {
                        "user_email": email,
                        "environment": process.env.SENDGRID_SUBJECT_ENV,

                    }
                };
            }

            //checkUserExistByEmail
            let userCheck = await userService.checkUserExistByEmail(email);
            if (userCheck) {
                res.send({
                    status: 'error',
                    message: messages.useralreadyregisteredMessage,
                    data: { user_status: userCheck.userStatus }
                });
            }
            //send mail to admin
            mail.sendEmailSendGrid(data);//sending email to admin before save so that admin is aware in case of error
            //save new user
            let savedUser = await userService.saveUser(user);
            if (savedUser) {
                if (!validAtsign && typeof req.body.from == 'undefined') {
                    mail.sendEmailSendGrid({
                        templateName: "thank_you",
                        receiver: email,
                        dynamicdata: {}
                    });
                }
                res.send({ status: 'success', message: messages.SENT_SUCCESS });
            }
        } else {
            res.send({ status: 'error', message: messages.ENTER_VALID_MAIL });
        }
    } catch (error) {
        logError(error, req);
        res.status(400).send(error);
    }
}

module.exports.initiateRegistration = async (req, res) => {
    try {
        req.body.email = req.body.email.toLowerCase();
        let error, value;
        if (!req.body.atsign)
        {
            let appConfig = await AtsignConfigController.getConfigs()
            if(appConfig && appConfig.value){
                let waitListConfig = appConfig.value.find(config=>config.key==='enable_waitlist')
               
                if ((waitListConfig && waitListConfig.value != '1') || !waitListConfig) {
                   
                    req.body.atsign = 'wallaby85raspy';
                  }
            }
        }
        if (req.body.atsign && req.body.atsign !== '') {
            ({ error, value } = await UserController.registerUserWithAtsign(req.body.email, req.body.atsign, req.headers.origin))
        } else {
            ({ error, value } = await UserController.registerUser(req.body.email))
        }
        if (value) {
            res.send({ status: 'success', message: messages.SENT_SUCCESS })
        } else {
            if (error.type == 'info') {
                res.send({ status: 'error', message: error.message, data:error.data })
            } else {
                logError(error.data, req)
                res.status(400).send({ message: error.message });
            }
        }
    } catch (error) {
        logError(error, req)
        res.status(200).send({ status: 'error', message: error.message });
    }
}

module.exports.inviteUserByEmail = async function (req, res) {
    try {
        const userId = ObjectId(req._id), email = req.body.email.toLowerCase();
        let currentUser = await User.findOne({ _id: userId })
        currentUser.name = req.body.from;
        if (currentUser && currentUser.userStatus === 'Active') {
            if (currentUser['inviteFriendDetails'].length >= 500) {
                return res.status(200).json({ status: 'error', message: messages.MAX_INVITED_500 });
            }
            const { error, value } = await UserController.registerUserByFriendEmailInvitation(currentUser, email, req.body.sendCopy,req.body.personalNote,req.headers.origin)
            if (value) {
                res.send({ status: 'success', message: messages.SENT_SUCCESS })
            } else {
                if (error.type == 'info') {
                    res.send({ status: 'error', message: error.message })
                } else {
                    logError(error.data, req)
                    res.status(400).send({ message: error.message });
                }
            }
        } else {
            res.status(422).send({ message: messages.UNAUTH });
        }
    } catch (error) {
        logError(error, req)
        res.status(200).send({ status: 'error', message: error.message });
    }
}

exports.checkInviteCodeValid = async (req,res) => {
    let inviteCode = req.query.inviteCode;
    const {valid,reason} = await utility.checkValidInviteLinkForAccActivation(inviteCode);
    if (!valid) {
        return res.status(200).json({ status: 'error', message: messages.INVITE_LINK_EXPIRE, data: {reason} });
    }
    return res.status(200).json({ status: 'success', message: '', data: {} });
}


