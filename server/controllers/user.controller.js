const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const mail = require('./../config/mailer');
const textMessage = require('./../config/textMessage');
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');
const ObjectId = require('mongodb').ObjectID;
const {  checkValidEmail, regexSpecialChars, generateInviteCode, checkSignAvailability, decryptAtsign, computeStandardAtsign, 
     checkValidInviteLink,getErrrorMessage,isContactValid,isEmailValid,countAtsignLength } = require('./../config/UtilityFunctions');
const User = mongoose.model('User');
// const Restrictedatsigns = mongoose.model('restrictedatsigns');
const Brands = mongoose.model('brands');
const AtsignHistory = mongoose.model('AtsignHistory');
const ReserveAtsigns = mongoose.model('Reserveatsigns');
const Dictionary = mongoose.model('dictionary');
const FirstNames = mongoose.model('firstNames');
const LastNames = mongoose.model('lastNames');
const Countries = mongoose.model('countries');
const States = mongoose.model('states');
const Cities = mongoose.model('cities');
const UserLog = mongoose.model('UserLog');
const transactions = mongoose.model('Transactions');
const notavailableerrorMessage = getErrrorMessage({'errorcode':'NOT_AVAILABLE_ATSIGN'});
const useralreadyregisteredMessage = getErrrorMessage({'errorcode':'USER_ALREADY_REGISTERED'});
const nouserMessage = "Hmm, that doesn't seem right. Try again?";
const logError = require('./../config/handleError');
const thesaurus = require("thesaurus");
const AtsignWaitlist = mongoose.model('Atsignwaitlist');
const { foods, colorOptions, animalOptions, sportOptions, movies, music, hobbies, messages, otpExpiry, verificationExpiry , CONSTANTS} = require('../config/const');
const  authService = require('../services/auth.service');
const  userService = require('../services/user.service');
const axios = require('axios');
const moment = require("moment");
const AtsignController = require('./../controllers/atsign.controller')
const jwt = require('jsonwebtoken');
const UtilityFunctions = require('./../config/UtilityFunctions');
const AtsignDetailController = require('./atsign-detail.controller');
const NotificationController = require('./notifications.controller');




let assignValue = () => {
    const allChoicess = {
        'colors': [...colorOptions],
        'foods': [...foods],
        'animals': [...animalOptions],
        'movies': [...movies],
        'music': [...music],
        'hobbies': [...hobbies],
        'sports': [...sportOptions]
    }
    return allChoicess;
}

module.exports.assignValue = assignValue;


module.exports.insertJson = (req, res, next) => {
    //console.log(req.body)
    if (req.body.secretKey === 'xVKMCjkSByq8TVBA') {
        const fs = require('fs');
        const path = require("path");
        if (req.body.item === 'dictionary') {

            let DictionaryData = fs.readFileSync(path.resolve(__dirname, '../db/dictionary.json'));
            Dictionary.deleteMany({}, (err, doc) => {
                //console.log("error", err, "doc", doc)
                if (!err) {
                    Dictionary.insertMany(JSON.parse(DictionaryData), (err, doc) => {
                        //console.log("error", err, "doc", doc)
                        res.send({ status: 'success', message: messages.SUCCESSFULLY });
                    });
                }
                else {
                    res.status(400).send(err);
                }
            });
        }
        else if (req.body.item === 'firstname') {
            let FirstNamesData = fs.readFileSync(path.resolve(__dirname, '../db/firstNames.json'));
            FirstNames.deleteMany({}, (err, doc) => {
                //console.log("error", err, "doc", doc)
                if (!err) {
                    FirstNames.insertMany(JSON.parse(FirstNamesData), (err, doc) => {
                        //console.log("error", err, "doc", doc)
                        if (!err) {
                            res.send({ status: 'success', message: messages.SUCCESSFULLY });
                        } else {
                            res.status(400).send(err);
                        }
                    });
                }
                else {
                    res.status(400).send(err);
                }
            });
        }
        else if (req.body.item === 'lastname') {
            let LastNamesData = fs.readFileSync(path.resolve(__dirname, '../db/lastNames.json'));
            LastNames.deleteMany({}, (err, doc) => {
                //console.log("error", err, "doc", doc)
                if (!err) {
                    LastNames.insertMany(JSON.parse(LastNamesData), (err, doc) => {
                        //console.log("error", err, "doc", doc)
                        if (!err) {
                            res.send({ status: 'success', message: messages.SUCCESSFULLY });
                        } else {
                            res.status(400).send(err);
                        }
                    });
                }
                else {
                    res.status(400).send(err);
                }
            });
        }
        else if (req.body.item === 'brands') {
            let brandsData = fs.readFileSync(path.resolve(__dirname, '../db/500companies.json'));
            Brands.deleteMany({}, (err, doc) => {
                //console.log("error", err, "doc", doc)
                if (!err) {
                    Brands.insertMany(JSON.parse(brandsData), (err, doc) => {
                        //console.log("error", err, "doc", doc)
                        if (!err) {
                            res.send({ status: 'success', message: messages.SUCCESSFULLY });
                        } else {
                            res.status(400).send(err);
                        }
                    });
                }
                else {
                    res.status(400).send(err);
                }
            });
        }
        else if (req.body.item === 'countries') {
            let countriesData = fs.readFileSync(path.resolve(__dirname, '../db/countries.json'));
            Countries.deleteMany({}, (err, doc) => {
                //console.log("error", err, "doc", doc)
                if (!err) {
                    Countries.insertMany(JSON.parse(countriesData), (err, doc) => {
                        //console.log("error", err, "doc", doc)
                        if (!err) {
                            res.send({ status: 'success', message: messages.SUCCESSFULLY });
                        } else {
                            res.status(400).send(err);
                        }
                    });
                }
                else {
                    res.status(400).send(err);
                }
            });
        }
        else if (req.body.item === 'states') {
            let statesData = fs.readFileSync(path.resolve(__dirname, '../db/states.json'));
            States.deleteMany({}, (err, doc) => {
                //console.log("error", err, "doc", doc)
                if (!err) {
                    States.insertMany(JSON.parse(statesData), (err, doc) => {
                        //console.log("error", err, "doc", doc)
                        if (!err) {
                            res.send({ status: 'success', message: messages.SUCCESSFULLY });
                        } else {
                            res.status(400).send(err);
                        }
                    });
                }
                else {
                    res.status(400).send(err);
                }
            });
        }
        else if (req.body.item === 'cities') {
            let citiesData = fs.readFileSync(path.resolve(__dirname, '../db/cities.json'));
            Cities.deleteMany({}, (err, doc) => {
                //console.log("error", err, "doc", doc)
                if (!err) {
                    Cities.insertMany(JSON.parse(citiesData), (err, doc) => {
                        //console.log("error", err, "doc", doc)
                        if (!err) {
                            res.send({ status: 'success', message: messages.SUCCESSFULLY });
                        } else {
                            res.status(400).send(err);
                        }
                    });
                }
                else {
                    res.status(400).send(err);
                }
            });
        }
        else {
            res.status(401).send({ status: 'error', message: messages.UNAUTH });
        }
    }
    else {
        res.status(401).send({ status: 'error', message: messages.UNAUTH });
    }
}
module.exports.register = (req, res, next) => {
    var user = new User();
    user.fullName = req.body.fullName;
    user.email = req.body.email.toLowerCase();
    user.password = req.body.password;
    user.userRole = req.body.role === '1' ? 'Admin' : 'AdminReport';
    user.userStatus = 'Active';
    if (req.body.secretkey && req.body.secretkey === process.env.SIGNUP_KEY) {
        User.findOne({ email: req.body.email },
            (err, data) => {

                if (!data) {
                    user.save((err, doc) => {
                        if (!err) {
                            res.send({ status: 'success', message: messages.USER_REGISTERED });
                        } else {
                            logError(err, req);
                            res.status(400).send(err);
                        }
                    });
                } else {
                    res.send({ status: 'error', message: useralreadyregisteredMessage });
                }
            }
        );
    }
    else {
        res.status(401).send({ status: 'error', message: messages.UNAUTH });
    }
}

module.exports.authenticate = (req, res, next) => {

    req.body.email = req.body.email.toLowerCase();
    // call for passport authentication
    passport.authenticate('local', async(err, user, info) => {
        // error from passport middleware
        if (err) return res.status(400).json(err);
        // registered user
        else if (user) {
            let newUser = Object.assign({}, user);
            delete newUser._doc['password']
            delete newUser._doc['saltSecret']
            let id = newUser._doc['_id']
            await User.findByIdAndUpdate({ _id: ObjectId(id)},{lastLogin : new Date()});
            let token = await authService.getToken(user);
            return res.status(200).json({ "user": newUser._doc, "token": token })
        }
        // else if (user) return res.status(200).json({ "token": user.generateJwt() });
        // unknown user or wrong password
        else return res.status(401).json(info);
    })(req, res);
}

module.exports.userProfile = (req, res, next) => {
    User.findOne({ _id: req._id },
        async (err, user) => {
            if (!user)
                return res.status(200).json({ status: false, message: messages.USER_NOT_FOUND });
            else {
                user.atsignDetails = await Promise.all(user.atsignDetails.map(async atsign => {
                    if (atsign.atsignCreatedOn && atsign.atsignType && atsign.atsignType.toLowerCase() != 'free'){
                        let atsignPayDetails = await AtsignDetailController.checkAtsignIsPayable(atsign.atsignName)
                        if(atsignPayDetails && atsignPayDetails.value){
                            atsign.isPayable = atsignPayDetails.value.status
                            if(atsignPayDetails.value.atsignDetail){
                                atsign.renewalDate = new Date(atsignPayDetails.value.atsignDetail.lastPaymentValidTill)
                                atsign.expiringSoon = moment().utc().add(60, "days").toDate() < atsign.renewalDate ? false:true
                            }
                            else{
                                atsign.renewalDate = '2200-01-01T00:00:00.000Z'
                            }
                        }
                    }else{
                        atsign.renewalDate = '2200-01-01T00:00:00.000Z'
                    }
                    // atsign['renewalDate'] = moment(atsign.atsignCreatedOn).utc().add(365, "days").toDate();
                    return atsign;
                }))
                user.atsignDetails = user.atsignDetails.sort((atsign1,atsign2) => {
                    if (new Date(atsign1.renewalDate) > new Date(atsign2.renewalDate)){
                        return 1;
                    }else if(new Date(atsign1.renewalDate) < new Date(atsign2.renewalDate)){
                        return -1;
                    }else{
                        return 0
                    }
                })
                return res.status(200).json({ status: true, user: user });
            }
        }
    ).select('-saltSecret -password -mobileOtp -mobileVerified -otpGenerateTime').lean();
}

module.exports.getUserDetails = async (req, res, next) => {
    let token = null, userFromToken = null
    try {
        token = req.headers['authorization'].split(' ')[1]
        if (token) {
            let decoded = jwt.verify(token, process.env.JWT_SECRET)
            if (decoded && decoded._id)
                userFromToken = await userService.getUserById(decoded._id);
        }
    } catch (error) {
        token = null;
        userFromToken = null
    }
    try {
        let filter = { 'atsignDetails.inviteCode': req.body.inviteCode };
        filter['userStatus'] = { $ne: 'Deleted' };
        let user = await User.findOneAndUpdate(filter, { userStatus: 'Active' }, { fields: { saltSecret: 0, password: 0, mobileOtp: 0, mobileVerified: 0, otpGenerateTime: 0 } })
        if (!user) return res.status(200).json({ status: 'error', message: messages.USER_NOT_FOUND });
        if (userFromToken && userFromToken._id && userFromToken._id.toString() != user._id.toString()) {
            if (user.userStatus !== 'Invited') {
                return res.status(401).send({ auth: false, message: messages.UNAUTH_USER });
            }
        }
        if ((user.userStatus && user.userStatus.toLowerCase() == 'active' && userFromToken == null)) {
            return res.status(401).send({ auth: false, message: messages.UNAUTH_USER });
        }
        if (req.body.inviteCode) {
            let atSign = user['atsignDetails'].find(o => o.inviteCode === req.body.inviteCode);
            if (atSign && !atSign.hasOwnProperty('atsignName')) {
                let token = await authService.getToken(user);
                return res.status(200).json({ status: 'success', data: { user: user, token: token } });
            }
            return res.status(401).json({ status: 'error', message: 'Unauthorized.' });
        }
        user.userStatus = 'Active'
        let token = await authService.getToken(user);
        return res.status(200).json({ status: 'success', data: { user: user, token: token } });
    } catch (error) {
        logError(error)
        res.status(401).json({ status: 'error', message: messages.SOMETHING_WRONG_RETRY });
    }
}

module.exports.getAtsignAvailability = async (req, res, next) => {
    console.log(req.params.atsign)
    let isSignAvailable = await checkSignAvailability(req.params.atsign, true, 'paid', false);
    console.log(isSignAvailable)
    return res.status(isSignAvailable?200:404).json({});
}
module.exports.checkAtsignAvailability = async (req, res, next) => {
    let allChoices = assignValue();
    let userId = req._id,atsignData = {}, decryptedData = {},price, handle_type;
    if (req.body.data) {
        decryptedData = JSON.parse(decryptAtsign(req.body.data));
        if (!decryptedData.fromAdmin) {
            const validLink = await checkValidInviteLink(req._id, decryptedData.inviteCode, decryptedData.atSignType);
            if (!validLink) {
                return res.status(200).json({ status: 'error', message: messages.INVITE_LINK_EXPIRE, data: {} });
            }
        }
        if (decryptedData.atsignType === 'free') {
            atsignData.atsignName = await computeStandardAtsign(decryptedData);
            atsignData.atsignType = 'free';
            atsignData.fromAdmin = decryptedData.fromAdmin;
        } else {
            atsignData.atsignName = decryptedData.atsignName;
            atsignData.atsignType = 'paid';
            atsignData.fromAdmin = decryptedData.fromAdmin;
        }
        if (!atsignData.atsignName) {
            return res.status(401).json({ status: 'error', message: messages.INVALID_ATSIGN, data: {} });
        }
        atsignData.atsignName = atsignData.atsignName.replace(/\s/g, '');
    } else {
        atsignData = req.body;
    }

    try {
        const { atsignType, premiumHandleType, fromAdmin } = atsignData;
        if (atsignType === "free") {
            let arrayTocheck = atsignData['arrayTocheck'];
            for (let index in arrayTocheck) {
                if (index !== 'numbers' && allChoices[index].indexOf(arrayTocheck[index]) === -1) {
                    return res.status(401).json({ status: 'error', message: messages.INVALID_ATSIGN, data: {} });
                }
            }
        }

        let atsignName = atsignData.atsignName.toLowerCase();
        let isSignAvailable = await checkSignAvailability(atsignName, true, atsignType, decryptedData.fromAdmin,userId);

        let reserveHandle;
        if (isSignAvailable && isSignAvailable !== 'brand') {
            price = isSignAvailable['price'];
            handle_type = isSignAvailable['handle_type'];
            reserveHandle = isSignAvailable['reserveHandle'];
        } else if (isSignAvailable && isSignAvailable == 'brand') {
            return res.send({ status: "error", message: "Oops, this is a registered trademark. If you affiliated with this trademark, please contact us at info@atsign.com", data: {} });
        } else {
            return res.send({ status: "error", message: notavailableerrorMessage });
        }

        if (atsignType === 'free') {
            handle_type = 'free';
            price = 0;
        }
        if (decryptedData.type === 'hybrid') {
            price = 10;
        }
        let freeReserveHandle = await ReserveAtsigns.findOne({ atsignType: 'free', userid: userId, timer_started: false ,timestamp : null});
        if (atsignType === 'free' && freeReserveHandle) {
            let update = {};
            let filter = {
                userid: userId,
                timer_started: false,
                atsignType:'free',
                timestamp: null
            };
            update['atsignName'] = atsignData.atsignName;
            update['price'] = price;
            update['atsignType'] = handle_type;
            freeReserveHandle = await ReserveAtsigns.findOneAndUpdate(filter, update);
        } else if (!fromAdmin && !reserveHandle) {
            const reserveAtsigns = new ReserveAtsigns();
            reserveAtsigns.userid = userId;
            reserveAtsigns.atsignName = atsignData.atsignName;
            reserveAtsigns.price = price;
            reserveAtsigns.atsignType = handle_type;
            await reserveAtsigns.save()
            //     (err, doc) => {
            //     if (err) {
            //         return res.status(422).send(err);
            //     }
            // });
        }
        if(!res.headersSent) return res.send({ status: "success", message: "@sign available", data: { atsignName: atsignName, price: price, premiumHandleType: handle_type } });

    } catch (error) {
        logError(error, req);
        return res.status(400).send(error);
    }
}

module.exports.listSimilarAtSigns = async (req, res, next) => {
    if (req.body.maketen) {
        try {
            let returnData = [], attempt = 1;
            const MAX_TRY_ATTEMPT = 2
            while (returnData.length < 1 && attempt <= MAX_TRY_ATTEMPT) {
                let handleSuggestionList = generateHybridAtsigns(req.body.handle,attempt);
                for (let i = 0; i < handleSuggestionList.length; i++) {
                    let atsignAvailablity = await checkSignAvailability(handleSuggestionList[i], true, 'maketen')
                    if (atsignAvailablity  && atsignAvailablity !== 'brand' && atsignAvailablity.price <= 100) {
                        const newReserveAtsigns = await ReserveAtsigns.create({userid: req._id,atsignName: handleSuggestionList[i],price: 10,atsignType: "custom"})
                        returnData.push({ "atsignName": handleSuggestionList[i], "originalAtSign": req.body.handle });
                        break;
                    }
                }
                attempt = attempt + 1
            }
            if (returnData.length) {
                return res.status(200).json({ status: 'success', message: '', "data": returnData });
            } else {
                res.status(200).json({ status: 'error', message: messages.SOMETHING_WRONG_RETRY });
            }
        } catch (error) {
            logError(error, req)
            res.status(200).json({ status: 'error', message: messages.SOMETHING_WRONG_RETRY });
        }
    }
    else {
        let handleSuggestionList = generate(req.body.handle,req.body.maketen),finalSuggestionList = [];
        try {
            var promises = [];
            handleSuggestionList.forEach((value, index) => {
                promises.push(checkSignAvailability(value))
            });
            Promise.all(promises).then((data) => {
                for (let i = 0; i < data.length; i++) {
                    if (data[i] && data[i] !== 'brand') {
                        finalSuggestionList.push({
                            "atsignName": data[i],
                            "originalAtSign": req.body.handle
                        });
                    }
                }
                return res.status(200).json({ status: 'success', message: '', "data": finalSuggestionList });
            }, (err) => {
                return res.status(200).json({ status: 'error', message: err });
            });
        } catch (error) {
            logError(error, req);
            return res.status(400).send(error);
        }
    }
}

module.exports.sendVerificationCode = async (req, res) => {
    let filter = {}, update = {}, contact = "", email = "", atsign = "";
    if (req._id) {
        filter['_id'] = ObjectId(req._id);
    }

    filter['userStatus'] = { $ne: 'Deleted' }

    if (req.body.email) {
        email = req.body.email.toLowerCase();
        update['email'] = email;
    }

    if (req.body.contact) {
        contact = req.body.contact;
        update['contact'] = contact;
    }

    if (req.body.atsign) {
        atsign = req.body.atsign.replace('@', '');
    }

    if (!isContactValid(contact) && !isEmailValid(email) && !atsign && !filter['_id']) {
        return res.status(200).send({ status: "error", message: nouserMessage });
    }

    if ((req.headers.referer && req.headers.referer.indexOf("/login") !== -1) || (req.body.isApplicationLogin)) {
        req.body.inviteCode = '';
        if (email) {
            filter['email'] = email;
        } else if (contact) {
            filter['contact'] = contact;
        } else if (atsign) {
            filter['atsignDetails.atsignName'] = { '$regex': '^' + UtilityFunctions.escapeRegExp(atsign) + '$', $options: 'i' };
        }
    }

    if (req.body.inviteCode) {
        filter['atsignDetails.inviteCode'] = req.body.inviteCode;
    }
    let data = await userService.sendInviteCode(filter, update, atsign);
    if (data.status === 'logError') {
        logError(data.error, req);
        res.status(422).send(data.error);
    }
    else {
        res.send(data);
    }
}

//TODO: NEED TO FIX
module.exports.removeContact = async function (req, res) {
    try {
        let updatedUser = await User.findOneAndUpdate({ _id: req._id }, { contact: '' })
        return res.status(200).json({ status: 'success', message: '' });
    } catch (error) {
        return res.status(200).json({ status: 'error', message: messages.SOMETHING_WRONG_RETRY});
    }
}
module.exports.verifyContact = (req, res, next) => {
    let update = {};
    update['mobileVerified'] = true;
    update['userStatus'] = 'Active';
    update['mobileOtp'] = '';

    if ((req.headers.referer.indexOf('login') != -1) || req.body.isApplicationLogin) {
        update['lastLogin'] = new Date();
    }
    
    update['lastVerification'] = new Date();

    let filter = {};
    if (req.body.email) {
        filter['email'] = req.body.email.toLowerCase();
    } else if (req.body.atsign) {
        filter['atsignDetails.atsignName'] = { '$regex': '^' + req.body.atsign.replace('@', '') + '$', $options: 'i' }
    } else {
        filter['contact'] = req.body.contact;
    }

    let d1 = new Date();
    d1.setMinutes(d1.getMinutes() - otpExpiry);

    User.find(filter,
        (err, users) => {

            if (users.length === 0) {
                res.status(409).send({ status: "error", message: nouserMessage });
            } else {
                if (users[0].mobileOtp == req.body.mobileOtp && users[0].otpGenerateTime > d1) {
                    User.findOneAndUpdate(filter, update, async (err, doc) => {
                        if (err) {
                            logError(err, req, res);
                        } else {
                            let newUser = Object.assign({}, doc);
                            delete newUser._doc['password']
                            delete newUser._doc['saltSecret']
                            delete newUser._doc['atsignDetails']
                            delete newUser._doc['mobileOtp']
                            delete newUser._doc['mobileVerified']
                            delete newUser._doc['otpGenerateTime']
                            delete newUser._doc['reserveTime']
                            delete newUser._doc['inviteFriendDetails']
                            let token = await authService.getToken(users[0]);
                            return res.status(200).json({ status: 'success', message: messages.VERIF, "user": newUser._doc, "token": token });
                        }
                    });
                } else {
                    return res.status(200).json({ status: 'error', message: messages.INVALD_CODE, data: {} });

                }
            }
        }
    );
}
module.exports.cancelSubscription = (req, res, next) => {
    let filter = {};
    filter['contact'] = req.body.contact;
    User.findOneAndUpdate(filter, { atsignName: '', atsignType: '', atsignCreatedOn: '' }, (err, doc) => {
        if (err) {
            logError(err, req, res);
        } else {
            return res.status(200).json({ status: 'success', message: messages.SUBS_CANCLD, "data": {} });
        }
    });
}
module.exports.upgradeHandle = upgradeHandle;

function upgradeHandle(req, res, next) {
    var handle = new AtsignHistory();
    // handle.previousHandleName = req.body.previousHandleName;
    handle.atsignName = req.body.atsignName;


    if (regexSpecialChars(handle.atsignName)) {
        return res.status(200).json({ status: 'error', message: messages.NO_SPL_CHAR, data: {} });
    }
    // handle.previousHandleType = req.body.previousHandleType;
    handle.atsignType = req.body.atsignType;
    handle.atsignType = req.body.atsignType;
    handle.email = req.body.email;
    handle.contact = req.body.contact;
    handle.save((err, doc) => {
        if (!err)
            res.send(doc);
        else {
            if (err.code == 11000)
                res.send(err);
            else {
                logError(err, req);
                return next(err);
            }

        }

    });
}
module.exports.viewHistory = (req, res, next) => {
    AtsignHistory.find({ email: req.body.email, contact: req.body.contact },
        (err, users) => {
            if (!users)
                return res.status(200).json({ status: false, message: messages.USER_NOT_FOUND });
            else
                return res.status(200).json({ status: true, user: users });
        }
    );
}


module.exports.getUserDetailsFromCode = (req, res, next) => {
    User.find({ 'atsignDetails.inviteCode': { '$regex': `^${req.body.code}$`, '$options': 'i' } },
        async (err, users) => {
            if (users.length === 0)
                return res.status(200).json({ status: false, message: messages.USER_NOT_FOUND });
            else {
                return res.status(200).json({ status: true, data: { user: users[0] } });
            }
        }
    ).select('-saltSecret -password -mobileOtp -mobileVerified -otpGenerateTime');
}
module.exports.saveProductNotification = (req, res, next) => {
    let filter = {},
        update = {};
    filter['_id'] = req._id;
    update[req.body.name] = req.body[req.body.name];
    User.findOneAndUpdate(filter, update, (err, doc) => {
        if (err) {
            logError(err, req, res);
            //console.log("Something wrong when updating data!");
        } else {
            return res.status(200).json({ status: 'success', message: messages.SAVD, "data": {} });
        }
    });
}

module.exports.createNewHandle = (req, res, next) => {
    let searchObject = { _id: ObjectId(req._id) };
    let email;
    if (req.body.email) {
        email = req.body.email.toLowerCase();
        searchObject['email'] = email;
    }
    else {
        searchObject['contact'] = req.body.contact;
    }

    new Promise(function (resolve, reject) {
        User.findOne(searchObject,
            async (err, usr) => {
                let user = usr;
                let inviteCode = "";
                if (usr && usr.atsignDetails.length > 0) {
                    let reservedsign = await ReserveAtsigns.find({ "userid": req._id, "timer_started": true });
                    for (let i = 0; i < usr.atsignDetails.length; i++) {
                        if ((reservedsign && reservedsign.length > 0) && !usr.atsignDetails[i].atsignName) {
                            inviteCode = usr.atsignDetails[i].inviteCode ? usr.atsignDetails[i].inviteCode.split('_')[0] : usr.atsignDetails[i].inviteCode;
                        }
                    }
                    if (!inviteCode) {
                        for (let i = 0; i < usr.atsignDetails.length; i++) {
                            if (!usr.atsignDetails[i].atsignName) {
                                inviteCode = usr.atsignDetails[i].inviteCode ? usr.atsignDetails[i].inviteCode.split('_')[0] : usr.atsignDetails[i].inviteCode;
                            }
                        }
                    }
                    if (!inviteCode) {
                        for (let i = 0; i < usr.atsignDetails.length; i++) {
                            if (!usr.atsignDetails[i].atsignType) {
                                inviteCode = usr.atsignDetails[i].inviteCode ? usr.atsignDetails[i].inviteCode.split('_')[0] : usr.atsignDetails[i].inviteCode;
                            }
                        }
                    }
                    let data = {
                        'user': user,
                        'inviteCode': inviteCode
                    };
                    if(reservedsign && reservedsign.length > 0){
                        data['atsignType'] = 'reserved';
                    }
                    resolve(data);
                } else {
                    resolve();
                }
            }).select('-saltSecret -password -mobileOtp -mobileVerified -otpGenerateTime');
    }).then(async (data) => {
        let atsignType = '';
        if (data) {
            inviteCode = data && data['inviteCode'];
            user = data && data['user'];
            atsignType = data && data['atsignType'];
        }
        else {
            inviteCode = false;
        }
        
        if (inviteCode) {
            return res.status(200).json({ status: true, message: '', user: { data: user, inviteCode, atsignType } });
        } else {
            let inviteCode = await generateInviteCode();
            let inviteLink = "";
            if (email) {
                inviteLink = (process.env.APP_URL || req.headers.origin) + '/welcome/' + inviteCode;
            } else {
                inviteLink = (process.env.APP_URL || req.headers.origin) + '/welcome/' + inviteCode;
            }

            const update = {
                "$push": {
                    "atsignDetails": {
                        "inviteCode": inviteCode,
                        "inviteLink": inviteLink
                    }
                }
            };
            User.findOneAndUpdate(searchObject, update,
                (err, users) => {
                    if (!users) {
                        return res.status(200).json({ status: false, message: messages.USER_NOT_FOUND });
                    } else {
                        return res.status(200).json({ status: true, message: '', user: { data: users, inviteCode } });
                    }
                });
        }
    }, (err) => {
        return res.status(500).json({ status: false, message: err });
    });
}
function generateHybridAtsigns(atsignName, attempt) {
    const variableArray = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    let uniqueSet = new Set();
    let noOfCharToAppend = !attempt || attempt <= 1 ? 2 : attempt + 1
    for (let index = 0; index <= 15; index++) {
        let charactersToAppend = ""
        while (charactersToAppend.length < noOfCharToAppend) {
            let indexOfCharToAppend = Math.floor(Math.random() * variableArray.length);
            let charToAppend = variableArray[indexOfCharToAppend]
            charactersToAppend = charactersToAppend + '' + charToAppend;
        }
        if (charactersToAppend.length === 0) continue;
        uniqueSet.add(atsignName + "_h" + charactersToAppend)
    }
    return Array.from(uniqueSet)
}

function generate(names,maketen) {
    let diffWord = "";
    let handleSuggestionList = [];
    let separators = ["", "_"];
    let cond = [];
    let similarMeaning = thesaurus.find(names);

    if (similarMeaning && similarMeaning.length > 0) {
        cond = ["num", "char", "diffWord", "diffWordNum"];// "diffWordAdjective"
    } else {
        cond = ["num", "char"];
    }

    for (let i = 0; i < 15; i++) {
        let sep = "";//dictionaries[Math.floor(Math.random() * 2)];
        let dictionaries = [adjectives, animals, colors];
        const shortName = uniqueNamesGenerator({
            dictionaries: [dictionaries[Math.floor(Math.random() * 3)]], // colors can be omitted here as not used
            length: 1
        });
        let aa = [];
        let condFlag = cond[Math.floor(Math.random() * cond.length)];
        let randNum = Math.floor(Math.random() * 10000);
        if (similarMeaning && similarMeaning.length > 0) {
            diffWord = similarMeaning[Math.floor(Math.random() * similarMeaning.length)];
            diffWord = diffWord.replace(/\W/g, '');
        }
        if (maketen) {
            diffWord = names; //Duplicate Reason
        }
        switch (condFlag) {
            case "num":
                aa.push(names);
                aa.push(randNum);
                aa.push(shortName);
                break;
            case "char":
                aa.push(names);
                aa.push(shortName);
                break;
            case "diffWordAdjective":
                aa.push(diffWord);
                aa.push(shortName);
                break;
            case "diffWord":
                aa.push(diffWord);
                break;
            case "diffWordNum":
                aa.push(diffWord);
                aa.push(randNum);
                aa.push(shortName);
                break;
        }
        aa = shuffle(aa);
        let uniq = [...new Set(aa)];
        if (maketen) {
            handleSuggestionList.push(uniq.join(sep));
        } else {
            handleSuggestionList.push(uniq.join(sep).replace(/\W/g, ''));
        }
    }
    handleSuggestionList = handleSuggestionList.filter(suggestion=>suggestion===names?false:true)
    return [...new Set(handleSuggestionList)];
}

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

module.exports.createInviteCode = (req, res, next) => {
    let userId = ObjectId(req._id);

    User.findOne({ _id: userId },
        async (err, userData) => {
            if (userData && userData.userStatus === 'Active') {
                if (userData['inviteFriendDetails'].length >= 500) {
                    return res.status(200).json({ status: 'error', message: messages.MAX_INVITED_3 });
                } else {
                    let inviteFriends = {};
                    inviteFriends['inviteCodefriends'] = await generateInviteCode();
                    inviteFriends['used'] = false;
                    inviteFriends['inviteLink'] = (process.env.APP_URL || req.headers.origin) + "/welcome/" + inviteFriends['inviteCodefriends'];

                    const update = {
                        "$push": {
                            "inviteFriendDetails": inviteFriends
                        }
                    };
                    const user = new User();
                    user['atsignDetails'] = {
                        "inviteCode": inviteFriends['inviteCodefriends'],
                        "inviteLink": inviteFriends['inviteLink']
                    };
                    user['invitedBy'] = '';
                    user['userStatus'] = 'Invited';
                    user['userRole'] = 'User';
                    user.save((err, doc) => {
                        if (!err) {
                            User.findOneAndUpdate({ _id: userId }, update,
                                (err, user) => {
                                    if (err) {
                                        res.status(200).json(err);
                                    } else {
                                        return res.status(200).json({ status: 'success', message: '', inviteLink: inviteFriends.inviteLink });
                                    }
                                });
                        } else {
                            res.status(400).send(err);
                        }
                    });
                }
            } else {
                res.status(422).send({ message: messages.UNAUTH });
            }
        });
}

module.exports.checkFriendInviteValid = (req, res, next) => {
    let friendInviteCode = req.body['inviteCode'];
    let filter = { "inviteFriendDetails.inviteCodefriends": friendInviteCode, "inviteFriendDetails.used": false };
    User.findOne(filter, (err, user) => {
        if (err) {
            res.status(200).json(err);
        }
        else {
            if (user) {
                User.findOne({ "atsignDetails.inviteCode": friendInviteCode }, async (err, currentuser) => {
                    if (err) {
                        res.status(200).json(err);
                    }
                    else {
                        if (currentuser) {
                            return res.status(200).json({ status: "success", message: messages.USER_INVITE_VALID, data: { 'user': currentuser } });
                        } else {
                            return res.status(200).json({ status: "error", message: messages.USER_INVITE_INVALID });
                        }
                    }

                });
            } else {
                return res.status(200).json({ status: "error", message: messages.USER_INVITE_INVALID });
            }
            // return res.status(200).json({ status: "success", message: messages.USER_INVITE_VALID, "token": users[0].generateJwt() });
        }

    });
}

module.exports.deleteUser = async (req, res, next) => {
    try {
        let userIdObject = ObjectId(req.body.userid);
        let userId = req.body.userid;
        let user = await userService.getUserById(userId)
        if (user && user._id) {
            if ((user.userStatus == 'Invited') || (req.body.hardDelete && req.body.adminKey == process.env.SIGNUP_KEY)) {
                await userService.deleteUserById(userId)
                await ReserveAtsigns.deleteMany({ userid: userId })
                return res.status(200).json({ status: true, message: messages.SUCCESS });
            } else {
                await User.findOneAndUpdate({ _id: userIdObject }, { userStatus: 'Deleted', deleteReason: req.body.deleteReason })
                await ReserveAtsigns.deleteMany({ userid: userId })
                return res.status(200).json({ status: true, message: messages.SUCCESS });
            }
        } else {
            return res.status(200).json({ status: false, message: messages.INVALID_REQ_BODY });
        }
    } catch (error) {
        logError(error, req)
        return res.status(200).json({ status: false, message: messages.SOMETHING_WRONG_RETRY });
    }
}

module.exports.inviteHistory = (req, res, next) => {
    let userId = ObjectId(req._id);
    User.findOne({ _id: userId },
        async (err, user) => {
            if (!err) {
                let currentAtsignName;
                if (user && user.atsignDetails && user.atsignDetails.length > 0) {
                    currentAtsignName = user.atsignDetails[0].atsignName;
                }
                let returnData = [];
                let inviteDetails = user.inviteFriendDetails;
                for (let i = 0; i < inviteDetails.length; i++) {
                    let dataCurr = {};
                    dataCurr['sentOn'] = inviteDetails[i].sentOn;
                    if (inviteDetails[i].used === true) {
                        let invitedUser = await User.findOne({ 'atsignDetails.inviteCode': inviteDetails[i].inviteCodefriends });

                        if (invitedUser) {
                            let atsignDetailsInvite = invitedUser.atsignDetails;
                            if (invitedUser && invitedUser.email) {
                                dataCurr['email'] = invitedUser.email;
                            }
                            if (invitedUser.contact) {
                                dataCurr['contact'] = invitedUser.contact;
                            }
                            for (let j = 0; j < atsignDetailsInvite.length; j++) {
                                if (atsignDetailsInvite[j].inviteCode === inviteDetails[i].inviteCodefriends) {
                                    dataCurr['inviteLink'] = atsignDetailsInvite[j].inviteLink;
                                    dataCurr['atsignName'] = atsignDetailsInvite[j].atsignName;
                                }
                            }
                        }
                    } else {
                        let invitedUser = await User.findOne({ 'atsignDetails.inviteCode': inviteDetails[i].inviteCodefriends });
                        if (invitedUser && invitedUser.email) {
                            dataCurr['email'] = invitedUser.email;
                        }
                        dataCurr['inviteLink'] = inviteDetails[i].inviteLink;
                        dataCurr['sentOn'] = inviteDetails[i].sentOn;
                    }
                    returnData.push(dataCurr);
                }
                return res.status(200).json({ status: 'success', message: "", data: returnData, atsignName: currentAtsignName });
            }
            else {
                return res.status(500).json({ status: 'error', message: err });
            }
        });
}

module.exports.randomatSign = async (req, res) => {

    let sampleatsign = [];
    const restrictedAtsigns = ['anal','mcdonalds','sex','porno','porn','KimKardashian','sexo','sexy','_sex','_sexy','_porn','_porno','freeporn','pornos','FreePorn','Free_Porn'];
    // let restrictedAtsigns1 = await Restrictedatsigns.find({}).distinct('atsign');
    // console.log(restrictedAtsigns1)
    doc = await User.aggregate([{ $sample: { size: 120 } }, { $project: { "atsignDetails.atsignName": true, _id: false } }]);
    for (let i = 0; i < doc.length; i++) {
        if (doc[i].atsignDetails && doc[i].atsignDetails.length > 0) {
            //return 16 atsigns
            for (let j = 0; j < doc[i].atsignDetails.length; j++) {
                if (doc[i].atsignDetails[j].atsignName && !sampleatsign.includes(doc[i].atsignDetails[j].atsignName) && !restrictedAtsigns.includes(doc[i].atsignDetails[j].atsignName) && countAtsignLength(doc[i].atsignDetails[j].atsignName) < 30){
                     sampleatsign.push(doc[i].atsignDetails[j].atsignName);
                }
 
            }
        }
    }
    return res.status(200).json({ status: 'success', message: "", data: sampleatsign });
}
module.exports.getRandomOptions = async (req, res) => {

    let choices = {};
    let foods1 = [...foods];
    let colors1 = [...colorOptions];
    let animals1 = [...animalOptions];
    let sports1 = [...sportOptions];
    let movies1 = [...movies];
    let music1 = [...music];
    let hobbies1 = [...hobbies];

    choices['foods'] = shuffle(foods1).splice(0, 15).sort();
    choices['colors'] = shuffle(colors1).splice(0, 15).sort();
    choices['animals'] = shuffle(animals1).splice(0, 15).sort();
    choices['sports'] = shuffle(sports1).splice(0, 15).sort();
    choices['movies'] = shuffle(movies1).splice(0, 15).sort();
    choices['music'] = shuffle(music1).splice(0, 15).sort();
    choices['hobbies'] = shuffle(hobbies1).splice(0, 15).sort();
    return res.status(200).json({ status: 'success', message: "", data: choices });
}

module.exports.deleteStandardAtsign = async (req, res) => {
    let atsign = req.body.atsignName;
    let userId = ObjectId(req._id);
    const filter = { '_id': userId, 'atsignDetails.atsignName': atsign, 'atsignDetails.atsignType': 'free' };
    let deleteObj = {
        "$pull": {
            'atsignDetails': { "atsignName": atsign, "atsignType": 'free' }
        }
    };

    let { value, error } = await AtsignDetailController.removeAtsign(req._id, atsign)
    if (error) {
        if (error.type === 'info') {
            return res.status(200).json({ status: 200, message: error.message })
        } else {
            return res.status(200).json({ status: 'error', message: messages.SOMETHING_WRONG_RETRY })
        }
    }
    User.findOneAndUpdate(filter, deleteObj, (err, doc) => {
        if (err) {
            return res.status(500).json({ status: 'error', message: "Internal Server Error" });
        } else if (doc) {
            let status = false;
            let allAtsigns = doc.atsignDetails;
            for (let i = 0; i < allAtsigns.length; i++) {
                if (allAtsigns[i].atsignName === atsign && allAtsigns[i].isActivated > 0) {
                    status = true;
                    axios({
                        method: 'post',
                        url: process.env.REGISTRAR_DELETE,
                        data: { atsign: sanitizeAtsign(atsign) },
                        headers:
                        {
                            // authorization: 'Apikey eyJhbGciOiJIUzI1NiJ9.YXRfd2ViX3JlZ2lzdHJhcg.IicU1gIiyj6RT-DdEtD-31ZEoY8Zm24f3SmWXbSJ6zA',
                            authorization: process.env.REGISTRAR_NODE_TOKEN,
                            'content-type': 'application/json; charset=utf-8'
                        }
                    })
                        .then(async result => {
                            return res.status(200).json({ status: 'success', message: "@sign data deleted" });
                        })
                        .catch(error => {
                            return res.status(200).json({ status: 'success', message: "Error deleting @sign data" });
                        })
                }
            }
            if(!status){
                return res.status(200).json({ status: 'success', message: "Atsign Deleted" });
            }

        } else {
            return res.status(200).json({ status: 'success', message: "Atsign cannot deleted" });
        }
    })
}

module.exports.freeSignCount = async (req, res) => {
    let userId = ObjectId(req._id);

    User.aggregate([{
        $match: {
            _id: userId
        }
    },
    {
        $unwind: "$atsignDetails"
    },
    {
        $group: {
            _id: {
                atsignType: "$atsignDetails.atsignType"
            },
            count: { $sum: 1 }
        }
    },
    {
        $match: {
            "_id.atsignType": "free"
        }
    }
    ],async function (err, docs) {
        if (err) {
            logError(err, req, res);
        } else if (docs) {
            let freeSignCount = [];
            if (docs.length > 0) { freeSignCount = docs.pop(); }

            let message;
            let status;
            if (freeSignCount.count >= 10) {
                message = "Cannot have more than 10 free sign"
                status = "error";
            } else {
                let time = new Date();
                time.setSeconds(time.getSeconds()-UtilityFunctions.defaultTimeLeft)

                const cartFreeAtsignCount = await ReserveAtsigns.countDocuments({price:0,userid:userId,timer_started:true,timestamp:{'$gte':time}})
                if((freeSignCount.count + cartFreeAtsignCount) >=10 ){
                    message = "Cannot have more than 10 free sign"
                    status = "error";
                }else{
                    message = "";
                    status = "success";
                }
            }
          return res.status(200).json({ status, message, data: { "freesigncount": freeSignCount.count || 0} });
        }
    });
}

// module.exports.updateDatetoObject = async (req, res, next) => {
//     let users = await User.find({ userRole: 'User' });
//     new Promise(function (resolve, reject) {
//         for (let i = 0; i < users.length; i++) {
//             for (let j = 0; j < users[i]['atsignDetails'].length; j++) {
//                 if (users[i]['atsignDetails'] && users[i]['atsignDetails'][j]['atsignCreatedOn']) {
//                     users[i]['atsignDetails'][j]['atsignCreatedOn'] = new Date(users[i]['atsignDetails'][j]['atsignCreatedOn']);
//                 }
//             }
//             new User(users[i]).save();
//         }
//         resolve(users)
//     }).then(data => {
//         // let userss = await User.find({});
//         return res.status(200).json({ status: true });

//     }, err => {
//         return res.status(500).json({ status: false, message: "unable to update", error: err });
//     });
// }
// module.exports.updateTrasactionObj = async (req, res, next) => {
   
//     let transaction = await transactions.find({atsignName: { $type : "string" }});
//     let finalResult = [];
//     new Promise(async function (resolve, reject) {
       
//         // finalResult['success']=[]
//         // finalResult['failure']=[]
//         // console.log(transaction.length);return;
//         for (let i = 0; i < transaction.length; i++) {
//             let date = transaction[i].created;
//             let startdate = new Date(date.getTime() - 1000*60);
//             let lastdate = new Date(date.getTime() + 1000*60);
//             // console.log( Object.values(transaction[i]['atsignName'][0]);return;
//             let oldAtsign = transaction[i]['atsignName'];//Object.values(transaction[i]['atsignName'][0]).toString().replace(',','');
//         // console.log(oldAtsign)
//             transaction[i]['atsignName'] = [];
//             let users = await User.findOne({ _id: ObjectId(transaction[i].userId)});
//             // console.log(users && users['_id'],'users')
//             if (users) {
//                 var tamount=0;
//                 for (let j = 0; j < users['atsignDetails'].length; j++) {
//                     if (users['atsignDetails'][j]['atsignType'] === 'paid' && (users['atsignDetails'][j]['atsignCreatedOn'] > startdate && users['atsignDetails'][j]['atsignCreatedOn'] < lastdate)) {
//                         transaction[i]['atsignName'].push({
//                             'premiumAtsignType': users['atsignDetails'][j]['premiumAtsignType'],
//                             'atsignName': users['atsignDetails'][j]['atsignName'],
//                             'payAmount': users['atsignDetails'][j]['payAmount']
//                         })
//                         tamount+=users['atsignDetails'][j]['payAmount'];
//                     }
//                 }
//                 // console.log(tamount, transaction[i].amount, finalResult['success'])
//                 if(tamount === transaction[i].amount/100)
//                 {
//                     finalResult.push({'success':{'oldAtsign':oldAtsign,'transaction':transaction[i], 'user':users}});
//                 }
//                 else
//                 {
//                     finalResult.push({'fail':{'oldAtsign':oldAtsign,'transaction':transaction[i], 'user':users}});
//                     // finalResult['fail'].push(transaction[i]);
//                     // finalResult['fail'][i]=transaction[i];
//                 }
//                 new transactions(transaction[i]).save();
//             }
//         }
//         resolve(transaction)
//     }).then(data => {
//         // let userss = await User.find({});
//         return res.status(200).json({ status: true,finalResult });

//     }, err => {
//         return res.status(500).json({ status: false, message: "unable to update", error: err });
//     });
// }
module.exports.updateAtsignType = async (req, res, next) => {
    let users = await User.find({ userRole: 'User' });
    new Promise(function (resolve, reject) {
        for (let i = 0; i < users.length; i++) {
            for (let j = 0; j < users[i]['atsignDetails'].length; j++) {
                //console.log(users[i]['atsignDetails'][j])
                if (users[i]['atsignDetails'] && users[i]['atsignDetails'][j]['premiumAtsignType'] && users[i]['atsignDetails'][j]['premiumAtsignType'] === 'Vanity') {
                    users[i]['atsignDetails'][j]['premiumAtsignType'] = 'Custom';
                }
            }
            new User(users[i]).save();
        }
        resolve(users)
    }).then(data => {
        // let userss = await User.find({});
        return res.status(200).json({ status: true });

    }, err => {
        return res.status(500).json({ status: false, message: "unable to update", error: err });
    });
}
module.exports.updateEmailCase = async (req, res, next) => {
    let users = await User.find({});
    new Promise(function (resolve, reject) {
        for (let i = 0; i < users.length; i++) {

            if (users[i].email) {
                let lowerCaseEmail = users[i].email.toLowerCase();
                if (users[i].email != lowerCaseEmail) {
                    users[i].email = lowerCaseEmail;
                    new User(users[i]).save();
                }
                //   //console.log(users[i].email, lowerCaseEmail)
                // new User(users[i]).save();
            }

        }
        resolve(users)
    }).then(data => {
        // let userss = await User.find({});
        return res.status(200).json({ status: true });

    }, err => {
        return res.status(500).json({ status: false, message: "unable to update", error: err });
    });
}

module.exports.getLogs = async (req, res) => {
    let filter = {};
    let filter2 = {};
    if (req.body.email || req.body.contact) {
        if (req.body.email) {
            filter['email'] = req.body.email;
        }
        if (req.body.contact) {
            filter['contact'] = req.body.contact;
        }
        let id = await User.findOne(filter).select('_id');
        if (!id) {
            return res.send({ status: 'error', message: "User not found" });
        }
        filter2['userid'] = id._id;
    }


    let startdate = new Date(req.body.fromDate);
    let lastdate = new Date(req.body.toDate);
    lastdate.setHours(23, 59, 59, 999);
    filter2['createdOn'] = { "$gte": startdate, "$lte": lastdate };
    let logs = await UserLog.find(filter2).sort({ createdOn: -1 });
    if (!logs) {
        res.send({ status: 'error', message: "logs not found" });
    }
    res.send({ status: 'success', logs: logs });
}

// module.exports.removeReserved = async (req, res) => {
//     let userid = req._id;
//     if (req.body.atsignType === 'free') {
//         ReserveAtsigns.deleteMany({ $and: [{ $or: [{ price: { $gt: 0 } }, { atsignType: { $ne: 'free' } }] }, { userid: userid },{ atsignType: { $ne: 'reserved' } }] },
//             function (err) {
//                 if (err) {
//                     return res.status(200).json({ status: false, message: err.error });
//                 } else {
//                     return res.status(200).json({ status: true, message: messages.SUCCESS });
//                 }
//             }
//         );
//     }

//     if (req.body.atsignType !== 'free') {
//         ReserveAtsigns.deleteMany({ $and: [{ $or: [{ price: 0 }, { atsignType: 'free' }] }, { userid: userid }, { atsignType: { $ne: 'reserved' } }] },
//             function (err) {
//                 if (err) {
//                     return res.status(200).json({ status: false, message: err.error });
//                 } else {
//                     return res.status(200).json({ status: true, message: messages.SUCCESS });
//                 }
//             }
//         );
//     }
// }

module.exports.logout = async (req, res, next) => {
    let id = req._id;
    await authService.logout(id);
    res.send();
}

module.exports.activateAtSign = async (req, res, next) => {
    let atsign = await User.find({ _id: ObjectId(req._id), "atsignDetails.atsignName": { '$regex': `^${req.body.atSignName}$`, '$options': 'i' } }, { 'atsignDetails.$': 1 });
    if (atsign.length === 0) {
        return res.send({ status: 'error', message: 'Invalid atsign' });
    }
    axios({
        method: 'post',
        url: process.env.REGISTRAR_ASSIGN,
        data: { atsign: sanitizeAtsign(req.body.atSignName) },
        headers:
        {
            // authorization: 'Apikey eyJhbGciOiJIUzI1NiJ9.YXRfd2ViX3JlZ2lzdHJhcg.IicU1gIiyj6RT-DdEtD-31ZEoY8Zm24f3SmWXbSJ6zA',
            authorization: process.env.REGISTRAR_NODE_TOKEN,
            'content-type': 'application/json; charset=utf-8'
        }
    })
        .then(async result  => {
            if (result.data['QRcode']) {
                let filter = {
                    '_id': ObjectId(req._id),
                    "atsignDetails.atsignName": { '$regex': `^${req.body.atSignName}$`, '$options': 'i' }
                }
                let update = {
                    "$set": {
                        "atsignDetails.$.isActivated": CONSTANTS.SECONDARY_STATUS.SECONDARY_CREATED
                    }
                }
                const doc = await User.findOneAndUpdate(filter, update, { new: true })
                res.send({ status: 'success', message: 'Updated  Successfully', data: result.data });
            }else{
                res.send({ status: 'error', message: '', data: result.data });
            }
        })
        .catch(error => {
            res.send({ status: 'error', message: error.message })
        })
}
module.exports.deactivateAtSign = async (req, res, next) => {
    let atsign = await User.find({ _id: ObjectId(req._id), "atsignDetails.atsignName": { '$regex': `^${req.body.atSignName}$`, '$options': 'i' } }, { 'atsignDetails.$': 1 });
    if (atsign.length === 0 || !atsign[0].atsignDetails[0].atsignName) {
        return res.send({ status: 'error', message: 'Invalid atsign' });
    }
    axios({
        method: 'post',
        url: process.env.REGISTRAR_DELETE,
        data: { atsign: sanitizeAtsign(atsign[0].atsignDetails[0].atsignName) },
        headers:
        {
            // authorization: 'Apikey eyJhbGciOiJIUzI1NiJ9.YXRfd2ViX3JlZ2lzdHJhcg.IicU1gIiyj6RT-DdEtD-31ZEoY8Zm24f3SmWXbSJ6zA',
            authorization: process.env.REGISTRAR_NODE_TOKEN,
            'content-type': 'application/json; charset=utf-8'
        }
    })
        .then(async result  => {
            console.log(result)
            if (result.status == 200) {
                let filter = {
                    '_id': ObjectId(req._id),
                    "atsignDetails.atsignName": { '$regex': `^${req.body.atSignName}$`, '$options': 'i' }
                }
                let update = {
                    "$set": {
                        "atsignDetails.$.isActivated": CONSTANTS.SECONDARY_STATUS.SECONDARY_STOPPED
                    }
                }
                const doc = await User.findOneAndUpdate(filter, update, { new: true })
                res.send({ status: 'success', message: 'Updated  Successfully', data: result.data });
            } else {
                res.send({ status: 'error', message: '', data: result.data });
            }
        })
        .catch(error => {
            res.send({ status: 'error', message: error.message })
        })
}
module.exports.checkAtSignStatus = async (req, res, next) => {

    axios({
        method: 'get',
        url: process.env.SECONDARY_STATUS_CHECK + sanitizeAtsign(req.body.atSignName,true),
    })
    // axios({
    //     method: 'get',
    //     url: process.env.REGISTRAR_CHECK+req.body.atSignName, 
    //     data: { atsign: sanitizeAtsign(req.body.atSignName) },
    //     headers:
    //     {
    //         // authorization: 'Apikey eyJhbGciOiJIUzI1NiJ9.YXRfd2ViX3JlZ2lzdHJhcg.IicU1gIiyj6RT-DdEtD-31ZEoY8Zm24f3SmWXbSJ6zA',
    //         authorization: process.env.REGISTRAR_INFRA_TOKEN,
    //         'content-type': 'application/json; charset=utf-8'
    //     }
    // })
        .then(async result => {
            // console.log(result.status)
            // console.log(result, 'result')

            if (result.status == 200) {
                let filter = {
                    '_id': ObjectId(req._id),
                    "atsignDetails.atsignName": { '$regex': `^${req.body.atSignName}$`, '$options': 'i' }
                }
                let update = {
                    "$set": {
                        "atsignDetails.$.isActivated": CONSTANTS.SECONDARY_STATUS.SECONDARY_STARTED
                    }
                }
                const doc = await User.findOneAndUpdate(filter, update, { new: true })
            }
            res.send({ status: 'success', message: 'Updated  Successfully', data: result.status == 200 ? {data:req.body.atSignName}:{} });
        })
        .catch(error => {
            //console.log('error')
            res.send({ status: 'error', message: error.message, error_code: error.response ? error.response.status : null })
        })
}
module.exports.showQRCode = async (req, res, next) => {
    
        axios({
            method: 'post',
            url: process.env.REGISTRAR_CHECK,
            data: { atsign: sanitizeAtsign(req.body.atSignName) },
            headers:
            {
                authorization: process.env.REGISTRAR_INFRA_TOKEN,
                'content-type': 'application/json; charset=utf-8'
            }
        })
        .then(async result => {
            if (result.status == 200 && result.data && result.data.data) {
                res.send({ status: 'success', message: 'Updated  Successfully', data:{} });
            } else {
                res.send({ status: 'error', message: 'Not updated' })
            }
        })
        .catch(error => {
            res.send({ status: 'error', message: error.message })
        })
}
module.exports.checkActivateStatus = async (req, res, next) => {
    axios({
        method: 'post',
        url: process.env.REGISTRAR_GETSECONDARY,
        data: { atsign: sanitizeAtsign(req.body.atSignName) },
        headers:
        {
            // authorization: 'Apikey eyJhbGciOiJIUzI1NiJ9.YXRfd2ViX3JlZ2lzdHJhcg.IicU1gIiyj6RT-DdEtD-31ZEoY8Zm24f3SmWXbSJ6zA',
            authorization: process.env.REGISTRAR_NODE_TOKEN,
            'content-type': 'application/json; charset=utf-8'
        }
    })
        .then(result => {
            res.send({ status: 'success', message: 'Updated Successfully', data: result.data });
        })
        .catch(error => {
            res.send({ status: 'error', message: error.message })
        })
}
module.exports.registerUser = async function (email) {
    try {
        let existingUserByEmail = await userService.checkUserExistByEmail(email);
        // console.log('existingUserByEmail',existingUserByEmail)
        if (existingUserByEmail) {
            return { error: { type: 'info', message: messages.USER_ALREADY_REGISTERED, data: { user_status: existingUserByEmail.userStatus } } }
        }
        const inviteCode = generateInviteCode();
        const user = {
            atsignDetails: { "inviteCode": inviteCode },
            invitedBy: '',
            userStatus: 'Invited',
            userRole: 'User',
            email: email
        }
        //sending email to admin before save so that admin is aware in case of error
        mail.sendEmailSendGrid({
            templateName: "admin_user_joining_request",
            receiver: process.env.ADMIN_REQUEST_EMAIL,
            dynamicdata: {
                "user_email": email,
                "environment": process.env.SENDGRID_SUBJECT_ENV,
            }
        });

        let savedUser = await userService.saveUser(user);
        if (savedUser) {
            mail.sendEmailSendGrid({
                templateName: "thank_you",
                receiver: email,
                dynamicdata: {}
            });
            return { value: savedUser }
        } else {
            return { error: { type: 'info', message: messages.SOMETHING_WRONG_RETRY, data: { email } } }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: error } }
    }
}

const getUserByAtsign = async function(atsign){
    let atsignName = atsign.toLowerCase().replace('@', '');
    if (regexSpecialChars(atsignName)) {
        return null;
    }
    const user = await User.findOne({ "atsignDetails.atsignName": { '$regex': `^${atsignName}$`, '$options': 'i' } },{ 'atsignDetails.$': 1 });  
    return user;
}

module.exports.getUserByAtsign = getUserByAtsign;

module.exports.registerUserWithAtsign = async function (email, atsign, originHeader) {
    try {
        atsign = atsign.toLowerCase().replace('@', '');
        const invitedByUser = await getUserByAtsign(atsign)
        if (!invitedByUser) {
            return { error: { type: 'info', message: messages.INVALID_INVITE_CODE, data: { email, atsign } } }
        }
        let existingUserByEmail = await userService.checkUserExistByEmail(email);
        if (existingUserByEmail) {
            if(atsign){
                await userService.updateCartReferalCode(existingUserByEmail._id,atsign);
            }
            return { error: { type: 'info', message: messages.USER_ALREADY_REGISTERED, data: { user_status: existingUserByEmail.userStatus } } }
        }
        const inviteCode = generateInviteCode();
        const inviteLink = (process.env.APP_URL || originHeader) + '/welcome/' + inviteCode;
        const user = {
            atsignDetails: {
                "inviteCode": inviteCode,
                "inviteLink": inviteLink
            },
            referredBy: atsign,
            cartReferalCode: atsign,
            invitedBy: invitedByUser._id,
            userStatus: 'Invited',
            userRole: 'User',
            email: email
        }

        let savedUser = await userService.saveUser(user);
        if (savedUser) {
            
            mail.sendEmailSendGrid({
                templateName: 'signup_invite',
                receiver: email,
                dynamicdata: {
                    "invite_link": inviteLink
                }
            });
            return { value: savedUser }
        } else {
            return { error: { type: 'info', message: messages.SOMETHING_WRONG_RETRY, data: { email } } }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: error } }
    }
}

module.exports.registerUserByFriendEmailInvitation = async function (currentUser, email,sendCopyToUser = false, message = '',originHeader) {
    try {
        //check for invalid email
        if (checkValidEmail(email)) return { error: { type: 'info', message: messages.ENTER_VALID_MAIL, data: null } }
        //check for user already exist
        const userExist = await User.findOne({ 'email': email })
        if (userExist) return { error: { type: 'info', message: messages.INVITE_USER_ALREADY_REGISTERED, data: null } }
        //check for alrady invited
        const userCheck = await User.findOne({ 'inviteFriendDetails.inviteLink': { $regex: ".*" + email + ".*" } })
        if (userCheck) return { error: { type: 'info', message: messages.INVITE_LINK_EXIST, data: null } }
        //invite user
        const inviteCode = await generateInviteCode();
        const inviteLink = (process.env.APP_URL || originHeader) + "/welcome/" + inviteCode
        const user = {
            atsignDetails: { "inviteCode": inviteCode, "inviteLink": inviteLink },
            invitedBy: currentUser._id,
            userStatus: 'Invited',
            userRole: 'User',
            email: email
        }
        const currentUserUpdateData = {
            "$push": {
                "inviteFriendDetails": {
                    inviteCodefriends: inviteCode,
                    used: false,
                    inviteLink: inviteLink
                }
            }
        }
        const usersPromise = await Promise.all([userService.saveUser(user), await User.findOneAndUpdate({ _id: currentUser._id }, currentUserUpdateData)])
        if (usersPromise[0] && usersPromise[1]) {
            mail.sendEmailSendGrid({
                from_name: currentUser.email,
                templateName: "send_invite",
                receiver: email,
                cc_email: sendCopyToUser ? currentUser.email : '',
                dynamicdata: {
                    "invite_link": inviteLink,
                    "from_name": currentUser.name,
                    "personal_message": message.replace(/\n/g, "<br />"),
                }
            });
            return { value: usersPromise[0] }
        } else {
            return { error: { type: 'info', message: messages.SOMETHING_WRONG_RETRY } }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: error } }
    }
}

module.exports.getAllAtsignOfCurrentUser = async function (req, res) {
    try {
        const userId = ObjectId(req._id)
        if (!userId) {
            res.status(200).send({ status: "error", message: messages.UNAUTH });
            return;
        }
        const { error, value } = await userService.getAllAtsignByUser(userId)
        if (value) {
            res.send({ status: 'success', message: messages.SENT_SUCCESS, data: value })
        } else {
            if (error.type == 'info') {
                res.send({ status: 'error', message: error.message })
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

module.exports.sendOTPForAddingVerificationMethod = async function(req,res){
    if(!req._id) return res.status(200).json({status:'error',message:messages.UNAUTH})
    if(!req.body.email && !req.body.contact) return res.status(200).json({status:'error',message:messages.INVALID_REQ_BODY})
    const { error, value } = await userService.sendOTPForAddingVerificationMethod(req._id,req.body)
    if (value) {
        return res.status(200).json({status:'success',message:messages.SENT_SUCCESS})
    } else {
        if (error.type == 'info') {
            res.status(200).json({ status: 'error', message: error.message })
        } else {
            logError(error.data, req)
            res.status(200).send({ status: 'error', message: messages.SOMETHING_WRONG_RETRY });
        }
    }
}

module.exports.verifyVerificationMethod = async function(req,res){
    if(!req._id) return res.status(200).json({message:messages.UNAUTH})
    if(!req.body.email && !req.body.contact) return res.status(200).json({status:'error',message:messages.INVALID_REQ_BODY})
    if(!req.body.otp) return res.status(200).json({status:'error',message:messages.OTP_REQUIRED})
    const { error, value } = await userService.verifyVerificationMethod(req._id,req.body)
    if (value) {
        return res.status(200).json({status:'success',message:messages.SUCCESSFULLY})
    } else {
        if (error.type == 'info') {
            res.status(200).json({ status: 'error', message: error.message })
        } else {
            logError(error.data, req)
            res.status(200).send({ status: 'error', message: messages.SOMETHING_WRONG_RETRY });
        }
    }
}

//User Renewal Notification
function getDateFilterForRenewalNotification(notificationBeforeDays = 60) {
    return {
        "lastPaymentValidTill": {
            "$gte": moment().utc().hours(0).minutes(0).seconds(0).milliseconds(0).add(notificationBeforeDays, 'days').toDate(),
            "$lt": moment().utc().hours(0).minutes(0).seconds(0).milliseconds(0).add((notificationBeforeDays + 1), 'days').toDate()
        }
    }
}
function getDateFilterForRenewalNotificationPastDate(notificationAfterDays) {
    return {
        "lastPaymentValidTill": {
            "$gte": moment().utc().hours(0).minutes(0).seconds(0).milliseconds(0).subtract(notificationAfterDays, 'days').toDate(),
            "$lt": moment().utc().hours(0).minutes(0).seconds(0).milliseconds(0).subtract(notificationAfterDays - 1, 'days').toDate()
        }
    }
}

async function sendRenewalNotificationByBatch(pageNo, limit, filter, template,notificationData={}) {
    filter['atsignType'] = { $ne: 'free' }
    filter['payAmount'] = { $gte: 0 }
    filter['status'] = 'ACTIVE'
    let results = await AtsignDetailController.findAtsignForRenewal(filter, (pageNo - 1) * limit, limit)
    if (results.value.length) {
        await Promise.all(results.value.map(async atsignByUser => {
            let user = await userService.getUserById(atsignByUser._id)
            if (user.userStatus && user.email && user.userStatus.toLowerCase() == 'active') {
                mail.sendEmailSendGrid({
                    templateName: template,
                    receiver: user.email,
                    dynamicdata: {
                        atsigns: atsignByUser.atsignNames.reduce((acc,val,key)=>(key === atsignByUser.atsignNames.length - 1) ? ((acc + `${key==0 ? '':' and '}@`) + val) :(acc + `${key==0 ? '':', '}@` + val),"")
                    }
                });
                await NotificationController.addNotification(user._id,'RENEWAL',{...notificationData,atsigns:atsignByUser.atsignNames})
            }
        }))
    }
    return { value: { isNext: results.value && results.value.length === limit ? true : false } }
}

module.exports.sendRenewalNotification = async function () {
    let pageNo = 1, limit = 1, batchResult = null;
    const filter = getDateFilterForRenewalNotification(60)
    batchResult = await sendRenewalNotificationByBatch(pageNo, limit, filter, "renewal_reminder_60", { daysToExpire: 60 });
    while (batchResult && batchResult.value && batchResult.value.isNext) {
        pageNo = pageNo + 1;
        batchResult = await sendRenewalNotificationByBatch(pageNo, limit, filter, "renewal_reminder_60", { daysToExpire: 60 });
    }
}
module.exports.sendRenewalNotificationPast30 = async function () {
    let pageNo = 1, limit = 10, batchResult = null;
    const filter = getDateFilterForRenewalNotificationPastDate(30)
    batchResult = await sendRenewalNotificationByBatch(pageNo, limit, filter, "renewal_reminder_past30", { daysAfterExpire: 30 });
    while (batchResult && batchResult.value && batchResult.value.isNext) {
        pageNo = pageNo + 1;
        batchResult = await sendRenewalNotificationByBatch(pageNo, limit, filter, "renewal_reminder_past30", { daysAfterExpire: 30 });
    }
}
module.exports.sendRenewalNotificationCurrent = async function () {
    let pageNo = 1, limit = 10, batchResult = null;
    const filter = getDateFilterForRenewalNotificationPastDate(0)
    batchResult = await sendRenewalNotificationByBatch(pageNo, limit, filter, "renewal_reminder_due", { daysToExpire: 0 });
    while (batchResult && batchResult.value && batchResult.value.isNext) {
        pageNo = pageNo + 1;
        batchResult = await sendRenewalNotificationByBatch(pageNo, limit, filter, "renewal_reminder_due", { daysToExpire: 0 });
    }
}
module.exports.sendRenewalNotificationPast60 = async function () {
    let pageNo = 1, limit = 10, batchResult = null;
    const filter = getDateFilterForRenewalNotificationPastDate(60)
    batchResult = await sendRenewalNotificationByBatch(pageNo, limit, filter, "renewal_reminder_past60", { daysAfterExpire: 60 });
    while (batchResult && batchResult.value && batchResult.value.isNext) {
        pageNo = pageNo + 1;
        batchResult = await sendRenewalNotificationByBatch(pageNo, limit, filter, "renewal_reminder_past60", { daysAfterExpire: 60 });
    }
}
module.exports.sendRenewalNotificationPast61 = async function () {
    let pageNo = 1, limit = 10, batchResult = null;
    const filter = getDateFilterForRenewalNotificationPastDate(61)
    batchResult = await sendRenewalNotificationByBatch(pageNo, limit, filter, "atsign_expired", { expired: true });
    while (batchResult && batchResult.value && batchResult.value.isNext) {
        pageNo = pageNo + 1;
        batchResult = await sendRenewalNotificationByBatch(pageNo, limit, filter, "atsign_expired", { expired: true });
    }
}

//User Renewal Notification End

exports.checkLastVerification = async function(req,res) {
    let id = req._id;
    let user = await User.findOne({ _id: ObjectId(id)});
    let verify= true;
    if(user.lastVerification){
        let lastVerification = new Date(user.lastVerification);
        let now = moment(new Date());
        let end = moment(lastVerification);
        let duration = moment.duration(now.diff(end));
        let minutes = duration.asMinutes();
        if(minutes < verificationExpiry){
           verify = false;
        }
        res.send({status:'success', verify: verify});
    }else{
        res.send({status:'success', verify: verify});
    }
}
exports.sendNewInviteLink = async function(req,res) {
    let id = req._id;
    let user = await User.findOne({ _id: ObjectId(id) });
    if (user) {
        const inviteCode = user.atsignDetails[0].inviteCode;
        const inviteLink = (process.env.APP_URL || req.headers.origin) + '/welcome/' + inviteCode;

        let updateUser = await User.findOneAndUpdate({ _id: ObjectId(id) }, { "$set": { 'atsignDetails.0.inviteLink': inviteLink } }, { new: true });
        mail.sendEmailSendGrid({
            templateName: "signup_invite",
            receiver: user.email,
            dynamicdata: {
                "invite_link": inviteLink
            }
        });
        res.send({ status: 'success', message: 'Sent successfully', data: {} });
    } else {
        res.send({ status: 'error', message: 'User not found', data: {} });
    }
}


module.exports.cartReferalCode = async (req, res) => {
    try {
        if (req.body.cartReferalCode) {
            const isValidAtsign = AtsignController.checkValidAtsign(req.body.cartReferalCode) 
            if(!isValidAtsign) return res.status(200).send({ status: 'error', message: messages.INVALD_CODE });
            
            const { error, value } = await userService.updateCartReferalCode(req._id,req.body.cartReferalCode.toLowerCase())
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
            res.status(200).send({ status: 'error', message: messages.INVALD_CODE });
        }
    } catch (error) {
        logError(error, req)
        res.status(200).send({ status: 'error', message: error.message });
    }
}

module.exports.getUserById = async function (id) {
    try {
        if (id) {
            const user = await userService.getUserById(id)
            return { value: user }
        } else {
            return { error: { type: 'info', message: messages.INVALID_EMAIL_PHONE } }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}
module.exports.getUserByEmail = async function (email) {
    try {
        if (email) {
            const user = await userService.getUserByEmail(email)
            return { value: user }
        } else {
            return { error: { type: 'info', message: messages.INVALID_EMAIL_PHONE } }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}
module.exports.addAtsignToUser = async function (userId,atsignData) {
    try {
        if (userId && atsignData) {
            const user = await userService.addAtsignToUser(userId,atsignData)
            return user 
        } else {
            return { error: { type: 'info', message: messages.INVALID_EMAIL_PHONE } }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}

module.exports.removeAtsignFromUser = async function (userId,atsign) {
    try {
        if (userId && atsign) {
            const user = await userService.removeAtsignFromUser(userId,atsign)
            return user
            // if(user.value){
            //     const {error,value} = await AtsignDetailController.removeAtsign(userId,atsign)
            //     return {error,value}
            // } else{

            //     return {error: user.error}
            // }
        } else {
            return { error: { type: 'info', message: messages.INVALID_EMAIL_PHONE } }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}

function sanitizeAtsign(atsign, encodeURI = false) {
    if (encodeURI) {
        return encodeURIComponent(atsign.toLowerCase());
    } else {
        return atsign.toLowerCase();
    }
}