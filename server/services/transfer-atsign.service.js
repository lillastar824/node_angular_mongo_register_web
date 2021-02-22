const TransferAtsign = require('../models/transfer-atsign.model')
const { messages } = require('./../config/const');
const addTransfterAtsign = async function (atsign, oldOwnerId, newOwnerId, atsignType, atsignPrice, atsignTransferPrice, transferredObject, status, transferredBy) {
    try {
        let transferObj = await TransferAtsign.create({
            atsign,
            oldOwnerId,
            newOwnerId,
            atsignType,
            atsignPrice,
            atsignTransferPrice,
            transferredObject,
            status,
            transferredBy

        })
        return { value: transferObj }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }

}
const updateTransferStatus = async function (transactionId, status, updatedBy = '') {
    try {
        let transferObj = await TransferAtsign.findOneAndUpdate({ _id: transactionId }, { status: status, updatedBy })
        return { value: transferObj };
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}


const getTransferAtsignOfUser = async function (userId, filter, sortBy, pageNo = 1, limit = 10) {
    try {
        filter = filter && typeof filter == 'object' ? filter : {}
        sortBy = sortBy && typeof sortBy == 'object' && Object.keys(sortBy).length > 0 ? sortBy : { _id: -1 }
        if (userId) {
            let atsignTransfer = await TransferAtsign.find({ $or: [{ oldOwnerId: userId }, { newOwnerId: userId }] }).sort(sortBy).skip((pageNo - 1) * limit).limit(limit).lean();
            atsignTransfer = atsignTransfer.map(atsign => {
                atsign['transferType'] = atsign.oldOwnerId.toString() === userId.toString() ? 'outgoing':'incoming'
                return atsign
            })
            return { value: atsignTransfer }
        } else {
            return { error: { type: 'info', message: messages.INVALID_ATSIGN } }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}
const countTransferAtsignOfUser = async function (userId, filter) {
    try {
        filter = filter && typeof filter == 'object' ? filter : {}
        if (userId) {
            const atsignTransfer = await TransferAtsign.countDocuments({ $or: [{ oldOwnerId: userId }, { newOwnerId: userId }] });
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

const countAllTransferAtsigns = async function (filter) {
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
        const TransferAtsignObj = await TransferAtsign.findOne({ _id: id, status: 'PENDING' }).lean()
        return { value: TransferAtsignObj }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}
const findAtsignForScript = async function (filter, skip, limit) {
    try {
        const TransferAtsignObj = await TransferAtsign.find(filter).skip(skip).limit(limit)
        return { value: TransferAtsignObj }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}
const changeAtsignTransferTime = async function (atsign,date) {
    try {
        const TransferAtsignObj = await TransferAtsign.updateOne({atsign,status:'PENDING'},{createdAt:date})
        return { value: TransferAtsignObj }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}
const addHistory = async function (transferId,history) {
    try {
        const TransferAtsignObj = await TransferAtsign.findOneAndUpdate({_id:transferId},{$push:{history:history}})
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
    countAllTransferAtsigns,
    getTransferAtsignListById,
    findAtsignForScript,
    countTransferAtsignOfUser,
    changeAtsignTransferTime,
    addHistory
}