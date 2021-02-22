const giftUpAPIHeader = process.env.SENDGRID_SUBJECT_ENV && process.env.SENDGRID_SUBJECT_ENV.startsWith('[') ? {
    Authorization: process.env.GIFT_UP_SECRET_KEY || 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzOTljMTRiYi1kZjI2LTRmYTEtODlmNS1jODNiNWE2ZTZmMDAiLCJzdWIiOiJoYXNzYW5qZWhhbjFAZ21haWwuY29tIiwiZXhwIjoxOTIwNzM1ODQ5LCJpc3MiOiJodHRwczovL2dpZnR1cC5hcHAvIiwiYXVkIjoiaHR0cHM6Ly9naWZ0dXAuYXBwLyJ9.X76NgyUFnoEe5-xiC_C8rnrQjgifsNHZFHvTyUMBIaE',
    'content-type': 'application/json; charset=utf-8',
    'x-giftup-testmode': 'true'
} : {
        Authorization: process.env.GIFT_UP_SECRET_KEY,
        'content-type': 'application/json; charset=utf-8'
    }

const axios = require("axios")

// let schedule = require('node-schedule');
const AwaitedTransaction = require("../models/awaited-transaction");

const getPromotionalCardBalance = async function (promotionalCode, inCents) {
    try {
        let promotionalCard = await axios({
            method: 'get',
            url: `https://api.giftup.app/gift-cards/${promotionalCode}`,
            headers: giftUpAPIHeader
        })
        if (promotionalCard.data.canBeRedeemed) {
            if (promotionalCard.data.remainingValue) {
                return inCents ? promotionalCard.data.remainingValue * 100 : promotionalCard.data.remainingValue
            } else {
                throw Error("Invalid promotional code or zero balance")
            }
        } else {
            throw Error("Hmm, this promotional code can't be redeemed. Please contact your vendor for more assistance.")
        }
    } catch (error) {
        throw Error('Invalid promotional code or zero balance')
    }
}



const redeemPromotionalCard = async function (promotionalCode, orderAmount) {
    try {
        const promotionalCardBalance = await getPromotionalCardBalance(promotionalCode, true);
        if (promotionalCardBalance > 0) {
            let amountToDebitFromCard = promotionalCardBalance > orderAmount ? orderAmount : promotionalCardBalance
            let redeemCard = await axios({
                method: 'post',
                data: {
                    "amount": amountToDebitFromCard / 100,
                    "units": null,
                    "reason": "Used with Order 7597"
                },
                url: `https://api.giftup.app/gift-cards/${promotionalCode}/redeem`,
                headers: giftUpAPIHeader
            })
            return { amountDebited: redeemCard.data.redeemedAmount * 100, promoCodeTransactionId: redeemCard.data.transactionId }
        } else {
            throw Error("Unable to redeem card")
        }
    } catch (error) {
        throw Error("Unable to redeem card")
    }
}

const undoGiftCardRedemption = async function (promotionalCode, transactionId) {
    try {
        let promotionalCard = await axios({
            method: 'post',
            data: {
                transactionId: transactionId
            },
            url: `https://api.giftup.app/gift-cards/${promotionalCode}/undo-redemption`,
            headers: giftUpAPIHeader
        })
        if (promotionalCard.data) {
            return true
        } else {
            throw Error("Hmm, this promotional code can't be redeemed. Please contact your vendor for more assistance.")
        }
    } catch (error) {
        throw Error('Invalid promotional code')
    }
}

const undoAwaitedTransaction = async function () {
    try {
        let date = new Date()
        date.setMinutes(date.getMinutes() - 15)
        let transactions = await AwaitedTransaction.find({ createdAt: { $lte: date } }).sort({ _id: 1 })
        for (let i = 0; i < transactions.length; i++) {
            let transaction = transactions[i]
            if (transaction.intent.promotionalCode && transaction.intent.promoCodeTransactionId) {
                await undoGiftCardRedemption(transaction.intent.promotionalCode, transaction.intent.promoCodeTransactionId)
            }
            await AwaitedTransaction.findOneAndDelete({ _id: transaction._id })
        }
        return { value: {count:transactions.length} };
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}
// var undoPromoCodeTransaction = schedule.scheduleJob('*/15 * * * *', undoAwaitedTransaction);
module.exports = {
    getPromotionalCardBalance,
    redeemPromotionalCard,
    undoGiftCardRedemption,
    undoAwaitedTransaction
}