const moment = require('moment');
const logError = require('../config/handleError');
const { messages, CONSTANTS } = require('./../config/const');
const mail = require('./../config/mailer');

const TransferAtsignService = require('./../services/transfer-atsign.service')
const UserController = require('./user.controller')
const AtsignDetailsController = require('./atsign-detail.controller')

// ---------------------- Private Function --------------------
const transferAtsignInitialization = async function (atsign, ownerId, newOwnerId, transferedBy, transferPrice = 0) {
    if (ownerId == newOwnerId) return { error: { type: 'info', message: messages.SELF_TRANSFER_NOT_ALLOWED } }
    const userPromise = await Promise.all([UserController.getUserById(ownerId), UserController.getUserById(newOwnerId)])
    const error = userPromise[0].error || userPromise[1].error
    if (error) {
        return { error: error }
    } else {
        const ownerData = userPromise[0].value
        const newOwnerData = userPromise[1].value
        if (!ownerData || !newOwnerData) {
            return { error: { type: 'info', message: 'Invalid user id' } }
        }
        if (newOwnerData.userRole.toLowerCase() !== 'user') {
            return { error: { type: 'info', message: "Can't transfer to admin" } }
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
        if (!transferAtsignObj)
            return { error: { type: 'info', message: 'Invalid atsign to transfer' } }
        // if (moment(transferAtsignObj.atsignCreatedOn).isAfter(CONSTANTS.ATSIGN_TRANSFER_AFTER_DATE, 'day')) {
        //     return { error: { type: 'info', message: messages.ATSIGN_TRANSFER_AFTER_DATE_ERROR } }
        // }

        //todo
        let transferAtsign = await TransferAtsignService.addTransfterAtsign(atsign, ownerId, newOwnerId, transferAtsignObj.atsignType, transferAtsignObj.payAmount || 0, transferPrice, transferAtsignObj, 'PENDING', transferedBy)
        if (transferAtsign.error) return { error: transferAtsign.error }
        transferAtsignObj['transferId'] = transferAtsign.value._id
        let removeAtsign = await UserController.removeAtsignFromUser(ownerId, atsign)
        await AtsignDetailsController.initializeAtsignTransfer(ownerId, atsign,transferAtsign.value._id)
        if (removeAtsign.error) return { error: removeAtsign.error }
        return { value: transferAtsignObj['transferId'] };
    }
}
const completePendingTransferAtsign = async function (approvedBy, atsignTransferId) {
    try {
        let approvedByObj = await UserController.getUserById(approvedBy);
        if (approvedByObj.error) return { error: approvedByObj.error }

        let transferAtsignObj = await TransferAtsignService.getTransferAtsignListById(atsignTransferId);
        if (transferAtsignObj.error) return { error: transferAtsignObj.error }

        if (!transferAtsignObj.value || !approvedByObj.value) return { error: {type:'info',message:'Invalid Transaction'} }
        if (approvedByObj.value._id.toString() != transferAtsignObj.value.newOwnerId.toString()) {
            return { error: { type: 'info', message: messages.UNAUTH } }
        }
        transferAtsignObj.value.transferedObject['transferId']  = atsignTransferId
        let atsignTransfer = await AtsignDetailsController.completeAtsignTransfer(transferAtsignObj.value.oldOwnerId.toString(),approvedBy, transferAtsignObj.value.atsign,atsignTransferId)
        if(atsignTransfer.error){
            return {error: atsignTransfer.error}
        }
        let addAtsign = await UserController.addAtsignToUser(transferAtsignObj.value.newOwnerId, transferAtsignObj.value.transferedObject)
        if (addAtsign.error) {
            return { error: addAtsign.error }
        } else {
            await TransferAtsignService.updateTransferStatus(atsignTransferId, 'SUCCESS')
            mail.sendEmailSendGrid({
                templateName: "atsign_transfer",
                receiver: approvedByObj.value.email,
                dynamicdata: {
                    "atsign": transferAtsignObj.value.atsign
                }
            });
            return { value: atsignTransferId }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}
const rejectTransferAtsign = async function (rejectedBy, atsignTransferId) {
    try {

        let transferAtsignObj = await TransferAtsignService.getTransferAtsignListById(atsignTransferId);
        if (transferAtsignObj.error) return { error: transferAtsignObj.error }

        if (!transferAtsignObj.value || !rejectedBy) return { error: {type:'info',message:'Invalid Transaction'} }
        if (rejectedBy != transferAtsignObj.value.newOwnerId.toString()) {
            return { error: { type: 'info', message: messages.UNAUTH } }
        }
        let cancelAtsignTransfer = await AtsignDetailsController.cancelAtsignTransfer(transferAtsignObj.value.atsign,atsignTransferId)
        if(cancelAtsignTransfer.error){
            return {error: cancelAtsignTransfer.error}
        }
        const { error, value } = await UserController.addAtsignToUser(transferAtsignObj.value.oldOwnerId, transferAtsignObj.value.transferedObject)
        if (error) return { error }
        await TransferAtsignService.updateTransferStatus(atsignTransferId, 'REJECTED')
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

        if (!transferAtsignObj.value || !cancelledBy) return { error: {type:'info',message:'Invalid Transaction'} }
        if ((transferAtsignObj.value.oldOwnerId && cancelledBy != transferAtsignObj.value.oldOwnerId.toString()) || (transferAtsignObj.value.transferedBy && cancelledBy != transferAtsignObj.value.transferedBy.toString())) {
            return { error: { type: 'info', message: messages.UNAUTH } }
        }
        let cancelAtsignTransfer = await AtsignDetailsController.cancelAtsignTransfer(transferAtsignObj.value.atsign,atsignTransferId)
        if(cancelAtsignTransfer.error){
            return {error: cancelAtsignTransfer.error}
        }
        const { error, value } = await UserController.addAtsignToUser(transferAtsignObj.value.oldOwnerId, transferAtsignObj.value.transferedObject)
        if (error) return { error }
        await TransferAtsignService.updateTransferStatus(atsignTransferId, 'REJECTED')
        return { value: atsignTransferId }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}

// ---------------------- Admin Function --------------------

const getAllTransferAtsigns = async function (filter, sortBy, pageNo, limit) {
    try {
        const allTransferAtsign = await Promise.all([TransferAtsignService.getAllTransferAtsigns(filter, sortBy, pageNo, limit), TransferAtsignService.countCommercialAtsign(filter)])
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
        return res.status(200).json({ status: "success", message: messages.SUCCESSFULLY, data: { transferId: value } })
    }
}

const updateTransferAtsign = async function (req, res) {
    if (req.body.status && ['APPROVED', 'REJECTED', 'CANCELLED'].indexOf(req.body.status) != -1 && req.params.transferId) {
        let error, value;
        switch (req.body.status) {
            case 'APPROVED':
                ({ error, value } = await completePendingTransferAtsign(req._id, req.params.transferId)); break;
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
            return res.send({ status: 'success', data: value })
        }
    } else {
        res.send({ status: 'error', message: messages.INVALID_REQ_BODY })
    }
}

const getTransferAtsignOfUser = async function (req, res) {
    try {
        let oldOwnerId = req._id;
        let pageNo = req.query.pageNo && Number(req.query.pageNo) > 0 ? Number(req.query.pageNo) : 1
        let limit = req.query.limit && Number(req.query.limit) > 0 ? Number(req.query.limit) : 10
        let filter = req.query.searchTerm ? { atsign: { '$regex': `^${req.query.searchTerm}`, '$options': 'i' } } : null
        let sortBy = req.query.sortBy ? { [req.query.sortBy]: req.query.sortOrder == 'desc' ? -1 : 1 } : null

        const allTransferAtsign = await Promise.all([TransferAtsignService.getTransferAtsignOfUser(oldOwnerId, filter, sortBy, pageNo, limit), TransferAtsignService.countCommercialAtsign(filter)])
        let error = allTransferAtsign[0].error || allTransferAtsign[1].error
        if (error) {
            return { error }
        }
        else {
            let value = allTransferAtsign[0].value
            await Promise.all(value.map(async data => {
                let id = data.newOwnerId;
                const user = await UserController.getUserById(id)
                data.newOwnerEmail = user.value ? user.value.email : ''
                return data;
            }))
            return res.status(200).json({ status: 'success', message: messages.SUCCESSFULLY, data: { records: value, total: allTransferAtsign[1].value, pageNo, limit } })
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}

module.exports = {
    transferAtsign,
    updateTransferAtsign,
    getTransferAtsignOfUser,
    getAllTransferAtsigns,
    transferAtsignInitialization
}
