const TransferAtsign = require('../models/transfer-atsign.model')

const addTransfterAtsign = async function (atsign, oldOwnerId, newOwnerId, atsignType, atsignPrice, atsignTransferPrice, transferedObject, status, transferredBy) {
    try {
        let transferObj = await TransferAtsign.create({
            atsign,
            oldOwnerId,
            newOwnerId,
            atsignType,
            atsignPrice,
            atsignTransferPrice,
            transferedObject,
            status,
            transferredBy

        })
        return { value: transferObj }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }

}
const updateTransferStatus = async function (transactionId, status) {
    try {
        let transferObj = await TransferAtsign.findOneAndUpdate({ _id: transactionId }, { status: status })
        return { value: transferObj };
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}


const getTransferAtsignOfUser = async function (oldOwnerId, filter, sortBy, pageNo = 1, limit = 10) {
    try {
        filter = filter && typeof filter == 'object' ? filter : {}
        sortBy = sortBy && typeof sortBy == 'object' && Object.keys(sortBy).length > 0 ? sortBy : { _id: -1 }

        if (oldOwnerId) {
            const atsignTransfer = await TransferAtsign.find({ oldOwnerId: oldOwnerId }).sort(sortBy).skip((pageNo - 1) * limit).limit(limit).lean();
            return { value: atsignTransfer }
        } else {
            return { error: { type: 'info', message: messages.INVALID_ATSIGN } }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}


// all atsign-transfer-list 
const getAllTransferAtsigns = async function (filter, sortBy, pageNo = 1, limit = 10) {
    try {
        filter = filter && typeof filter == 'object' ? filter : {}
        sortBy = sortBy && typeof sortBy == 'object' && Object.keys(sortBy).length > 0 ? sortBy : { _id: -1 }
        const transferAtsign = await TransferAtsign.find(filter).sort(sortBy).skip((pageNo - 1) * limit).limit(limit).lean();
        return { value: transferAtsign }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}

const countCommercialAtsign = async function (filter) {
    try {
        filter = filter && typeof filter == 'object' ? filter : {}
        const commercialAtsignCount = await TransferAtsign.countDocuments(filter)
        return { value: commercialAtsignCount }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}

const getTransferAtsignListById = async function (id) {
    try {
        const TransferAtsignObj = await TransferAtsign.findOne({_id:id,status:'PENDING'}).lean()
        return { value: TransferAtsignObj }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}

module.exports = {
    addTransfterAtsign,
    updateTransferStatus,
    getTransferAtsignOfUser,
    getAllTransferAtsigns,
    countCommercialAtsign,
    getTransferAtsignListById
}