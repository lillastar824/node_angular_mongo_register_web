const { messages } = require('../config/const');
const AtsignDetail = require('./../models/atsign-detail.model')


const addAtsignRenewalPaymentDetails = async function (atsignId, amountPaid, renewalPeriodStartDate, renewalPeriodEndDate) {
    try {
        let updatedObj = await AtsignDetail.findOneAndUpdate({
            _id: atsignId
        }, {
            lastPaymentValidTill: renewalPeriodEndDate,
            $push: {
                paymentDetails: {
                    period_start: renewalPeriodStartDate,
                    period_end: renewalPeriodEndDate,
                    amount_paid: amountPaid,
                    billing_reason: 'RENEW_ATSIGN',
                    total: amountPaid
                }
            }
        })
        return { value: updatedObj };
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}

const getAtsignDetails = async function (atsign,status) {
    let filter = { atsignName: { $regex: `^${atsign}$`, $options: 'i' } }
    if (status) {
        if (!Array.isArray(status)) return { error: 'info', message: 'status must be an array' }
        filter['status'] = { $in: status }
    } else {
        filter['status'] = 'ACTIVE'
    }
    try {
        const atsignDetail = await AtsignDetail.findOne(filter).lean()
        return { value: atsignDetail }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}
const markAtsignAsDeleted = async function (atsign) {
    try {
        const deletedAtsign = await AtsignDetail.findOneAndUpdate({ atsignName: { $regex: `^${atsign}$`, $options: 'i' }, status: 'ACTIVE' }, { status: 'DELETED' }, { new: true }).lean()
        return { value: deletedAtsign }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}

const addAtsignDetails = async function (addAtsignDetails) {
    try {
        const atsignDetail = await AtsignDetail.create(addAtsignDetails)
        return { value: atsignDetail }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}

const removeAtsign = async function (userId, atsign) {
    try {
        const removedAtsign = await AtsignDetail.findOneAndUpdate({ userId, atsignName: atsign }, { status: 'DELETED' })
        return { value: removedAtsign }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}
const findAtsignForRenewal = async function (filter, skip, limit) {
    try {
        const atsign = await AtsignDetail.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: "$userId",
                    atsignNames: {
                        $push: "$atsignName"
                    },
                }
            },
            { $skip: skip },
            { $limit: limit }])
        return { value: atsign }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}

const changeAtsignValidTillTime = async function (atsign, date) {
    try {
        const atsignDetails = await AtsignDetail.findOne({ atsignName: atsign ,status:{$in:['ACTIVE','TRANSFERRING']}}).lean()
        if(atsignDetails){
            atsignDetails.lastPaymentValidTill = date
            atsignDetails.paymentDetails[atsignDetails.paymentDetails.length - 1].period_end = date
            delete atsignDetails.createdAt
            delete atsignDetails.updatedAt
        }else{
            return {error:{type:'info',message:'Invalid atsign'}}
        }
        const removedAtsign = await AtsignDetail.findOneAndUpdate({ _id:atsignDetails._id }, atsignDetails)
        return { value: removedAtsign?true:false }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}
const initializeAtsignTransfer = async function (userId, atsign, transferId) {
    try {
        const removedAtsign = await AtsignDetail.findOneAndUpdate({ userId, atsignName: atsign, status: "ACTIVE" }, { status: "TRANSFERRING", transferId })
        return { value: removedAtsign }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}
const cancelAtsignTransfer = async function (atsign, transferId) {
    try {
        const removedAtsign = await AtsignDetail.findOneAndUpdate({ atsignName: atsign, transferId, status: "TRANSFERRING" }, { status: "ACTIVE", transferId: null })
        return { value: removedAtsign }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}
const markAtsignTransferred = async function (userId, atsign, transferId) {
    try {
        // console.log({ userId, atsignName: atsign, transferId, status: "TRANSFERRING" });
        const removedAtsign = await AtsignDetail.findOneAndUpdate({ userId, atsignName: atsign, transferId, status: "TRANSFERRING" }, { status: "TRANSFERRED" })
        return { value: removedAtsign }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}

const getAdminAssignedAtsign = async function (filter, sortBy, pageNo = 1, limit = 10) {
    try {
        filter = filter && typeof filter == 'object' ? filter : {}
        sortBy = sortBy && typeof sortBy == 'object' && Object.keys(sortBy).length > 0 ? sortBy : { _id: -1 }
        const adminAssignedAtsign = await AtsignDetail.find(filter).sort(sortBy).skip((pageNo - 1) * limit).limit(limit).lean()
        return { value: adminAssignedAtsign }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}
const countAdminAssignedAtsign = async function (filter) {
    try {
        filter = filter && typeof filter == 'object' ? filter : {}
        const adminAssignedAtsign = await AtsignDetail.countDocuments(filter);
        return { value: adminAssignedAtsign }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}
const updateAdvanceSetting = async function (userId,atsign,domain,port) {
    try {
        
        const adminAssignedAtsign = await AtsignDetail.findOneAndUpdate({userId:userId,atsignName:atsign},{advanceDetails:{domain,port}});
        if(adminAssignedAtsign){

            return { value: adminAssignedAtsign }
        }else{
            return {error:{type:'info',message:messages.INVALID_REQ_BODY}}
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}
module.exports = {
    addAtsignRenewalPaymentDetails,
    getAtsignDetails,
    addAtsignDetails,
    removeAtsign,
    findAtsignForRenewal,
    changeAtsignValidTillTime,
    initializeAtsignTransfer,
    markAtsignTransferred,
    cancelAtsignTransfer,
    markAtsignAsDeleted,
    getAdminAssignedAtsign,
    countAdminAssignedAtsign,
    updateAdvanceSetting
}