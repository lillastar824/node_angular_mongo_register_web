const Brands = require('./../models/brands.model')
const Atsign = require('./../models/atsigns.model');
const Transactions = require('./../models/transactions.model')
const ReserveAtsigns = require('./../models/reserveatsigns.model');
const User = require('./../models/user.model');
const objectId = require('mongodb').ObjectID;

const utlity = require('../config/UtilityFunctions');
const { messages } = require('../config/const');
const mail = require('./../config/mailer');
const AtsignDetailController = require('./../controllers/atsign-detail.controller')
exports.getAllAtsigns = async (paginationData) => {
    let pageNo = Number(paginationData['pageNo']);
    let pageSize = Number(paginationData['pageSize']);
    let sortBy = paginationData['sortBy'];
    let sortOrder = paginationData['sortOrder'] === 'asc' ? 1 : -1;
    let atsignType = paginationData['atsignType'];
    let searchTerm = paginationData['searchTerm'];
    let skip = (pageNo - 1) * pageSize;
    let limit = pageSize;
    let filter ={};
    if(searchTerm){
        filter = {
            name : {$regex: new RegExp(utlity.escapeRegExp(searchTerm),'i')}
        };
    }else{
        filter = {};
    }

    if (atsignType === "Brand") {
        let totalData = await Brands.countDocuments(filter);
        let brands = await Brands.find(filter).sort({ [sortBy]: sortOrder })
            .skip(skip).limit(limit).lean().exec();
        for (let i = 0; i < brands.length; i++) {
            brands[i]['type'] = 'Brand';
        }
        let responseData = {};
        responseData['atsigns'] = brands;
        responseData['pageNo'] = pageNo;
        responseData['totalPage'] = Math.ceil(totalData / pageSize);
        responseData['totalData'] = totalData;
        return responseData;
    } else {
        let totalData = await Atsign.countDocuments(filter);
        let atsigns = await Atsign.find(filter).sort({ [sortBy]: sortOrder })
            .skip(skip).limit(limit).lean().exec();
        for (let j = 0; j < atsigns.length; j++) {
            atsigns[j]['type'] = 'Custom';
        }
        let responseData = {};
        responseData['atsigns'] = atsigns;
        responseData['pageNo'] = pageNo;
        responseData['totalPage'] = Math.ceil(totalData / pageSize);
        responseData['totalData'] = totalData;
        return responseData;
    }
}

exports.addReserveAtsigns = async (name, type) => {
    if (utlity.regexSpecialChars(name)) {
        return { status: 'error', message: messages.NO_SPL_CHAR, data: {} };
    }
    
    let dataBrand = await Brands.findOne({ name: name });
    let dataCustom = await Atsign.findOne({ name: name });
    
    if (type === 'Brand') {
        if (!dataBrand && !dataCustom) {
            const brands = new Brands();
            brands.name = name;
            await brands.save().catch(err => {
                return { status: 'logError', error: err }
            });
            return { status: 'success', message: messages.SIGN_ADDED, data: {} };
        } else {
            return { status: 'error', message: messages.SIGN_EXIST, data: {} };
        }
    } else {
        if (!dataBrand && !dataCustom) {
            const atsign = new Atsign();
            atsign.name = name;
            await atsign.save().catch(err => {
                return { status: 'logError', error: err }
            });
            return { status: 'success', message: messages.SIGN_ADDED, data: {} };
        } else {
            return { status: 'error', message: messages.SIGN_EXIST, data: {} };
        }
    }
}

exports.deleteSavedAtsign = async (id, type) => {
    if (id) {
        try {
            let data;
            if (type === 'Brand') {
                data = await Brands.findOneAndDelete({ _id: objectId(id) });
            } else {
                data = await Atsign.findOneAndDelete({ _id: objectId(id) });
            }
            if (data) {
                return { status: 'success', message: '', data: {} };
            } else {
                return { status: 'error', message: messages.SIGN_MISSING, data: {} }
            }
        } catch (error) {
            return { 'status': 'logError', error: error }
        }
    } else {
        return { status: 'error', message: messages.SIGN_MISSING, data: {} }
    }
}


exports.updateSavedAtsign = async (id, type, name) => {
    let filter = {}, update = {};
    if (utlity.regexSpecialChars(name)) {
        return { status: 'error', message: messages.NO_SPL_CHAR, data: {} }
    }
    filter['_id'] = objectId(id);
    update['name'] = name.toLowerCase();
    try {
        if (type === 'Brand') {
            let brandName = await Brands.findOne({ name: update['name'] });
            if (!brandName) {
                await Brands.findOneAndUpdate(filter, update);
                return { status: 'success', message: '', data: {} }
            }
            else {
                return { status: 'error', message: messages.SIGN_EXIST, data: {} };
            }
        }
        else {
            let astignName = await Atsign.findOne({ name: update['name'] });
            if (!astignName) {
                await Atsign.findOneAndUpdate(filter, update);
                return { status: 'success', message: '', data: {} }
            }
            else {
                return { status: 'error', message: messages.SIGN_EXIST, data: {} };
            }
        }
    }
    catch (error) {
        return { 'status': 'logError', error: error }
    }
}

exports.validateFreeCartData = async (userId, cartData) => {
    for (let index = 0; index < cartData.length; index++) {
        const element = cartData[index];

        if (utlity.regexSpecialChars(element.atsignName)) {
            return { status: 'error', message: "ola", data: {} }
        }
        let filter = {
            "userid": userId,
            "atsignType": "free",
            "atsignName": element.atsignName,
            "price": 0
        };

        let sign = await ReserveAtsigns.find(filter).sort({ timestamp: -1 }).limit(1);
        if (sign.length === 0 || element.atsignName !== sign[0].atsignName || !sign[0].timestamp || !sign[0].is_verified) {
            return { status: 'error', message: messages.ATSIGN_NOT_AVAILABLE, data: {} };
        }
    }
    return { status: 'success'};
}

const saveFreeCartItem = async (userid, inviteCode, atsignName, index, length, completeOrderId,atsignData,assignedByAdmin) => {
    const atsign = {};
    atsign.atsignName = atsignName;
    atsign.atsignCreatedOn = new Date;
    atsign.atsignType = 'free';

    let date = (new Date(atsign.atsignCreatedOn))
    date.setUTCHours(0)
    date.setUTCMinutes(0)
    date.setUTCSeconds(0)
    date.setUTCMilliseconds(0)
    date.setFullYear(date.getFullYear() + 1)
    let atsignDetailsObj = {
        "atsignName": atsign.atsignName,
        "atsignType": atsign.atsignType,
        "atsignCreatedOn": atsign.atsignCreatedOn,
        "premiumAtsignType": '',
        "payAmount": 0,
        "lastPaymentValidFrom": atsign.atsignCreatedOn,
        "userId": userid,
        'lastPaymentValidTill': date,
        "status": 'ACTIVE',
        'paymentDetails' : [{
            period_start: atsign.atsignCreatedOn,
            period_end: date,
            amount_paid: atsign['payAmount'],
            billing_reason: 'BUY_ATSIGN',
            total: atsign['payAmount'] ? atsign['payAmount'].toFixed(0) : 0
        }],
    }

    if(assignedByAdmin) atsignDetailsObj['assignedByAdmin'] = assignedByAdmin
    await AtsignDetailController.addAtsignDetail(atsignDetailsObj)
    
    let update = {
        "$set": {
            "atsignDetails.$.atsignName": atsign.atsignName,
            "atsignDetails.$.atsignType": atsign.atsignType,
            "atsignDetails.$.atsignCreatedOn": atsign.atsignCreatedOn,
            "userStatus": 'Active'
        }
    };
    let doc = await User.findOneAndUpdate({ _id: userid, 'atsignDetails.inviteCode': inviteCode }, update);
    if (!doc) {
        update = {
            "$push": {
                "atsignDetails": {
                    "inviteCode": inviteCode,
                    "atsignName": atsign.atsignName,
                    "atsignType": atsign.atsignType,
                    "atsignCreatedOn": atsign.atsignCreatedOn,
                }
            },
            "userStatus": 'Active'
        };
        doc = await User.findOneAndUpdate({ _id: userid }, update);
    }

    if (doc) {
        const filterFriend = { 'inviteFriendDetails.inviteCodefriends': inviteCode };
        const updateFriend = {
            "$set": {
                "inviteFriendDetails.$.used": true
            }
        };
        await User.findOneAndUpdate(filterFriend, updateFriend);
    }

    if (index == length - 1) {
        if (doc.email) {
            var data = {
                templateName: "purchase_receipt",
                receiver: doc.email,
                dynamicdata: {
                    "usd_amount": 0,
                    "transaction_date": new Date(atsign.atsignCreatedOn).toLocaleString('default', { month: 'long' }) + ' ' + new Date(atsign.atsignCreatedOn).getDate() + ', ' + new Date(atsign.atsignCreatedOn).getFullYear(),
                    "cc_last_4digits": '',
                    "receipt_number": completeOrderId,
                    "atsigns": atsignData,
                    "order_id": completeOrderId
                }
            };
            mail.sendEmailSendGrid(data);
        }
        else {
            var messageattr = {
                to: doc.contact,
                message: 'Your payment of $' + 0 + ' for order number #' + completeOrderId + ' is successful. \n\n Regards, \n The @ Company'
            };
            textMessage.sendTextMessage(messageattr);
        }
    }
    return ReserveAtsigns.findOneAndDelete({ userid: userid, atsignName: atsignName });
}

const createFreeOrder = async function (userId, inviteCode, cartData,assignedByAdmin, retryAttempt = 0) {
    let createdTransaction = null
    const payAmount = 0, completeOrderId = utlity.generateOrderId();
    try {
        let atsignNames = [];
        for (let atsignIndex = 0; atsignIndex < cartData.length; atsignIndex++) {
          atsignNames.push({ premiumAtsignType: (cartData[atsignIndex]['premiumHandleType']?cartData[atsignIndex]['premiumHandleType'] : (cartData[atsignIndex]['payAmount'] && cartData[atsignIndex]['payAmount'] > 0 ? 'paid':'free')), atsignName: cartData[atsignIndex]['atsignName'], payAmount: cartData[atsignIndex]['payAmount'] })
        }
        const newTransaction = {
            paymentIntentId: "",
            userId: userId,
            amount: payAmount,
            status: 'succeeded',
            atsignName: atsignNames,
            orderId: completeOrderId
        }
        createdTransaction = await Transactions.create(newTransaction)

    } catch (err) {
        if (err.name == 'MongoError' && err.code == '11000' && retryAttempt < 3) {
            retryAttempt = retryAttempt + 1;
            return createFreeOrder(userId, inviteCode, cartData, assignedByAdmin,retryAttempt);
        }
        return { error: err }
    }
    if (createdTransaction) {
        try {
            let cartItemData = [],atsignData = [];;
            for (let i = 0; i < cartData.length; i++) {
                atsignData.push({
                    "atsign": cartData[i].atsignName,
                    "price": 0
                })
                if (i === 0) {
                    cartItemData[i] = await saveFreeCartItem(userId, inviteCode, cartData[i].atsignName, i, cartData.length, completeOrderId,atsignData,assignedByAdmin);
                } else {
                    cartItemData[i] = await saveFreeCartItem(userId, inviteCode + '_' + i, cartData[i].atsignName, i, cartData.length, completeOrderId,atsignData,assignedByAdmin);
                }
            }
            return { value: { order: createdTransaction, cartItemData } }
        } catch (error) {
            return { error: error, value: { order: createdTransaction } }
        }
    } else {
        return { error: Error('Order not created') }
    }
}

module.exports.createFreeOrder = createFreeOrder