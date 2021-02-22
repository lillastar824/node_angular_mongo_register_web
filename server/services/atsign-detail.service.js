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

const getAtsignDetails = async function (atsign) {
    try {
        const atsignDetail = await AtsignDetail.findOne({ atsignName: { $regex: `^${atsign}$`, $options: 'i' }, status: 'ACTIVE' }).lean()
        return { value: atsignDetail }
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
        const removedAtsign = await AtsignDetail.findOneAndUpdate({ atsignName: atsign }, { lastPaymentValidTill: date })
        return { value: removedAtsign }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}
const initializeAtsignTransfer = async function (userId, atsign,transferId) {
    try {
        const removedAtsign = await AtsignDetail.findOneAndUpdate({ userId, atsignName:atsign,status:"ACTIVE" }, { status: "TRANSFERRING" ,transferId})
        return { value: removedAtsign }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}
const cancelAtsignTransfer = async function (atsign,transferId) {
    try {
        const removedAtsign = await AtsignDetail.findOneAndUpdate({ atsignName:atsign,transferId,status:"TRANSFERRING" }, { status: "ACTIVE" ,transferId:null})
        return { value: removedAtsign }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}
const markAtsignTransferred = async function (userId, atsign,transferId) {
    try {
        console.log({ userId, atsignName:atsign,transferId,status:"TRANSFERRING" });
        const removedAtsign = await AtsignDetail.findOneAndUpdate({ userId, atsignName:atsign,transferId,status:"TRANSFERRING" }, { status: "TRANSFERRED"})
        return { value: removedAtsign }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
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
    cancelAtsignTransfer
}