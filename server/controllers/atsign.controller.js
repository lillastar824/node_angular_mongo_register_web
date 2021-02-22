const mongoose = require('mongoose');
const ReserveAtsigns = mongoose.model('Reserveatsigns');
const User = mongoose.model('User');
const logError = require('../config/handleError');
const ObjectId = require('mongodb').ObjectID;
const { regexSpecialChars, checkSignAvailability, decryptAtsign, findTimeDiffSec, defaultTimeLeft } = require('./../config/UtilityFunctions');
const utilityFunction = require('../config/UtilityFunctions');
const { messages } = require('./../config/const');
const atsignService = require('../services/atsign.service');
const CommissionController = require('./../controllers/commission.controller');
const { checkAndProvideCommission } = require('./../controllers/commission.controller');

async function reserveatsign(req, res) {

    let decryptedData;
    if (req.body.data) {
        try {
            decryptedData = JSON.parse(decryptAtsign(req.body.data));
        } catch (err) {
            var errorData = { 'decryptedData': decryptAtsign(req.body.data), 'body': req.body.data };
            var data1 = {
                //name of the email template that we will be using
                templateName: "error_email",
                receiver: 'athandle123@gmail.com',
                dynamicdata: { error_string: JSON.stringify(errorData), environment: 'dev' }
            };
            mail.sendEmailSendGrid(data1);
        }
    } else {
        decryptedData = req.body;
    }



    try {
        const { atsignName, atsignPrice, atSignType } = decryptedData;
        let atSignData = await checkSignAvailability(atsignName, true);
        if (atSignType == 'free') {
            if (atSignData && atSignData !== 'brand' && atSignData.price <= 100) {
                const reserveAtsigns = new ReserveAtsigns();
                reserveAtsigns.userid = req._id;
                reserveAtsigns.atsignName = atsignName;
                reserveAtsigns.price = atsignPrice;
                await reserveAtsigns.save((err, doc) => {
                    if (!err)
                        res.send();
                    else {
                        res.status(422).send(err);
                    }
                });
            } else {
                res.send({ status: 'error', message: messages.ATSIGN_NOT_AVAILABLE, data: {} });
            }
        }
        else if (atSignData && atSignData.price) {
            const reserveAtsigns = new ReserveAtsigns();
            reserveAtsigns.userid = req._id;
            reserveAtsigns.atsignName = atSignData.atsignName;
            reserveAtsigns.price = atSignData.price;
            await reserveAtsigns.save((err, doc) => {
                if (!err)
                    res.send();
                else {
                    res.status(422).send(err);
                }
            });
        } else {
            res.send({ status: 'error', message: messages.ATSIGN_NOT_AVAILABLE, data: {} });
        }
    } catch (error) {
        logError(error, req);
        res.status(422).send(error);
    }

}

exports.reserveatsign = reserveatsign;

async function fetchReserveAtsign(req, res) {
    try {
        const reserveHandle = await ReserveAtsigns.findOne({ userid: req._id });
        // const reserveHandle = await ReserveAtsigns.findOne({ userid: req._id });
        res.send({ reserveHandle });
    } catch (error) {
        logError(error, req);
        res.status(422).send(error);
    }
}

exports.fetchReserveAtsign = fetchReserveAtsign;

async function updateReserveAtsign(req, res) {
    let decryptedData;
    if (req.body.data) {
        try {
            decryptedData = JSON.parse(decryptAtsign(req.body.data));
        } catch (err) {
            var errorData = { 'decryptedData': decryptAtsign(req.body.data), 'body': req.body.data };
            var data1 = {
                //name of the email template that we will be using
                templateName: "error_email",
                receiver: 'athandle123@gmail.com',
                dynamicdata: { error_string: JSON.stringify(errorData), environment: 'dev' }
            };
            mail.sendEmailSendGrid(data1);
        }
    } else {
        decryptedData = req.body;
    }
    let update = {};
    let filter = {
        userid: req._id
    };
    if (decryptedData['type'] === 'is_verified') {
        update['is_verified'] = true;
    } else {
        update['timestamp'] = new Date();
        update['timer_started'] = true;
    }
    try {
        let reserveHandle;
        if (decryptedData.cart && decryptedData.cart.length > 0) {
            for (let i = 0; i < decryptedData.cart.length; i++) {
                filter['atsignName'] = decryptedData.cart[i].atsignName.replace(/\s/g, '');
                reserveHandle = await ReserveAtsigns.findOneAndUpdate(filter, update);
                if(reserveHandle && reserveHandle.atsignType === 'reserved') {
                    await ReserveAtsigns.findOneAndUpdate(filter, {timestamp:new Date(),timer_started:true});
                }
            }
        }
        // console.log('reserveHandle1',reserveHandle)
        if (decryptedData.atsignName) {
            filter['atsignName'] = decryptedData.atsignName.replace(/\s/g, '');
            // console.log('filter',filter)
            reserveHandle = await ReserveAtsigns.findOneAndUpdate(filter, update);
        }
        //console.log('reserveHandle2',reserveHandle)
        // const reserveHandle = await ReserveAtsigns.findOne({ userid: req._id });
        if (!reserveHandle) {
            res.status(404).send({ status: 'error', "message": "@sign not available" })
        } else {
            res.send({});
        }
    } catch (error) {
        logError(error, req, res);
        // res.status(422).send(error);
    }
}

exports.updateReserveAtsign = updateReserveAtsign;

async function deleteReserveAtsign(req, res) {
    try {
        await ReserveAtsigns.findOneAndDelete({ userid: req._id, atsignName: req.body.atsignName });
        let update = { $pull: { atsignDetails: { atsignName: req.body.atsignName } } };
        const existingUser = await User.findOne({ _id: ObjectId(req._id) }).lean().exec();
        if (existingUser.atsignDetails.length === 1) {
            delete existingUser.atsignDetails[0].payAmount;
            delete existingUser.atsignDetails[0].atsignName;
            update = existingUser;
        }
        const user = await User.findOneAndUpdate({ _id: ObjectId(req._id) }, update, { new: true });
        if (user) {
            for (let i = 0; i < user.atsignDetails.length; i++) {
                let invite = user.atsignDetails[i].inviteCode.split('_');
                if (invite.length > 1) {
                    if (i === 0) {
                        user.atsignDetails[i].inviteCode = invite[0];
                    } else {
                        user.atsignDetails[i].inviteCode = invite[0] + '_' + i;
                    }
                }
            }
            await User.findOneAndUpdate({ _id: ObjectId(req._id) }, user, { new: true });
        }
        // const reserveHandle = await ReserveAtsigns.findOne({ userid: req._id });
        res.send({message:messages.SENT_SUCCESS});
    } catch (error) {
        logError(error, req);
        res.status(422).send(error);
    }
}

exports.deleteReserveAtsign = deleteReserveAtsign;

async function getCartData(req, res) {
    let notimestarted = req.query.notimestarted;
    let maxDiff = null;
    let reserveddata = [];
    let reservedsign;
    if (notimestarted != "false") {
        reservedsign = await ReserveAtsigns.find({ "userid": req._id });
        res.send({ status: 'success', reservedsign: reservedsign  });
        return;
    } else {
        reservedsign = await ReserveAtsigns.find({ "userid": req._id, $or: [{"timer_started": true}, {"atsignType": 'reserved'}] });
    }
    for (let i = 0; i < reservedsign.length; i++) {
        let diff = findTimeDiffSec(reservedsign[i].timestamp);
        if (!maxDiff && diff < defaultTimeLeft && diff >= 0) {
            maxDiff = diff;
        }
        if ((diff < defaultTimeLeft && diff >= 0) || reservedsign[i].atsignType === 'reserved') {
            reserveddata.push(reservedsign[i]);
            if (diff > maxDiff) {
                maxDiff = diff;
            }
        }
        if(reservedsign[i].atsignType === 'reserved' && !reservedsign[i].timestamp){
            maxDiff = defaultTimeLeft;
        }
    }

    let remainingtime = defaultTimeLeft - maxDiff;
    let cartAmount = 0
    for (let i = 0; i < reserveddata.length; i++) {
        cartAmount += reserveddata[i]['price'];
    }
    cartAmount = cartAmount
    let orderAmountDetails = await CommissionController.getDiscountDetails(req._id,cartAmount)

    // if (reserveddata && reserveddata.length > 0) {
        res.send({ status: 'success', reservedsign: reserveddata, timer: reserveddata.length ? remainingtime : 0 ,orderAmountDetails });
    // }
    // else {
    //     res.send({ status: 'error', message: messages.CART_EMPTY });
    // }
}

exports.getCartData = getCartData;

async function checkValidAtsign(atsign) {
    let atsignName = atsign.toLowerCase().replace('@', '');
    if (regexSpecialChars(atsignName)) {
        return false;
        // return res.status(200).json({ status: 'error', message: 'Special Characters not allowed in @sign name', data: {} });
    }
    const user = await User.find({ "atsignDetails.atsignName": { '$regex': `^${atsignName}$`, '$options': 'i' } }, { 'atsignDetails.$': 1 });
    // return user.length > 0;
    if (user.length > 0) {
        return user[0].atsignDetails[0].atsignName;
    }
    else {
        return false;
    }
}

exports.checkValidAtsign = checkValidAtsign;


exports.saveFreeOnlyCart = async (req, res) => {
    const cartData = req.body.cartData,
        inviteCode = req.body.inviteCode,
        userId = req._id
    const validLink = await utilityFunction.checkValidInviteLink(req._id, inviteCode, 'free');
    if (!validLink) {
        return res.status(200).json({ status: 'error', message: messages.INVITE_LINK_EXPIRE, data: {} });
    }
    let isValidCartData = await atsignService.validateFreeCartData(userId, cartData);
    if (isValidCartData.status === "success") {
        const newOrder = await atsignService.createFreeOrder(userId, inviteCode, cartData);
        if (newOrder.error) {
            res.status(200).json({ status: 'error', message: (newOrder.value && newOrder.value.order ? "Please contact support for your order" : messages.SOMETHING_WRONG_RETRY), data: newOrder.value })
        } else {
            if (newOrder.value && newOrder.value.order && newOrder.value.order.orderId) {
                await CommissionController.checkAndProvideCommission(userId, {
                    amount: 0,
                    currency: 'usd',
                    cartData: cartData,
                    completeOrderId: newOrder.value.order.orderId
                },true)
            }
            res.status(200).json({ status: 'success', data: newOrder.value })
        }
    } else {
        return res.status(200).json(isValidCartData);
    }
}