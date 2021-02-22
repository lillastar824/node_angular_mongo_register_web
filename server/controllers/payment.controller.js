const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');
const Transaction = require('./../models/transactions.model');
const transactions = mongoose.model('Transactions');
const User = mongoose.model('User');
const ReserveAtsigns = mongoose.model('Reserveatsigns');
const logError = require('./../config/handleError');
const mail = require('./../config/mailer');
const { regexSpecialChars, checkValidInviteLink } = require('./../config/UtilityFunctions');
const textMessage = require('./../config/textMessage');
const ObjectId = require('mongodb').ObjectID;
const { findTimeDiffSec, defaultTimeLeft, generateOrderId } = require('./../config/UtilityFunctions');
const { messages } = require('./../config/const');
const CommissionController = require('./../controllers/commission.controller')
const GiftUpController = require('./gift-up.controller')
const AwaitedTransaction = require('./../models/awaited-transaction')
const AtsignDetailController = require("./atsign-detail.controller");
const UserController = require("./user.controller");
async function stripepublishkey(req, res, next) {
    return res.status(200).send({ key: process.env.STRIPE_PUBLISHABLE_KEY });
}
exports.stripepublishkey = stripepublishkey;
async function calculateOrderAmount(userid, cartData) {
    let atsign, amount = 0;
    for (let i = 0; i < cartData.length; i++) {
        atsign = await ReserveAtsigns.findOne({ userid: userid, atsignName: cartData[i].atsignName });
        amount += atsign ? atsign.price : 0

    }
    return amount * 100; // stripe accepts payment in cent thats why multiplied by 100
}

async function saveTransaction(intent, userid, cartData, payAmount, completeOrderId, promotionalCodeDetails = null, type = "CREATE_ATSIGN") {
    const transaction = new Transaction();
    transaction.paymentIntentId = intent.id || '';
    transaction.userId = userid;
    transaction.amount = payAmount;
    transaction.status = intent.status;
    transaction.promotionalCodeDetails = promotionalCodeDetails
    transaction.type = type
    let atsignNames = [];
    for (let atsignIndex = 0; atsignIndex < cartData.length; atsignIndex++) {
        atsignNames.push({ premiumAtsignType: (cartData[atsignIndex]['premiumHandleType'] ? cartData[atsignIndex]['premiumHandleType'] : (cartData[atsignIndex]['payAmount'] && cartData[atsignIndex]['payAmount'] > 0 ? 'paid' : 'free')), atsignName: cartData[atsignIndex]['atsignName'], payAmount: cartData[atsignIndex]['payAmount'] })
    }

    transaction.atsignName = atsignNames;
    transaction.orderId = completeOrderId
    return transaction.save((err, doc) => {
        if (err) {
            if (err['errmsg'].indexOf('duplicate key error') !== -1) {
                saveTransaction(intent, userid, cartData, payAmount, completeOrderId, promotionalCodeDetails,type);
            } else {
                logError(err);
            }
        }
    });
}

async function saveAtsign(paymentMethod, userid, inviteCode, atsignName, premiumHandleType, atsignPrice, index, length, orderAmount, originalOrderAmount, res, completeOrderId, atsignData, promotionalCardDetails) {
    const price = atsignPrice;
    const atsign = {};
    atsign.atsignName = atsignName;
    atsign.premiumHandleType = premiumHandleType;
    atsign.atsignCreatedOn = new Date;
    atsign.atsignType = premiumHandleType.toLowerCase() === 'free' ? 'free' : 'paid';
    atsign.payAmount = price;

    let date = (new Date(atsign.atsignCreatedOn))
    date.setUTCHours(0)
    date.setUTCMinutes(0)
    date.setUTCSeconds(0)
    date.setUTCMilliseconds(0)
    date.setFullYear(date.getFullYear() + 1)
    a = await AtsignDetailController.addAtsignDetail({
        "atsignName": atsign.atsignName,
        "atsignType": atsign.atsignType,
        "atsignCreatedOn": atsign.atsignCreatedOn,
        "premiumAtsignType": atsign.premiumHandleType,
        "payAmount": atsign.payAmount,
        "lastPaymentValidFrom": atsign.atsignCreatedOn,
        "userId": userid,
        'lastPaymentValidTill': date,
        "status": 'ACTIVE',
        "inviteCode": inviteCode,
        'paymentDetails': [{
            period_start: atsign.atsignCreatedOn,
            period_end: date,
            amount_paid: atsign['payAmount'],
            billing_reason: 'BUY_ATSIGN',
            total: atsign['payAmount'] ? atsign['payAmount'].toFixed(0) : 0
        }]
    })
    const update = {
        "$set": {
            "atsignDetails.$.atsignName": atsign.atsignName,
            "atsignDetails.$.atsignType": atsign.atsignType,
            "atsignDetails.$.atsignCreatedOn": atsign.atsignCreatedOn,
            "atsignDetails.$.premiumAtsignType": atsign.premiumHandleType,
            "atsignDetails.$.payAmount": atsign.payAmount,
            "userStatus": 'Active'
        }
    };
    let doc = await User.findOneAndUpdate({ _id: userid, 'atsignDetails.inviteCode': inviteCode }, update);
    if (!doc) {
        const update = {
            "$push": {
                "atsignDetails": {
                    "inviteCode": inviteCode,
                    "atsignName": atsign.atsignName,
                    "atsignType": atsign.atsignType,
                    "premiumAtsignType": atsign.premiumHandleType,
                    "atsignCreatedOn": atsign.atsignCreatedOn,
                    "payAmount": atsign.payAmount
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
            const discountAmount = (((originalOrderAmount * 100) - orderAmount) / 100).toFixed(2);
            var data = {
                //name of the email template that we will be using
                templateName: discountAmount > 0 ? "purchase_receipt_withdiscount" : "purchase_receipt",
                receiver: doc.email,
                dynamicdata: {
                    "usd_amount": (promotionalCardDetails.promotionalCardAmount ? orderAmount - promotionalCardDetails.promotionalCardAmount : orderAmount) / 100,
                    "transaction_date": new Date(atsign.atsignCreatedOn).toLocaleString('default', { month: 'long' }) + ' ' + new Date(atsign.atsignCreatedOn).getDate() + ', ' + new Date(atsign.atsignCreatedOn).getFullYear(),
                    "cc_last_4digits": paymentMethod ? paymentMethod.toUpperCase() : 'Gift Card',
                    "receipt_number": completeOrderId,
                    "atsigns": atsignData,
                    "order_id": completeOrderId,
                    "discountAmount": discountAmount,
                    "giftAmount": promotionalCardDetails.promotionalCardAmount ? promotionalCardDetails.promotionalCardAmount / 100 : 0
                }
            };
            mail.sendEmailSendGrid(data);
        }
        else {
            var messageattr = {
                to: doc.contact,
                message: 'Your payment of $' + orderAmount / 100 + ' for order number #' + completeOrderId + ' is successful. \n\n Regards, \n The @ Company'
            };
            textMessage.sendTextMessage(messageattr);
        }
    }


    return ReserveAtsigns.findOneAndDelete({ userid: userid, atsignName: atsignName });
}

async function generateResponse(intent, userid, inviteCode, cartData, orderAmount, res, completeOrderId, transactionId) {
    try {
        // Generate a response based on the intent's status
        switch (intent.status) {
            case "requires_action":
            case "requires_source_action":
                // Card requires authentication
                intent.metadata = JSON.stringify(intent.metadata)
                const newAwaitedTransaction = await AwaitedTransaction.create({ intent, userid, inviteCode, cartData, orderAmount, completeOrderId })
                return {
                    requiresAction: true,
                    clientSecret: intent.client_secret,
                    transactionId: newAwaitedTransaction._id
                };
            case "requires_payment_method":
            case "requires_source":
                // for (let i = 0; i < cartData.length; i++) {
                // await saveTransaction(intent, userid, cartData, orderAmount);
                // }
                // Card was not properly authenticated, suggest a new payment method
                if (intent.promoCodeTransactionId && intent.promotionalCode) await GiftUpController.undoGiftCardRedemption(intent.promotionalCode, intent.promoCodeTransactionId)
                return {
                    error: "Your card was denied, please provide a new payment method"
                };
            case "succeeded":
                if (!intent || !userid) {
                    throw Error("Invalid Transaction Id")
                }
                // Payment is complete, authentication not required
                // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
                let payment_method = null, card = null, brand = null, last4 = null
                if (intent.payment_method) {
                    ({ payment_method } = intent);
                    ({ card: { brand, last4 } } = await stripe.paymentMethods.retrieve(payment_method));
                }

                await saveTransaction(intent, userid, cartData, orderAmount, completeOrderId, { promotionalCardAmount: intent.amountDebitedFromPromoCard, promotionalCode: intent.promotionalCode });
                let atsignData = [];
                let originalOrderAmount = cartData.reduce((acc, atsignDetails) => {
                    acc = acc + atsignDetails.originalAmount
                    return acc;
                }, 0)
                for (let i = 0; i < cartData.length; i++) {
                    cartData[i]['premiumHandleType'] = cartData[i]['premiumHandleType'] ? cartData[i]['premiumHandleType'] : (cartData[i]['payAmount'] && cartData[i]['payAmount'] > 0 ? 'paid' : 'free')
                    atsignData.push({
                        "atsign": cartData[i].atsignName,
                        "price": cartData[i].payAmount.toFixed(2),
                        "originalAmount": cartData[i].originalAmount,
                    })
                    if (i === 0) {
                        await saveAtsign(intent.payment_method ? `${brand} - ${last4}` : '', userid, inviteCode, cartData[i].atsignName, cartData[i].premiumHandleType, cartData[i].payAmount, i, cartData.length, orderAmount, originalOrderAmount, res, completeOrderId, atsignData, { promotionalCardAmount: intent.amountDebitedFromPromoCard, promotionalCode: intent.promotionalCode });
                    } else {
                        await saveAtsign(intent.payment_method ? `${brand} - ${last4}` : '', userid, inviteCode + '_' + i, cartData[i].atsignName, cartData[i].premiumHandleType, cartData[i].payAmount, i, cartData.length, orderAmount, originalOrderAmount, res, completeOrderId, atsignData, { promotionalCardAmount: intent.amountDebitedFromPromoCard, promotionalCode: intent.promotionalCode });
                    }
                }
                return { clientSecret: intent.client_secret };
        }
    } catch (error) {
        console.log(error);
        switch (error.type) {
            case 'StripeCardError':
                // A declined card error
                // err.message; // => e.g. "Your card's expiration year is invalid."
                if (intent.promoCodeTransactionId && intent.promotionalCode) await GiftUpController.undoGiftCardRedemption(intent.promotionalCode, intent.promoCodeTransactionId)
                return { error: error.message };

                break;
            // case 'StripeRateLimitError':
            //   // Too many requests made to the API too quickly
            //   break;
            // case 'StripeInvalidRequestError':
            //   // Invalid parameters were supplied to Stripe's API
            //   break; 
            // case 'StripeAPIError':
            //   // An error occurred internally with Stripe's API
            //   break;
            // case 'StripeConnectionError':
            //   // Some kind of error occurred during the HTTPS communication
            //   break;
            // case 'StripeAuthenticationError':
            //   // You probably used an incorrect API key
            //   break;
            default:
                // Handle any other types of unexpected errors
                return { error: error };
                break;
        }
    }
};
module.exports.getPromotinalCardValue = async function (req, res) {
    if (!req.body.promotionalCode) {
        return res.status(200).json({ status: 'error', message: 'Promotional code is required', data: '' });
    }
    try {
        const promocodeBalance = await GiftUpController.getPromotionalCardBalance(req.body.promotionalCode)
        return res.status(200).json({ status: 'success', message: '', data: promocodeBalance });

    } catch (error) {
        return res.status(200).json({ status: 'error', message: error.message, data: '' });

    }
}


async function stripePay(req, res, next) {
    let promoCodeTransactionId = '', promoCodeTransactionCode = '';
    try {
        const { paymentMethodId, paymentIntentId, transactionId, items, clientSecret, currency, useStripeSdk, cartData, inviteCode, promotionalCode } = req.body;
        const userid = req._id;
        //Check invite code/link
        let resp = null
        if (paymentIntentId && transactionId) {
            let transaction = await AwaitedTransaction.findOneAndDelete({ 'intent.id': paymentIntentId, userid: req._id, _id: transactionId })
            if (transaction) {
                let { intent, userid, inviteCode, cartData, orderAmount, completeOrderId } = transaction
                promoCodeTransactionId = intent.promoCodeTransactionId
                promoCodeTransactionCode = intent.promotionalCode
                let newIntent = await stripe.paymentIntents.confirm(paymentIntentId)
                newIntent['amountDebitedFromPromoCard'] = intent.amountDebitedFromPromoCard
                newIntent['promotionalCode'] = intent.promotionalCode
                newIntent['promoCodeTransactionId'] = intent.promoCodeTransactionId
                resp = await generateResponse(newIntent, userid, inviteCode, cartData, orderAmount, res, completeOrderId, transactionId);
            } else {
                return res.status(200).json({ status: 'error', message: messages.RETRY_STRIPE_TRANSACTION, data: {} });
            }

        } else {
            if (!inviteCode) return res.status(401).json({ status: 'error', message: messages.INVITE_LINK_EXPIRE, data: {} });
            const validLink = await checkValidInviteLink(userid, inviteCode, 'paid');
            if (!validLink) return res.status(401).json({ status: 'error', message: messages.INVITE_LINK_EXPIRE, data: {} });
            //Check empty cart
            if (!cartData || !cartData.length) return res.status(402).json({ status: 'error', message: messages.CART_EMPTY, data: '' });
            //Check Invalid atsign
            for (let i = 0; i < cartData.length; i++) {
                if (regexSpecialChars(cartData[i].atsignName)) {
                    return res.status(200).json({ status: 'error', message: messages.NO_SPL_CHAR, data: {} });
                }
            }
            //Check cart items
            const cartVerifiedDetails = await ReserveAtsigns.find({ userid: userid, atsignName: { $in: cartData.map(atsign => atsign.atsignName) } }).limit(cartData.length);
            if (cartVerifiedDetails.length < cartData.length) return res.status(401).json({ status: 'error', message: messages.SIGN_NOT_AVAILABLE, data: {} });
            for (let i = 0; i < cartVerifiedDetails.length; i++) {
                let atsign = cartVerifiedDetails[i]
                if (!atsign || !atsign.is_verified || !atsign.timer_started)
                    return res.status(401).json({ status: 'error', message: messages.SIGN_NOT_AVAILABLE, data: {} });
            }
            //Payment
            let discountedCartData = cartData, intent;
            discountedCartData = discountedCartData.map(data => {
                data.originalAmount = data.payAmount;
                return data;
            })
            const completeOrderId = generateOrderId()
            let cartAmount = await calculateOrderAmount(userid, cartData);
            let discountDetails = await CommissionController.getDiscountDetails(req._id, cartAmount, true)
            let amountDebitedFromPromoCard = 0;
            if (paymentMethodId || promotionalCode) {
                if (!discountDetails.finalOrderAmount) throw Error('Unable to calculate cart value')
                if (discountDetails.finalDiscountPercentage > 0) {
                    discountedCartData = cartData.map(data => {
                        data.payAmount = (data.payAmount - (data.payAmount * discountDetails.finalDiscountPercentage * 0.01))
                        return data
                    })
                }
                promoCodeTransactionCode = promotionalCode
                try {
                    let promotionalCardAmount = promotionalCode ? await GiftUpController.getPromotionalCardBalance(promotionalCode, true) : 0;
                    if (promotionalCode && promotionalCardAmount > 0 && discountDetails.finalOrderAmount) {
                        ({ amountDebited: amountDebitedFromPromoCard, promoCodeTransactionId } = await GiftUpController.redeemPromotionalCard(promotionalCode, discountDetails.finalOrderAmount, completeOrderId))
                    }
                } catch (error) {
                    return res.status(200).json({ status: "error", message: error.message })
                }
                if (discountDetails.finalOrderAmount > amountDebitedFromPromoCard) {
                    let metaDataForStripe = {}, descriptionForStripe = {};
                    for (let i = 0; i < discountedCartData.length; i++) {
                        if (i < 50) {
                            metaDataForStripe[(i + 1) + '. Details: '] = '@sign: ' + discountedCartData[i]['atsignName'] + ', Type: ' + discountedCartData[i]['premiumHandleType'] + ', Amount: ' + (discountedCartData[i]['payAmount']);
                        } else {
                            descriptionForStripe[(i + 1)] = '@:' + discountedCartData[i]['atsignName'] + ',T:' + discountedCartData[i]['premiumHandleType'] + ',$:' + discountedCartData[i]['payAmount'];
                        }
                    }
                    if (amountDebitedFromPromoCard) {
                        if (discountedCartData.length > 49) {
                            descriptionForStripe[discountedCartData.length + 1] = "Gift card value:" + amountDebitedFromPromoCard / 100
                        } else {
                            metaDataForStripe[discountedCartData.length + 1] = "Gift card value:" + amountDebitedFromPromoCard / 100
                        }

                    }
                    let paymentIntentStripe = {
                        amount: discountDetails.finalOrderAmount - amountDebitedFromPromoCard,
                        currency: currency,
                        payment_method: paymentMethodId,
                        confirmation_method: "manual",
                        confirm: true,
                        metadata: metaDataForStripe,
                        use_stripe_sdk: useStripeSdk,
                    };
                    let descriptionForStripeString = JSON.stringify(descriptionForStripe);
                    if (descriptionForStripeString != '{}') {
                        paymentIntentStripe['description'] = descriptionForStripeString;
                    }
                    intent = await stripe.paymentIntents.create(paymentIntentStripe);

                } else {
                    intent = {
                        status: 'succeeded',
                    }
                }
            } else {
                return res.status(200).json({ status: 'error', message: messages.NO_PAYMENT_METHOD, data: {} });
            }

            if (promotionalCode) {
                intent['amountDebitedFromPromoCard'] = amountDebitedFromPromoCard;
                intent['promotionalCode'] = promotionalCode;
                intent['promoCodeTransactionId'] = promoCodeTransactionId;
            }
            resp = await generateResponse(intent, userid, inviteCode, discountedCartData, discountDetails.finalOrderAmount, res, completeOrderId);
            let a = await CommissionController.checkAndProvideCommission(userid, {
                amount: cartAmount,
                currency: currency,
                cartData: discountedCartData,
                completeOrderId
            }, true)
        }
        if (!res.headersSent) res.send(resp);
    } catch (e) {
        if (promoCodeTransactionCode && promoCodeTransactionId) await GiftUpController.undoGiftCardRedemption(promoCodeTransactionCode, promoCodeTransactionId)
        if (e.type == 'StripeCardError') {
            res.status(200).json({ status: "error", message: e.message, error: e.message })
        } else {
            logError(e, req, res);
        }
    }
}

exports.stripePay = stripePay;


module.exports.checkUserPaid = async (req, res, next) => {
    let userId = req._id;
    let atSignName = req.query.atSignName;
    try {
        let doc1 = await transactions.collection.findOne({ userId, $or: [{ 'atsignName.atsignName': { $regex: atSignName } }, { 'atsignName': { $regex: atSignName } }] })
        //@todo 
        if (doc1 && doc1.status === "succeeded") {
            return res.status(200).json({ status: 'success', message: 'paid' });
        } else {
            return res.status(200).json({ status: 'success', message: 'not paid' });
        }

    }
    catch (err) {
        logError(err, req, res);
    }
}
module.exports.checkLoggedInUser = (req, res, next) => {
    User.findOne({ _id: ObjectId(req._id) }, async (err, doc) => {
        if (err) {
            logError(err, req);
            return res.status(200).json({ status: 'error', message: messages.SOMETHING_WRONG_RETRY, data: '' });
        }
        else {
            let inviteCode = "";
            let inviteLink = "";
            let reservedsign = await ReserveAtsigns.find({ "userid": req._id, "timer_started": true });
            if (doc.atsignDetails.length > 0) {
                for (let i = 0; i < doc.atsignDetails.length; i++) {
                    if ((reservedsign && reservedsign.length > 0) || !doc.atsignDetails[i].atsignName) {
                        inviteCode = doc.atsignDetails[i].inviteCode;
                    }
                }
            }
            for (let i = 0; i < reservedsign.length; i++) {
                let diff = findTimeDiffSec(reservedsign[i].timestamp);
                if (diff < defaultTimeLeft && diff > 0) {
                    if (reservedsign[i].atsignType === 'free') {
                        inviteLink = '/standard-sign' + '/' + inviteCode;
                    } else {
                        inviteLink = '/premium-sign' + '/' + inviteCode;
                    }
                }
            }
            if (inviteCode) {
                return res.status(200).json({ status: 'success', message: '', data: inviteLink });
            } else {
                return res.status(200).json({ status: 'error', message: '', data: '' });
            }
        }
    });
}

module.exports.getUserPaymentDetails = async function (req, res) {
    try {
        if (req._id) {
            const userTrasactions = await Transaction.find({ userId: req._id })
            return res.status(200).json({ status: 'success', message: '', data: userTrasactions });
        } else {
            return res.status(200).json({ status: 'error', message: messages.UNAUTH, data: '' });
        }
    } catch (error) {
        logError(error)
        return res.status(200).json({ status: 'error', message: messages.SOMETHING_WRONG_RETRY, data: '' });
    }
}

async function paymentAmountToStripe(paymentMethodId, paymentIntentId, amount, useStripeSdk, { metaDataForStripe, descriptionForStripe }) {
    try {
        let intent = null;
        if (paymentIntentId) {
            intent = await stripe.paymentIntents.confirm(paymentIntentId)
        } else if (paymentMethodId) {
            let paymentIntentStripe = {
                amount: amount,
                currency: 'USD',
                payment_method: paymentMethodId,
                confirmation_method: "manual",
                confirm: true,
                metadata: metaDataForStripe,
                use_stripe_sdk: useStripeSdk,
            };
            let descriptionForStripeString = JSON.stringify(descriptionForStripe);
            if(descriptionForStripeString.length>1000)
            {
                descriptionForStripeString = descriptionForStripeString.replace(/\"/g,'');
            }
            if (descriptionForStripeString != '{}') paymentIntentStripe['description'] = descriptionForStripeString;
            intent = await stripe.paymentIntents.create(paymentIntentStripe);
        } else {
            return { error: { type: 'error', message: 'Invalid Paymnet Details' } }
        }
        switch (intent.status) {
            case "requires_action":
            case "requires_source_action":
                return { value: { status: 'pending', data: { requiresAction: true, clientSecret: intent.client_secret } } };
            case "requires_payment_method":
            case "requires_source":
                return { error: { type: 'info', message: "Your card was denied, please provide a new payment method" } };
            case "succeeded":
                if (!intent) return { error: { type: 'error', message: 'Inavlid Details' } }
                let payment_method = null, card = null, brand = null, last4 = null
                if (intent.payment_method) {
                    ({ payment_method } = intent);
                    ({ card: { brand, last4 } } = await stripe.paymentMethods.retrieve(payment_method));
                }
                return { value: { status: 'success', data: { clientSecret: intent.client_secret, payment_method, brand, last4, intent } } }
        }
        return { error: { type: 'info', message: 'Invalid Details' } }
    } catch (error) {
        if (error.type == 'StripeCardError') {
            return { error: { type: "info", message: error.message } }
        } else {
            return { error: { type: "error", message: error.message, data: { stack: error.stack, message: error.message } } }
        }
    }
}

async function renewalAtsignsPayment(req, res) {
    try {
        const { paymentMethodId, paymentIntentId, useStripeSdk, renewalAtsigns } = req.body, userId = req._id;
        const user = await UserController.getUserById(userId);
        if (!user.value) { res.status(200).json({ status: 'error', message: message.SOMETHING_WRONG_RETRY }) }
        // const renewalAtsigns = ['sdf231qsad'];
        const checkAtsignsValidatyPromise = await Promise.all(renewalAtsigns.map(async atsign =>
            AtsignDetailController.checkAtsignIsPayable(atsign)
        ))
        for (let i = 0; i < checkAtsignsValidatyPromise.length; i++) {
            if (!checkAtsignsValidatyPromise[i].value || !checkAtsignsValidatyPromise[i].value.status) return res.send({ status: 'error', message: 'Payment not allowed', data: renewalAtsigns[i] })
        }

        let metaDataForStripe = {}, descriptionForStripe = {};
        for (let i = 0; i < renewalAtsigns.length; i++) {
            if (i < 50) {
                metaDataForStripe[(i + 1) + '. Details: '] = '@: ' + renewalAtsigns[i] + ', Reason: Renew, $: 10';
            } else {
                descriptionForStripe[(i + 1)] = 'R:@' + renewalAtsigns[i];
            }
        }
        let { error, value } = await paymentAmountToStripe(paymentMethodId, paymentIntentId, renewalAtsigns.length * 1000, useStripeSdk, { metaDataForStripe, descriptionForStripe })
        if (error) {
            if (error.type == 'info') {
                res.status(200).json({ status: 'error', message: error.message })
            } else {
                logError(error.data, req)
                res.status(200).send({ status: 'error', message: messages.SOMETHING_WRONG_RETRY });
            }
        } else {
            if (value.status == 'success') {
                const completeOrderId = generateOrderId()
                let transactionData = renewalAtsigns.map(atsign => { return { atsignName: atsign, payAmount: 10 } })
                let a = await saveTransaction(value.data.intent, userId, transactionData, renewalAtsigns.length * 10 * 100, completeOrderId, { promotionalCardAmount: null, promotionalCode: null },'RENEWAL_ATSIGN');
                const payAtsignsRenewalPromise = await Promise.all(renewalAtsigns.map(async atsign =>
                    AtsignDetailController.payAtsignRenewalFees(atsign, 10)
                ))
                payAtsignsRenewalPromise.forEach(atsign => {
                    if (atsign.error && atsign.error.type == 'error') {
                        logError(atsign.error.data)
                    }
                })

                mail.sendEmailSendGrid({
                    templateName: "renewal_receipt",
                    receiver: user.value.email,
                    dynamicdata: {
                        "usd_amount": renewalAtsigns.length * 10,
                        "transaction_date": new Date().toLocaleString('default', { month: 'long' }) + ' ' + new Date().getDate() + ', ' + new Date().getFullYear(),
                        "cc_last_4digits": value.data.payment_method ? `${value.data.brand} - ${value.data.last4}` : '',
                        "receipt_number": completeOrderId,
                        "atsigns": renewalAtsigns.map(atsign => {
                            return {
                                "atsign": atsign,
                                "price": 10.00,
                                "originalAmount": 10.00,
                            }
                        }),
                        "order_id": completeOrderId,
                        "discountAmount": 0,
                        "giftAmount": 0
                    }
                });
                res.send(value.data)
            } else {
                res.send(value.data)
            }
        }
    } catch (e) {
        if (e.type == 'StripeCardError') {
            res.status(200).json({ status: "error", message: e.message, error: e.message })
        } else {
            logError(e, req, res);
        }
    }
}

module.exports.renewalAtsignsPayment = renewalAtsignsPayment