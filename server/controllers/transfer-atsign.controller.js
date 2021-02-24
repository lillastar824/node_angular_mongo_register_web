const moment = require('moment');
const logError = require('../config/handleError');
const { messages, CONSTANTS } = require('./../config/const');
const mail = require('./../config/mailer');

const TransferAtsignService = require('./../services/transfer-atsign.service')
const UserController = require('./user.controller')
const AtsignDetailsController = require('./atsign-detail.controller')
const PaymentController = require('./payment.controller')
const CommissionController = require('./commission.controller')
const { generateOrderId } = require('../config/UtilityFunctions')
const TRANSFER_AMOUNT = 50;
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// ---------------------- Private Function --------------------
const transferAtsignInitialization = async function (atsign, ownerId, newOwnerId, transferredBy, transferPrice = 0) {
    if (ownerId == newOwnerId) return { error: { type: 'info', message: messages.SELF_TRANSFER_NOT_ALLOWED } }
    const userPromise = await Promise.all([UserController.getUserById(ownerId), UserController.getUserById(newOwnerId)])
    const error = userPromise[0].error || userPromise[1].error
    if (error) {
        return { error: error }
    } else {
        let ownerData = userPromise[0].value
        const newOwnerData = userPromise[1].value
        if (!ownerData || !newOwnerData) {
            return { error: { type: 'info', message: 'Invalid user id' } }
        }
        if (newOwnerData.userRole.toLowerCase() !== 'user') {
            return { error: { type: 'info', message: "Oops, You can't transfer an @sign to this person" } }
        }
        if (ownerData.userRole.toLowerCase() == 'admin') {
            const atsignOwner = await UserController.getUserByAtsign(atsign)
            if(atsignOwner && atsignOwner._id){
                ownerData = atsignOwner
                ownerId = atsignOwner._id.toString()
                if (ownerId == newOwnerId) return { error: { type: 'info', message: messages.SELF_TRANSFER_NOT_ALLOWED } }
            }else{
                return { error: { type: 'info', message: "Oops, You can't transfer an @sign to this person" } }
            }
        }
        let ownerAtsignCount = 0, transferAtsignObj = null;
        ownerData.atsignDetails.forEach(atsignDetail => {
            if (atsignDetail.atsignName && atsignDetail.atsignCreatedOn) {
                ownerAtsignCount++
            }
            if (atsignDetail.atsignName == atsign) {
                transferAtsignObj = atsignDetail
            }
        })
        if (ownerAtsignCount < CONSTANTS.MIN_NO_OF_ATSIGN_REQUIRED_TO_TRANSFER)
            return { error: { type: 'info', message: messages.MIN_ATSIGN_REQ_TO_TRANS } }
        if (!(transferAtsignObj && transferAtsignObj.atsignName && transferAtsignObj.atsignType && transferAtsignObj.atsignCreatedOn)){
            return { error: { type: 'info', message: 'Oops, this is not a valid @sign to transfer.' } }
        }

        //Will allow in future
        const transferObjCompleteDetails = await AtsignDetailsController.getAtsignDetails(transferAtsignObj.atsignName)
        if (transferObjCompleteDetails.error) return { error: transferObjCompleteDetails.error }
        if (!transferObjCompleteDetails.value) return { error: { type: 'info', message: 'Oops, this is not a valid @sign to transfer.' } }
        if (transferObjCompleteDetails.value.atsignType.toLowerCase() == 'free') return { error: { type: 'info', message: "Oops, currently you can't transfer free @sign." } }

        if (!moment(transferObjCompleteDetails.value.lastPaymentValidTill).isAfter(new Date(), 'day')) {
            return { error: { type: 'info', message: "Oops, @sign is about to expire you can't transfer it." } }
        }

        const isCommertialAtsign = await CommissionController.isCommercialAtsign(transferAtsignObj.atsignName)
        if (isCommertialAtsign && isCommertialAtsign.value === true) return { error: { type: 'info', message: "Oops, currently you can't transfer this @sign." } }

        // if (moment(transferAtsignObj.atsignCreatedOn).isAfter(CONSTANTS.ATSIGN_TRANSFER_AFTER_DATE, 'day')) {
        //     return { error: { type: 'info', message: messages.ATSIGN_TRANSFER_AFTER_DATE_ERROR } }
        // }
        if (transferAtsignObj.isActivated) {
            return { error: { type: 'info', message: 'Please reset your @sign before transferring.' } }
        }

        let transferAtsign = await TransferAtsignService.addTransfterAtsign(atsign, ownerId, newOwnerId, transferAtsignObj.atsignType, transferAtsignObj.payAmount || 0, transferPrice, transferAtsignObj, 'PENDING', transferredBy)
        if (transferAtsign.error) return { error: transferAtsign.error }
        transferAtsignObj['transferId'] = transferAtsign.value._id
        let removeAtsign = await UserController.removeAtsignFromUser(ownerId, atsign)
        await AtsignDetailsController.initializeAtsignTransfer(ownerId, atsign, transferAtsign.value._id)
        if (removeAtsign.error) return { error: removeAtsign.error }
        mail.sendEmailSendGrid({
            templateName: "transfer_email",
            receiver: newOwnerData.email,
            dynamicdata: {
                email: ownerData.email,
                atsign: atsign
            }
        });
        return { value: transferAtsignObj['transferId'] };
    }
}
const completePendingTransferAtsign = async function (approvedBy, atsignTransferId, reqBody) {
    try {
        let approvedByObj = await UserController.getUserById(approvedBy);
        if (approvedByObj.error) return { error: approvedByObj.error }

        let transferAtsignObj = await TransferAtsignService.getTransferAtsignListById(atsignTransferId);
        if (transferAtsignObj.error) return { error: transferAtsignObj.error }

        if (!transferAtsignObj.value || !approvedByObj.value) return { error: { type: 'info', message: 'Oops, this transfer request is expired.' } }
        if (approvedByObj.value._id.toString() != transferAtsignObj.value.newOwnerId.toString()) {
            return { error: { type: 'info', message: messages.UNAUTH } }
        }
        transferAtsignObj.value.transferredObject['transferId'] = atsignTransferId

        // (transferAtsignObj.value.transferredObject.atsignType && transferAtsignObj.value.transferredObject.atsignType.toLowerCase() == 'free')

        if (moment(transferAtsignObj.value.transferredObject.atsignCreatedOn).isAfter(CONSTANTS.ATSIGN_TRANSFER_AFTER_DATE, 'day')) {
            let { paymentMethodId, paymentIntentId, useStripeSdk } = reqBody
            if (!paymentMethodId && !paymentIntentId) return { error: { type: 'info', message: "Payment Details Missing" } }
            let metaDataForStripe = {
                '1. Details: ': `@: ${transferAtsignObj.value.atsign} , Reason: Transfer, $: ${TRANSFER_AMOUNT}, TransferId: ${atsignTransferId}`
            }, descriptionForStripe = {};

            let { error, value } = await PaymentController.paymentAmountToStripe(paymentMethodId, paymentIntentId, TRANSFER_AMOUNT * 100, useStripeSdk, { metaDataForStripe, descriptionForStripe })
            if (error) {
                return { error }
            } else {
                if (value.status == 'success') {
                    const completeOrderId = generateOrderId()
                    let transactionData = [{ atsignName: transferAtsignObj.value.atsign, payAmount: TRANSFER_AMOUNT }]
                    await PaymentController.saveTransaction(value.data.intent, approvedBy, transactionData, TRANSFER_AMOUNT * 100, completeOrderId, { promotionalCardAmount: null, promotionalCode: null }, 'TRANSFER_ATSIGN');
                    mail.sendEmailSendGrid({
                        templateName: "transfer_receipt",
                        receiver: approvedByObj.value.email,
                        dynamicdata: {
                            "usd_amount": TRANSFER_AMOUNT,
                            "transaction_date": new Date().toLocaleString('default', { month: 'long' }) + ' ' + new Date().getDate() + ', ' + new Date().getFullYear(),
                            "cc_last_4digits": value.data.payment_method ? `${value.data.brand} - ${value.data.last4}` : '',
                            "receipt_number": completeOrderId,
                            "atsigns": [{
                                "atsign": transferAtsignObj.value.atsign,
                                "price": TRANSFER_AMOUNT * 1.00,
                                "originalAmount": TRANSFER_AMOUNT * 1.00,
                            }],
                            "order_id": completeOrderId,
                        }
                    });

                } else {
                    return { value: value.data }
                }
            }
        }
        let atsignTransfer = await AtsignDetailsController.completeAtsignTransfer(transferAtsignObj.value.oldOwnerId.toString(), approvedBy, transferAtsignObj.value.atsign, atsignTransferId)
        if (atsignTransfer.error) {
            return { error: atsignTransfer.error }
        }
        let addAtsign = await UserController.addAtsignToUser(transferAtsignObj.value.newOwnerId, transferAtsignObj.value.transferredObject)
        if (addAtsign.error) {
            return { error: addAtsign.error }
        } else {
            await TransferAtsignService.updateTransferStatus(atsignTransferId, 'COMPLETED', approvedBy)

            let oldOwnerIdData = await UserController.getUserById(transferAtsignObj.value.oldOwnerId)
            mail.sendEmailSendGrid({
                templateName: "transfer_accepted",
                receiver: oldOwnerIdData.value.email,
                dynamicdata: {
                    atsign: transferAtsignObj.value.atsign,
                    email: approvedByObj.value.email
                }
            });
            mail.sendEmailSendGrid({
                templateName: "atsign_transfer",
                receiver: approvedByObj.value.email,
                dynamicdata: {
                    atsign: transferAtsignObj.value.atsign,
                    email: oldOwnerIdData.value.email
                }
            });

            return { value: { data: atsignTransferId } }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}
const rejectTransferAtsign = async function (rejectedBy, atsignTransferId) {
    try {

        let transferAtsignObj = await TransferAtsignService.getTransferAtsignListById(atsignTransferId);
        if (transferAtsignObj.error) return { error: transferAtsignObj.error }

        if (!transferAtsignObj.value || !rejectedBy) return { error: { type: 'info', message: 'Oops, this transfer request is expired.' } }
        if (rejectedBy != transferAtsignObj.value.newOwnerId.toString()) {
            return { error: { type: 'info', message: messages.UNAUTH } }
        }
        let cancelAtsignTransfer = await AtsignDetailsController.cancelAtsignTransfer(transferAtsignObj.value.atsign, atsignTransferId)
        if (cancelAtsignTransfer.error) {
            return { error: cancelAtsignTransfer.error }
        }
        const { error, value } = await UserController.addAtsignToUser(transferAtsignObj.value.oldOwnerId, transferAtsignObj.value.transferredObject)
        if (error) return { error }
        await TransferAtsignService.updateTransferStatus(atsignTransferId, 'REJECTED', rejectedBy)

        let newOwnerIdData = await UserController.getUserById(transferAtsignObj.value.newOwnerId)

        mail.sendEmailSendGrid({
            templateName: "transfer_rejected",
            receiver: value.email,
            dynamicdata: {
                atsign: transferAtsignObj.value.atsign,
                email: newOwnerIdData.value.email
            }
        });
        // await AtsignDetailsController.updateAtsignStatus(ownerId, atsign,"ACTIVE")
        return { value: atsignTransferId }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}

const cancelTransferAtsign = async function (cancelledBy, atsignTransferId) {
    try {

        let transferAtsignObj = await TransferAtsignService.getTransferAtsignListById(atsignTransferId);
        if (transferAtsignObj.error) return { error: transferAtsignObj.error }

        if (!transferAtsignObj.value || !cancelledBy) return { error: { type: 'info', message: 'Oops, this transfer request is expired.' } }
        if (!((transferAtsignObj.value.oldOwnerId && cancelledBy == transferAtsignObj.value.oldOwnerId.toString()) || (transferAtsignObj.value.transferredBy && cancelledBy == transferAtsignObj.value.transferredBy.toString()))) {
            return { error: { type: 'info', message: messages.UNAUTH } }
        }
        let cancelAtsignTransfer = await AtsignDetailsController.cancelAtsignTransfer(transferAtsignObj.value.atsign, atsignTransferId)
        if (cancelAtsignTransfer.error) {
            return { error: cancelAtsignTransfer.error }
        }
        const { error, value } = await UserController.addAtsignToUser(transferAtsignObj.value.oldOwnerId, transferAtsignObj.value.transferredObject)
        if (error) return { error }
        await TransferAtsignService.updateTransferStatus(atsignTransferId, 'CANCELLED', cancelledBy)
        let newOwnerIdData = await UserController.getUserById(transferAtsignObj.value.newOwnerId)
        mail.sendEmailSendGrid({
            templateName: "transfer_cancelledbyowner_emailto_recipient",
            receiver: newOwnerIdData.value.email,
            dynamicdata: {
                atsign: transferAtsignObj.value.atsign,
                email: value.email
            }
        });
        return { value: atsignTransferId }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}

const expireTransferAtsign = async function (atsignTransferId) {
    try {
        let transferAtsignObj = await TransferAtsignService.getTransferAtsignListById(atsignTransferId);
        if (transferAtsignObj.error) return { error: transferAtsignObj.error }

        let expireAtsignTransfer = await AtsignDetailsController.cancelAtsignTransfer(transferAtsignObj.value.atsign, atsignTransferId)
        if (expireAtsignTransfer.error) {
            return { error: expireAtsignTransfer.error }
        }
        const { error, value } = await UserController.addAtsignToUser(transferAtsignObj.value.oldOwnerId, transferAtsignObj.value.transferredObject)
        if (error) return { error }
        await TransferAtsignService.updateTransferStatus(atsignTransferId, 'EXPIRED', '')
        let newOwnerIdData = await UserController.getUserById(transferAtsignObj.value.newOwnerId)
        mail.sendEmailSendGrid({
            templateName: "transfer_expired_recipient",
            receiver: newOwnerIdData.value.email,
            dynamicdata: {
                atsign: transferAtsignObj.value.atsign,
                email: value.email
            }
        });
        mail.sendEmailSendGrid({
            templateName: "transfer_expired_owner",
            receiver: value.email,
            dynamicdata: {
                atsign: transferAtsignObj.value.atsign,
                email: newOwnerIdData.value.email
            }
        });
        return { value: atsignTransferId }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}
const resendTransferNotifcation = async function (userId, atsignTransferId) {
    try {
        let transferAtsignObj = await TransferAtsignService.getTransferAtsignListById(atsignTransferId);
        if (transferAtsignObj.error) return { error: transferAtsignObj.error }

        if (!transferAtsignObj.value) return { error: { type: 'info', message: 'Oops, this transfer request is expired.' } }

        if ((transferAtsignObj.value.oldOwnerId && userId != transferAtsignObj.value.oldOwnerId.toString()) || (transferAtsignObj.value.transferredBy && userId != transferAtsignObj.value.transferredBy.toString())) {
            return { error: { type: 'info', message: messages.UNAUTH } }
        }
        await TransferAtsignService.addHistory(atsignTransferId,{date:new Date(),action:'TRANSFER_MAIL_RESEND'});
        let newOwnerIdData = await UserController.getUserById(transferAtsignObj.value.newOwnerId)
        mail.sendEmailSendGrid({
            templateName: "transfer_email_reminder",
            receiver: newOwnerIdData.value.email,
            dynamicdata: {
                atsign: transferAtsignObj.value.atsign
            }
        });
        return { value: atsignTransferId }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}

const expireAtsignScriptByBatch = async function (scriptType, pageNo, limit, filter) {
    let results = await TransferAtsignService.findAtsignForScript(filter, (pageNo - 1) * limit, limit)
    if (results.value.length) {
        if (scriptType == '60_DAY_EXPIRE') {
            await Promise.all(results.value.map(async transferAtsign => {
                return await expireTransferAtsign(transferAtsign._id.toString())
            }))
        } else if (scriptType == '30_DAY_REMINDER' || scriptType == '59_DAY_REMINDER') {
            await Promise.all(results.value.map(async transferAtsign => {
                if (transferAtsign.newOwnerId) {
                    let userDetails = await UserController.getUserById(transferAtsign.newOwnerId)
                    if (userDetails.value && userDetails.value.email) {
                        mail.sendEmailSendGrid({
                            templateName: scriptType == '30_DAY_REMINDER' ? "transfer_reminder_30" : 'transfer_reminder_1',
                            receiver: userDetails.value.email,
                            dynamicdata: {
                                email: userDetails.value.email,
                                atsign: transferAtsign.atsign
                            }
                        });
                    }
                }
                return transferAtsign._id
            }))
        }

    }
    return { value: { isNext: results.value && results.value.length === limit ? true : false } }
}
const expireAtsignScript = async function (scriptType = '60_DAY_EXPIRE') {
    let transferBeforeDays = 0
    if (scriptType == '30_DAY_REMINDER') transferBeforeDays = 30;
    else if (scriptType == '59_DAY_REMINDER') transferBeforeDays = 59;
    else if (scriptType == '60_DAY_EXPIRE') transferBeforeDays = 60;
    else throw Error('Invalid script')
    let pageNo = 1, limit = 10, batchResult = null, filter = {
        createdAt: {
            "$gte": moment().utc().hours(0).minutes(0).seconds(0).milliseconds(0).subtract(transferBeforeDays, 'days').toDate(),
            "$lt": moment().utc().hours(0).minutes(0).seconds(0).milliseconds(0).subtract(transferBeforeDays, 'days').add((0 + 1), 'days').toDate()
        },
        status: 'PENDING'
    }
    batchResult = await expireAtsignScriptByBatch(scriptType, pageNo, limit, filter);
    while (batchResult && batchResult.value && batchResult.value.isNext) {
        pageNo = pageNo + 1;
        batchResult = await expireAtsignScriptByBatch(scriptType, pageNo, limit, filter);
    }
}

// ---------------------- Admin Function --------------------

const getAllTransferAtsigns = async function (filter, sortBy, pageNo, limit) {
    try {
        const allTransferAtsign = await Promise.all([TransferAtsignService.getAllTransferAtsigns(filter, sortBy, pageNo, limit), TransferAtsignService.countAllTransferAtsigns(filter)])
        let error = allTransferAtsign[0].error || allTransferAtsign[1].error
        if (error) {
            return { error }
        }
        else {
            let value = allTransferAtsign[0].value
            await Promise.all(value.map(async data => {
                const newUser = await UserController.getUserById(data.newOwnerId)
                const oldUser = await UserController.getUserById(data.oldOwnerId)
                data.newOwnerEmail = newUser.value ? newUser.value.email : ''
                data.oldOwnerEmail = oldUser.value ? oldUser.value.email : ''
                return data;
            }))
            return { value: { records: value, total: allTransferAtsign[1].value, pageNo, limit } }
        }

    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}

// ---------------------- Routes Function --------------------

const transferAtsign = async function (req, res) {
    let userId = req._id;
    if (!req.body.email || !req.body.atsign) return res.status(200).json({ status: "error", message: messages.INVALID_REQ_BODY })
    if (!EMAIL_REGEX.test(req.body.email)) return res.status(200).json({ status: "error", message: messages.ENTER_VALID_MAIL })
    let transferToUser = await UserController.getUserByEmail(req.body.email);
    if (transferToUser.error) {
        if (transferToUser.error.type == 'info') {
            return res.status(200).json({ status: "error", message: transferToUser.error.message })
        } else {
            logError(transferToUser.error.data, req)
            return res.status(200).json({ status: "error", message: messages.SOMETHING_WRONG_RETRY })
        }
    }

    if (!transferToUser.value) return res.status(200).json({ status: "error", message: messages.INVALID_EMAIL_PHONE, showInvite: true })
    if (transferToUser.value.userStatus != 'Active') return res.status(200).json({ status: "error", message: messages.USER_NOT_ACTIVE })

    let { error, value } = await transferAtsignInitialization(req.body.atsign, userId, transferToUser.value._id, userId)
    if (error) {
        if (error.type == 'info') {
            return res.status(200).json({ status: "error", message: error.message })
        } else {
            logError(error.data, req)
            return res.status(200).json({ status: "error", message: messages.SOMETHING_WRONG_RETRY })
        }
    } else {
        return res.status(200).json({ status: "success", message: messages.TRANSFER_SENT, data: { transferId: value } })
    }
}

const updateTransferAtsign = async function (req, res) {
    if (req.body.status && ['APPROVED', 'REJECTED', 'CANCELLED'].indexOf(req.body.status) != -1 && req.params.transferId) {
        let error, value;
        switch (req.body.status) {
            case 'APPROVED':
                ({ error, value } = await completePendingTransferAtsign(req._id, req.params.transferId, req.body)); break;
            case 'REJECTED':
                ({ error, value } = await rejectTransferAtsign(req._id, req.params.transferId)); break;
            case 'CANCELLED':
                ({ error, value } = await cancelTransferAtsign(req._id, req.params.transferId)); break;
        }
        if (error) {
            if (error.type == 'info') {
                return res.status(200).json({ status: "error", message: error.message })
            } else {
                logError(error.data, req)
                return res.status(200).json({ status: "error", message: messages.SOMETHING_WRONG_RETRY })
            }
        } else {
            if (req.body.status == 'APPROVED') return res.send({ status: 'success', ...value })
            return res.send({ status: 'success', data: value })
        }
    } else {
        res.send({ status: 'error', message: messages.INVALID_REQ_BODY })
    }
}
const resendTransferNotifcationRoute = async function (req, res) {
    const { error, value } = await resendTransferNotifcation(req._id, req.params.transferId)
    if (error) {
        if (error.type == 'info') {
            return res.status(200).json({ status: "error", message: error.message })
        } else {
            logError(error.data, req)
            return res.status(200).json({ status: "error", message: messages.SOMETHING_WRONG_RETRY })
        }
    } else {
        res.send({ status: 'success', message: messages.SENT_SUCCESS })
    }
}

const getTransferAtsignOfUser = async function (req, res) {
    try {
        let oldOwnerId = req._id;
        let pageNo = req.query.pageNo && Number(req.query.pageNo) > 0 ? Number(req.query.pageNo) : 1
        let limit = req.query.limit && Number(req.query.limit) > 0 ? Number(req.query.limit) : 1000
        let filter = req.query.searchTerm ? { atsign: { '$regex': `^${req.query.searchTerm}`, '$options': 'i' } } : null
        let sortBy = req.query.sortBy ? { [req.query.sortBy]: req.query.sortOrder == 'desc' ? -1 : 1 } : null

        const allTransferAtsign = await Promise.all([TransferAtsignService.getTransferAtsignOfUser(oldOwnerId, filter, sortBy, pageNo, limit), TransferAtsignService.countTransferAtsignOfUser(oldOwnerId, filter)])
        let error = allTransferAtsign[0].error || allTransferAtsign[1].error
        if (error) {
            if (error.type === 'info') {
                return res.send({ status: 'error', message: error.message })
            } else {
                logError(error.data)
                return res.send({ status: 'error', message: messages.SOMETHING_WRONG_RETRY })
            }
        }
        else {
            let value = allTransferAtsign[0].value
            await Promise.all(value.map(async data => {
                const user = await Promise.all([UserController.getUserById(data.newOwnerId), UserController.getUserById(data.oldOwnerId)])
                data.newOwnerEmail = user[0].value ? user[0].value.email : ''
                data.oldOwnerEmail = user[1].value ? user[1].value.email : ''
                return data;
            }))
            return res.status(200).json({ status: 'success', message: messages.SUCCESSFULLY, data: { records: value, total: allTransferAtsign[1].value, pageNo, limit } })
        }
    } catch (error) {
        logError(error)
        return res.send({ status: 'error', message: messages.SOMETHING_WRONG_RETRY })
    }
}

const changeAtsignTransferTime = async function (atsign, date) {
    const { error, value } = await TransferAtsignService.changeAtsignTransferTime(atsign, date);
    if (error) {
        if (error.type === 'info') {
            return ({ status: 'error', message: error.message })
        } else {
            logError(error.data)
            return ({ status: 'error', message: messages.SOMETHING_WRONG_RETRY })
        }
    }
    else {
        return ({ status: 'success', message: messages.SUCCESSFULLY })
    }
}

module.exports = {
    transferAtsign,
    updateTransferAtsign,
    getTransferAtsignOfUser,
    getAllTransferAtsigns,
    transferAtsignInitialization,
    expireAtsignScript,
    changeAtsignTransferTime,
    resendTransferNotifcationRoute
}
