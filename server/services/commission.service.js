const Commission = require('../models/commission.model')
const { messages } = require('../config/const');
const moment = require('moment')

const addCommission = async function (commissionDetails) {
    try {
        const { userId, commissionOfferedPercentage, discountOfferedPercentage, finalCommission, status, metadata, atsign, currency, orderAmount, maxDiscountAmount } = commissionDetails
        if (userId && metadata.commsionForUserId && metadata.orderData) {
            const newCommission = await Commission.create({ atsign, userId, commissionOfferedPercentage, discountOfferedPercentage, finalCommission, status, currency, orderAmount, metadata, maxDiscountAmount })
            return { value: newCommission }
        } else {
            return { error: { type: 'info', message: messages.INVALID_REQ_BODY } }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}
const getCommercialAtsignCommissionDetails = async function (filter, sortBy, pageNo, limit) {

    try {
        filter = filter && typeof filter == 'object' ? filter : {}
        sortBy = sortBy && typeof sortBy == 'object' && Object.keys(sortBy).length > 0 ? sortBy : { status: '1' }
        sortBy['status'] = 1
        const commissionDetails = await Commission.aggregate([
            { "$match": filter },
            {
                $project: {
                    _id: 1,
                    atsign: 1,
                    orderAmount: 1,
                    status: 1,
                    currency: 1,
                    paidCommission: { $cond: [{ $eq: ['$status', 'success'] }, '$finalCommission', 0] },
                    finalCommission: { $cond: [{ $eq: ['$status', 'pending'] }, '$finalCommission', 0] }
                }
            },
            {
                $group: {
                    _id: '$atsign',
                    totalOrderAmount: { $sum: "$orderAmount" },
                    totalFinalCommission: { $sum: "$finalCommission" },
                    totalCommissionPaid: { $sum: "$paidCommission" },
                    status: { $first: "$status" },
                    currency: { $first: "$currency" }
                }
            },
            { $sort: sortBy },
            { $skip: (pageNo - 1) * limit },
            { $limit: limit }
        ])
        // const commissionDetails = await Commission.find(filter).sort(sortBy).skip((pageNo - 1) * limit).limit(limit)
        commissionDetails.map(commission => {
            commission.totalFinalCommission = commission.totalFinalCommission / 100;
            commission.totalOrderAmount = commission.totalOrderAmount / 100;
            commission.totalCommissionPaid = commission.totalCommissionPaid / 100;
            commission.status = commission.totalFinalCommission > 0 ? 'pending' : 'success'
            return commission
        })
        return { value: commissionDetails }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}
const countCommercialAtsignCommissionDetails = async function (filter) {

    try {
        filter = filter && typeof filter == 'object' ? filter : {}
        const commissionDetailsCount = await Commission.aggregate([
            { "$match": filter },
            {
                $group: {
                    _id: '$atsign',
                    totalOrderAmount: { $sum: "$orderAmount" },
                    totalFinalCommission: { $sum: "$finalCommission" },
                    status: { $first: "$status" },
                    currency: { $first: "$currency" }
                }
            },
            {
                $count: "count"
            }
        ]);
        let totalData = commissionDetailsCount.length > 0 && commissionDetailsCount.pop()['count'];
        // const commissionDetails = await Commission.find(filter).sort(sortBy).skip((pageNo - 1) * limit).limit(limit)
        return { value: totalData }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}

// get Commission reports Atsign details 
const getCommercialReportsDetailsByAtsign = async function (atsign, limit, pageNo, sortBy) {
    try {
        sortBy = sortBy && typeof sortBy == 'object' && Object.keys(sortBy).length > 0 ? sortBy : { _id: -1 }
        let commercialAtsigns = await Commission.find({ atsign: { '$regex': `^${atsign}$`, '$options': 'i' } }).sort(sortBy).skip((pageNo - 1) * limit).limit(limit).lean();
        commercialAtsigns.map(atsign => {
            atsign.finalCommission = atsign.finalCommission / 100
            atsign.orderAmount = atsign.orderAmount / 100
            atsign.paidAmount = atsign.metadata.orderData.reduce((acc, val) => acc + val.payAmount, 0)
            // atsign.paidAmount = (atsign.orderAmount - (atsign.orderAmount * atsign.discountOfferedPercentage * 0.01))
            return atsign
        })
        return { value: commercialAtsigns }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}
const getCommissionRepotsDetailsByUser = async function (filter, limit, pageNo, sortBy) {
    try {
        sortBy = sortBy && typeof sortBy == 'object' && Object.keys(sortBy).length > 0 ? sortBy : { _id: -1 }
        let commercialAtsigns = await Commission.find(filter).sort(sortBy).skip((pageNo - 1) * limit).limit(limit).lean();
        commercialAtsigns.map(atsign => {
            atsign.finalCommission = atsign.finalCommission / 100
            atsign.orderAmount = atsign.orderAmount / 100
            atsign.paidAmount = atsign.metadata.orderData.reduce((acc, val) => acc + val.payAmount, 0)
            // atsign.paidAmount = (atsign.orderAmount - (atsign.orderAmount * atsign.discountOfferedPercentage * 0.01))
            return atsign
        })
        return { value: commercialAtsigns }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}
const countCommissionRepotsDetailsByUser = async function (filter) {
    try {
        let commercialAtsignCount = await Commission.countDocuments(filter);
        return { value: commercialAtsignCount }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}

const approveAndGetCommissionByAtsign = async function (atsign, approveTillTime, transactionId) {
    try {
        if (atsign && approveTillTime && transactionId) {
            let filter = {
                atsign: { '$regex': `^${atsign}$`, '$options': 'i' },
                updatedAt: { '$lte': approveTillTime },
                status: 'pending'
            }
            let commissionDetails = await Commission.aggregate([
                { "$match": filter },
                {
                    $group: {
                        _id: '$atsign',
                        totalOrderAmount: { $sum: "$orderAmount" },
                        totalFinalCommission: { $sum: "$finalCommission" },
                        status: { $first: "$status" },
                        currency: { $first: "$currency" },
                        userId: { '$first': "$userId" }
                    }
                }
            ]);
            if (commissionDetails && commissionDetails[0] && commissionDetails[0].totalFinalCommission > 0) {
                commissionDetails[0].totalOrderAmount = commissionDetails[0].totalOrderAmount * .01
                commissionDetails[0].totalFinalCommission = commissionDetails[0].totalFinalCommission * .01
                await Commission.updateMany(filter, { transactionId: transactionId, status: 'success' })
                return { value: commissionDetails[0] }
            } else {
                return { error: { type: 'info', message: messages.NO_RECORD_FOUND } }
            }
        } else {
            return { error: { type: 'info', message: messages.INVALID_REQ_BODY } }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}

const rollBackApprovedCommissionByTransactionId = async function (transactionId) {
    try {
        if (transactionId) {
            await Commission.updateMany({ transactionId: transactionId }, { transactionId: '', status: 'pending' })
            return { value: transactionId }
        } else {
            return { error: { type: 'info', message: messages.INVALID_REQ_BODY } }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}


module.exports = {
    addCommission,
    getCommercialAtsignCommissionDetails,
    countCommercialAtsignCommissionDetails,
    getCommercialReportsDetailsByAtsign,
    getCommissionRepotsDetailsByUser,
    countCommissionRepotsDetailsByUser,
    approveAndGetCommissionByAtsign,
    rollBackApprovedCommissionByTransactionId
}