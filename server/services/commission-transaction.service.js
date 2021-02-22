const CommissionTransaction = require('../models/commission-transaction.model')
const { messages } = require('../config/const');

const addCommissionTransaction = async function (commissionTransactionDetails,isCurrencyInCent = false,isSuccess = false) {
    try {
        const status = isSuccess ? 'success' : 'pending', metadata = {}
        let { userId, atsign, transactionId, totalOrderAmount , totalFinalCommission ,currency} = commissionTransactionDetails
        if(isCurrencyInCent === false){
            totalOrderAmount = totalOrderAmount * 100;
            totalFinalCommission = totalFinalCommission * 100
        }
        if (userId && atsign && transactionId && totalOrderAmount && totalFinalCommission && currency) {
            const newCommission = await CommissionTransaction.create({ userId, atsign, transactionId, totalOrderAmount , totalFinalCommission , metadata,status,currency })
            return { value: newCommission }
        } else {
            return { error: { type: 'info', message: messages.INVALID_REQ_BODY } }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}



module.exports = {
    addCommissionTransaction,
}