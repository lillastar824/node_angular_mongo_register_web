const AtsignDetailService = require('./../services/atsign-detail.service');
const { CONSTANTS } = require('./../config/const')
const moment = require('moment')
const { PAYMENT_EXTENSION_DAYS, RENEWAL_PAYMENT_VALID_BEFORE_DAYS } = CONSTANTS

const checkAtsignIsPayable = async function (atsign) {
    const { error, value } = await AtsignDetailService.getAtsignDetails(atsign)
    if (error) return { error }
    if (!value) return { value: { status: false, atsignDetail: null } }
    let currentDate = new Date()
    let lastPaymentDetails = value.paymentDetails[value.paymentDetails.length - 1]
    // let lastPaymentValidFrom = new Date(lastPaymentDetails.period_start)
    let lastPaymentValidTill = new Date(lastPaymentDetails.period_end)
    let paymentValidFromDate = moment(lastPaymentValidTill).utc().subtract(RENEWAL_PAYMENT_VALID_BEFORE_DAYS, 'days').toDate()
    let lastPaymentValidTillWithExt = moment(lastPaymentValidTill).utc().add(PAYMENT_EXTENSION_DAYS, 'days').toDate()
    if (value.atsignType == 'free') return { value: { status: false, atsignDetail: value } }
    // if (currentDate >= lastPaymentValidFrom && currentDate <= lastPaymentValidTillWithExt) {
    if (currentDate >= paymentValidFromDate && currentDate <= lastPaymentValidTillWithExt) {
        return { value: { status: true, atsignDetail: value } }
    }
    return { value: { status: false, atsignDetail: value } }
}

const payAtsignRenewalFees = async function (atsign, payAmount) {
    const atsignDetail = await AtsignDetailService.getAtsignDetails(atsign)
    if (atsignDetail.error) return { error: atsignDetail.error }
    if (!atsignDetail.value) return { error: { type: 'info', message: 'Invalid Atsign' } }
    const renewalPeriodStartDate = atsignDetail.value.lastPaymentValidTill // moment(atsignDetail.value.lastPaymentValidTill).utc().hours(0).minutes(0).seconds(0).millisecond(0).add(365, "days").toDate(),
    renewalPeriodEndDate = moment(atsignDetail.value.lastPaymentValidTill).utc().hours(0).minutes(0).seconds(0).millisecond(0).add(365, "days").toDate();
    return AtsignDetailService.addAtsignRenewalPaymentDetails(atsignDetail.value._id, payAmount, renewalPeriodStartDate, renewalPeriodEndDate)
}
const addAtsignDetail = async function (atsignDetails) {
    const { error, value } = await AtsignDetailService.addAtsignDetails(atsignDetails)
    return { error, value }
}
const removeAtsign = async function (userId, atsign) {
    if (!userId || !atsign) return { error: { type: 'info', message: 'Both atsign and userid is required to remove atsign detaail' } }
    const { error, value } = await AtsignDetailService.removeAtsign(userId, atsign)
    return { error, value }
}
const findAtsignForRenewal = async function (filter, pageNo, limit) {
    const { error, value } = await AtsignDetailService.findAtsignForRenewal(filter, pageNo, limit)
    return { error, value }
}
const changeAtsignValidTillTime = async function (atsign, date) {
    const { error, value } = await AtsignDetailService.changeAtsignValidTillTime(atsign, date)
    return { error, value }
}
const initializeAtsignTransfer = async function (userId, atsign, transferId) {
    const { error, value } = await AtsignDetailService.initializeAtsignTransfer(userId, atsign, transferId)
    return { error, value }
}
const cancelAtsignTransfer = async function (atsign, transferId) {
    const { error, value } = await AtsignDetailService.cancelAtsignTransfer(atsign, transferId)
    return { error, value }
}
const getAtsignDetails = async function (atsign,status) {
    const { error, value } = await AtsignDetailService.getAtsignDetails(atsign,status)
    return { error, value }
}

const completeAtsignTransfer = async function (userId, transferredTo, atsign, transferId) {
    const { error, value } = await AtsignDetailService.markAtsignTransferred(userId, atsign, transferId)
    if (value && value._id) {
        let date = (new Date())
        date.setUTCHours(0)
        date.setUTCMinutes(0)
        date.setUTCSeconds(0)
        date.setUTCMilliseconds(0)
        date.setFullYear(date.getFullYear() + 1)
        const newAtsignDetail = await AtsignDetailService.addAtsignDetails({
            "atsignName": value.atsignName,
            "atsignType": value.atsignType,
            "atsignCreatedOn": value.atsignCreatedOn,
            "premiumAtsignType": value.premiumAtsignType,
            "payAmount": value.payAmount ? value.payAmount : 0,
            "lastPaymentValidFrom": new Date(),
            "userId": transferredTo,
            'lastPaymentValidTill': date,
            "status": 'ACTIVE',
            "inviteCode": value.inviteCode,
            'paymentDetails': [{
                period_start: new Date(),
                period_end: date,
                amount_paid: value.payAmount ? value.payAmount : 0,
                billing_reason: 'BUY_ATSIGN',
                total: value.payAmount ? value.payAmount : 0
            }],
            transferId
        })
        if (newAtsignDetail.value) {
            return { value: newAtsignDetail.value }
        } else {
            return { error: newAtsignDetail.error }
        }
    } else {
        if (error) {
            return { error }
        } else {
            return { error: { type: 'info', message: 'Invalid Transfer' } }
        }
    }

}

const markAtsignAsDeleted = async function (atsign) {
    const { error, value } = await AtsignDetailService.markAtsignAsDeleted(atsign)
    if (error) {
        return { error }
    } else {
        return value ? { value } : { error: "Oops, @sign doesn't exists." }
    }
}


const getAdminAssignedAtsign = async function (filter, sortBy, pageNo, limit) {
    try {
        const AdminAssignedAtsignPromise = await Promise.all([AtsignDetailService.getAdminAssignedAtsign(filter, sortBy, pageNo, limit), AtsignDetailService.countAdminAssignedAtsign(filter)])
        let error = AdminAssignedAtsignPromise[0].error || AdminAssignedAtsignPromise[1].error
        if (error) {
            return { error }
        }
        else {
            return {
                value: {
                    records: AdminAssignedAtsignPromise[0].value,
                    total: AdminAssignedAtsignPromise[1].value,
                    pageNo,
                    limit
                }
            }
        }

    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}

const updateAdvanceSetting = async function (userId,atsign,domain,port) {
    const { error, value } = await AtsignDetailService.updateAdvanceSetting(userId,atsign,domain,port)
    if (error) {
        return { error }
    } else {
        return value ? { value } : { error: "Oops, @sign doesn't exists." }
    }
}

module.exports = {
    getAtsignDetails,
    checkAtsignIsPayable,
    payAtsignRenewalFees,
    addAtsignDetail,
    removeAtsign,
    findAtsignForRenewal,
    changeAtsignValidTillTime,
    initializeAtsignTransfer,
    completeAtsignTransfer,
    cancelAtsignTransfer,
    markAtsignAsDeleted,
    getAdminAssignedAtsign,
    updateAdvanceSetting
}