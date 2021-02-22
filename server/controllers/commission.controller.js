const CommertialAtsignService = require('./../services/commercial-atsign.service')
const CommissionService = require('./../services/commission.service')
const CommissionTransactionService = require('./../services/commission-transaction.service')
const UserService = require('./../services/user.service')
const logError = require('./../config/handleError');
const { messages } = require('../config/const');
const mail = require('../config/mailer');
const moment = require('moment')

const checkAndProvideCommission = async function (userId, orderDetails, inCents) {
    try {
        const userDetails = await UserService.getUserById(userId)
        if (userDetails) {
            const cartReferalCode = userDetails.cartReferalCode;
            if (cartReferalCode) {
                const refferdByAtsignCommissionDetails = await CommertialAtsignService.getAtsignCommercialDetails(cartReferalCode)
                if (refferdByAtsignCommissionDetails.error) {
                    if (refferdByAtsignCommissionDetails.error.type == 'info') {
                        // console.log(refferdByAtsignCommissionDetails.error)
                        logError(refferdByAtsignCommissionDetails.error)

                    } else {
                        // console.log(refferdByAtsignCommissionDetails.error);
                        logError(refferdByAtsignCommissionDetails.error.data)
                    }
                } else {
                    if (refferdByAtsignCommissionDetails.value && refferdByAtsignCommissionDetails.value.commissionPercentage && refferdByAtsignCommissionDetails.value.commissionPercentage > 0) {
                        const userAtsign = userDetails.atsignDetails.filter(atsign=>atsign.atsignName?true:false)
                        if(userAtsign.length === orderDetails.cartData.length && cartReferalCode.toLowerCase().replace('@','') == 'internetoptimist'){
                            mail.sendEmailSendGrid({
                                templateName: "early_access_signup_success",
                                receiver: userDetails.email,
                                dynamicdata: {},
                            });
                        }
                        const referByUser = await UserService.getUserByAtsign(cartReferalCode);
                        if (referByUser) {
                            const commissionAmount = (orderDetails.amount * refferdByAtsignCommissionDetails.value.commissionPercentage) / 100
                            const discountAmountByPercentage = ((orderDetails.amount * refferdByAtsignCommissionDetails.value.discountOfferedPercentage) / 100)
                            const maxDiscountByCurrency = (refferdByAtsignCommissionDetails.value && refferdByAtsignCommissionDetails.value.maxDiscountAmount ) ? refferdByAtsignCommissionDetails.value.maxDiscountAmount * (inCents ? 100 : 1) : discountAmountByPercentage
                            const finalDiscountAmount = maxDiscountByCurrency > discountAmountByPercentage ? discountAmountByPercentage : maxDiscountByCurrency
                            let commmisionAmountAfterDiscount = commissionAmount - finalDiscountAmount
                            if (commmisionAmountAfterDiscount < 0) {
                                commmisionAmountAfterDiscount = 0
                            }
                            let commmissionDetails = {
                                atsign: cartReferalCode,
                                userId: referByUser._id,
                                commissionOfferedPercentage: refferdByAtsignCommissionDetails.value.commissionPercentage,
                                discountOfferedPercentage: refferdByAtsignCommissionDetails.value.discountOfferedPercentage,
                                finalCommission: commmisionAmountAfterDiscount,
                                status: 'pending',
                                currency: orderDetails.currency,
                                orderAmount: orderDetails.amount,
                                metadata: {
                                    commsionForUserId: userId,
                                    orderData: orderDetails.cartData,
                                    orderId: orderDetails.completeOrderId
                                }
                            }
                            if(refferdByAtsignCommissionDetails.value.maxDiscountAmount){
                                commmissionDetails['maxDiscountAmount'] = refferdByAtsignCommissionDetails.value.maxDiscountAmount * (inCents ? 100 : 1) 
                            }
                            const { error, value } = await CommissionService.addCommission(commmissionDetails)
                            if (value) {
                                await UserService.clearCartReferalCode(userId)
                                return { value };
                            } else if (error.type == 'info') {
                                // console.log(error)
                                logError(error)
                            } else {
                                // console.log(error);
                                logError(error.data)
                            }
                        }
                    }
                }

            }
        }
    } catch (error) {
        // console.log(error);
        logError(error)
    }
}

const getDiscountDetails = async function (userId, orderAmount,inCents = false ) {
    let finalDiscountDetails = {
        finalOrderAmount: orderAmount,
        finalDiscountPercentage: 0
    };
    try {
        const userDetails = await UserService.getUserById(userId)
        if (userDetails) {
            const cartReferalCode = userDetails.cartReferalCode;
            if (cartReferalCode) {
                const refferdByAtsignCommissionDetails = await CommertialAtsignService.getAtsignCommercialDetails(cartReferalCode)
                if (refferdByAtsignCommissionDetails.error) {
                    if (refferdByAtsignCommissionDetails.error.type == 'info') {
                        // console.log(refferdByAtsignCommissionDetails.error)
                        logError(refferdByAtsignCommissionDetails.error)
                    } else {
                        // console.log(refferdByAtsignCommissionDetails.error);
                        logError(refferdByAtsignCommissionDetails.error.data)
                    }
                } else {
                    if (refferdByAtsignCommissionDetails.value && refferdByAtsignCommissionDetails.value.discountOfferedPercentage && refferdByAtsignCommissionDetails.value.discountOfferedPercentage > 0) {
                        let discountPercentage = refferdByAtsignCommissionDetails.value.discountOfferedPercentage <= refferdByAtsignCommissionDetails.value.commissionPercentage ? refferdByAtsignCommissionDetails.value.discountOfferedPercentage : refferdByAtsignCommissionDetails.value.commissionPercentage
                        const maxDiscountByCurrency = (refferdByAtsignCommissionDetails.value && refferdByAtsignCommissionDetails.value.maxDiscountAmount) ? refferdByAtsignCommissionDetails.value.maxDiscountAmount * (inCents ? 100 : 1) : 0
                        if(maxDiscountByCurrency){
                            finalDiscountDetails.finalDiscountPercentage = (((maxDiscountByCurrency  * 100)/ orderAmount)  > refferdByAtsignCommissionDetails.value.discountOfferedPercentage ? refferdByAtsignCommissionDetails.value.discountOfferedPercentage : ((maxDiscountByCurrency  * 100)/ orderAmount))//.toFixed(3);
                            finalDiscountDetails.finalOrderAmount = ((orderAmount * discountPercentage) / 100)  > maxDiscountByCurrency ?orderAmount - maxDiscountByCurrency : orderAmount - ((orderAmount * discountPercentage) / 100)
                        }else{
                            finalDiscountDetails.finalOrderAmount = orderAmount - ((orderAmount * discountPercentage) / 100)
                            finalDiscountDetails.finalDiscountPercentage = discountPercentage
                        }
                    }
                }
            }
        }
        return finalDiscountDetails
    } catch (error) {
        logError(error)
        return finalDiscountDetails
    }
}



//

const getCommercialAtsign = async function (filter, sortBy, pageNo, limit) {

    try {
        const commercialAtsignPromise = await Promise.all([CommertialAtsignService.getCommercialAtsign(filter, sortBy, pageNo, limit), CommertialAtsignService.countCommercialAtsign(filter)])
        let error = commercialAtsignPromise[0].error || commercialAtsignPromise[1].error
        if (error) {
            return { error }
        }
        else {
            return {
                value: {
                    records: commercialAtsignPromise[0].value,
                    total: commercialAtsignPromise[1].value,
                    pageNo,
                    limit
                }
            }
        }

    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}

//// save Commercia lAtsign
const postCommercialAtsign = async function (data) {

    try {
        if (!data.atsign) {
            return { error: { type: 'info', message: messages.INVALID_REQ_BODY } }
        }

        const user = await UserService.getUserByAtsign(data.atsign);
        if (user && user._id) {
            const commercialAtsigns = await CommertialAtsignService.postCommercialAtsign(data.atsign, data.commissionPercentage, data.discountOfferedPercentage, data.maxDiscountAmount, user._id)
            if (commercialAtsigns.value) {
                return { value: { 'saved': commercialAtsigns.value } }
            } else {
                return { error: commercialAtsigns.error }
            }
        } else {
            return { error: { type: 'info', message: messages.INVALID_REQ_BODY } }
        }

    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}

//// delete Commercia lAtsign
const deleteCommercialAtsign = async function (id) {
    try {
        const commercialAtsigns = await CommertialAtsignService.deleteCommercialAtsign(id)
        if (commercialAtsigns.value) {
            return { value: { 'delete': commercialAtsigns.value } }
        } else {
            return { error: commercialAtsigns.error }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}

////  get atsign details
const getCommercialAtsignDetals = async function (id) {
    try {
        const commercialAtsigns = await CommertialAtsignService.getCommercialAtsignDetals(id)
        if (commercialAtsigns.value) {
            return { value: { 'atsignDetails': commercialAtsigns.value } }
        } else {
            return { error: commercialAtsigns.error }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}

//// update Commercial Atsign
const updateCommercialAtsign = async function (id, details) {
    try {
        const commercialAtsigns = await CommertialAtsignService.updateCommercialAtsign(id, details)

        if (commercialAtsigns.value) {
            return { value: { 'updated': commercialAtsigns.value } }
        } else {
            return { error: commercialAtsigns.error }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}
// commission api 
const getCommercialAtsignCommissionDetails = async function (filter, sortBy, pageNo, limit) {
    try {
        const commissionDetailPromise = await Promise.all([CommissionService.getCommercialAtsignCommissionDetails(filter, sortBy, pageNo, limit), CommissionService.countCommercialAtsignCommissionDetails(filter)]);
        let error = commissionDetailPromise[0].error || commissionDetailPromise[1].error
        if (error) {
            return { error: error }
        } else {
            // await Promise.all(commissionDetailPromise[0].value.map(async function(commissionDetails){
            //     let atsignFilter = filter ? filter : {}
            //     atsignFilter['atsign'] =  { '$regex': `^${commissionDetails._id}$`, '$options': 'i' }
            //     atsignFilter['status'] = 'success';
            //     const successCommissionDetails = await CommissionService.getCommercialAtsignCommissionDetails(atsignFilter,null,1,1)
            //     commissionDetails['totalCommissionPaid'] = successCommissionDetails.value && successCommissionDetails.value[0] && successCommissionDetails.value[0].totalFinalCommission ? successCommissionDetails.value[0].totalFinalCommission : 0
            //     return commissionDetails
            // }))
            return {
                value: {
                    records: commissionDetailPromise[0].value,
                    total: commissionDetailPromise[1].value,
                    pageNo,
                    limit
                }
            }
        }

    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}


// get atsign reports details... 

const getCommercialReportsDetailsByAtsign = async function (atsign, limit, pageNo, sortBy) {
    try {
        const commissionDetailPromise = await Promise.all([CommissionService.getCommercialReportsDetailsByAtsign(atsign, limit, pageNo, sortBy), CommissionService.countCommercialRepotsReportByAtsign(atsign)]);
        let error = commissionDetailPromise[0].error || commissionDetailPromise[1].error
        if (error) {
            return { error: error }
        } else {
            return {
                value: {
                    records: commissionDetailPromise[0].value,
                    total: commissionDetailPromise[1].value,
                    pageNo,
                    limit
                }
            }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}

const approveCommissionByAtsign = async function (currentUser, atsign, approveTillTime, transactionId) {
    try {
        if (atsign && approveTillTime && transactionId) {
            let response = {};
            const { error, value } = await CommissionService.approveAndGetCommissionByAtsign(atsign, approveTillTime, transactionId);
            if (value) {
                const commisionTransaction = await CommissionTransactionService.addCommissionTransaction({
                    userId: value.userId,
                    atsign: value._id,
                    transactionId: transactionId,
                    totalOrderAmount: value.totalOrderAmount,
                    totalFinalCommission: value.totalFinalCommission,
                    currency: value.currency
                }, false, true)
                if (commisionTransaction.error) {
                    await CommissionService.rollBackApprovedCommissionByTransactionId(transactionId)
                    return { error: commisionTransaction.error }
                } else {
                    let currentUserData = await UserService.getUserById(currentUser)
                    let atsignUser = await UserService.getUserById(value.userId);
                    let cc_email;
                    if (process.env.ATSIGN_COMMISSION_GROUP) {
                        cc_email = [{ email: process.env.ATSIGN_COMMISSION_GROUP }, { email: currentUserData.email }]
                    }
                    else {
                        cc_email = currentUserData.email
                    }
                    var data = {
                        //name of the email template that we will be using
                        templateName: "commission_approve",
                        receiver: process.env.ATSIGN_COMMISSION_MANAGER_EMAIL || 'ashish@atsign.com',
                        dynamicdata: {
                            "atsign": value._id,
                            "transactionId": transactionId,
                            "totalOrderAmount": value.totalOrderAmount,
                            "totalFinalCommission": value.totalFinalCommission,
                            "currency": value.currency,
                            "accountsname": process.env.ATSIGN_COMMISSION_MANAGER_NAME || 'Ashish',
                            "atsignEmail": atsignUser.email,
                            "commissionpaidtill": moment(approveTillTime).format("MM/DD/YYYY hh:mm a")
                        },
                        "cc_email": cc_email
                    };
                    mail.sendEmailSendGrid(data);
                    response = { ...value }
                    return { value }
                }
            } else {
                return { error }
            }
        } else {
            return { error: { type: 'info', message: messages.INVALID_REQ_BODY } }
        }
    } catch (error) {
        await CommissionService.rollBackApprovedCommissionByTransactionId(transactionId)
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}

const isCommercialAtsign = async  function(atsign){
    const {error,value} = await CommertialAtsignService.isCommercialAtsign(atsign)
    return {error,value}
}

const getCommercialAtsignCommissionByUser = async function (req, res) {
    let pageNo = req.query.pageNo && Number(req.query.pageNo) > 0 ? Number(req.query.pageNo) : 1
    let limit = req.query.limit && Number(req.query.limit) > 0 ? Number(req.query.limit) : 1000//Need to check todo
    let filter = req.query.searchTerm ? { atsign: { '$regex': `^${req.query.searchTerm}`, '$options': 'i', userId: req._id } } : {userId: req._id}
    let sortBy = req.query.sortBy ? { [req.query.sortBy]: req.query.sortOrder == 'desc' ? -1 : 1 } : null
    let { error, value } = await getCommercialAtsignCommissionDetails(filter, sortBy, pageNo, limit);

    if (value) {
        return res.status(200).json({ status: 'success', message: messages.SAVED_SUCCESSFULLY, data: value })
    } else {
        if (error.type == 'info') {
            res.status(200).json({ status: 'error', message: error.message })
        } else {
            logError(error.data, req)
            res.status(200).send({ status: 'error', message: messages.SOMETHING_WRONG_RETRY });
        }
    }
}

const getCommissionRepotsDetailsByUser = async function (req, res) {
    let pageNo = req.query.pageNo && Number(req.query.pageNo) > 0 ? Number(req.query.pageNo) : 1
    let limit = req.query.limit && Number(req.query.limit) > 0 ? Number(req.query.limit) : 10
    // let filter = req.query.searchTerm ? { atsign: { '$regex': `^${req.query.searchTerm}`, '$options': 'i', userId: req._id } } : null
    let filter  = { userId: req._id };
    let to = moment();
    let from = moment().subtract(1, 'month');

    if (req.query.fromDate && req.query.toDate) {
        from = moment(new Date(req.query.fromDate));
        to = moment(new Date(req.query.toDate)); 
    }

    let fromDate = new Date(from.year(), from.month(), from.date(), 0, 0, 0);
    let toDate = new Date(to.year(), to.month(), to.date(), 23, 59, 60);
    filter["createdAt"] = { $gte: fromDate, $lte: toDate };

    let sortBy = req.query.sortBy ? { [req.query.sortBy]: req.query.sortOrder == 'desc' ? -1 : 1 } : null
    try {
        let commissionDetailPromise = await Promise.all([CommissionService.getCommissionRepotsDetailsByUser(filter, limit, pageNo, sortBy), CommissionService.countCommissionRepotsDetailsByUser(filter)]);
        console.log(commissionDetailPromise);
        let error = commissionDetailPromise[0].error || commissionDetailPromise[1].error
        if (error) {
            if (error.type == 'info') {
                res.status(200).json({ status: 'error', message: error.message })
            } else {
                logError(error.data, req)
                res.status(200).send({ status: 'error', message: messages.SOMETHING_WRONG_RETRY });
            }
        } else {
            return res.status(200).json({ status: 'success', message: messages.SAVED_SUCCESSFULLY, data: {
                records: commissionDetailPromise[0].value.map(commissionDetail=>{
                    return {
                        "status":commissionDetail.status,
                        "atsign":commissionDetail.atsign,
                        "commissionOfferedPercentage":commissionDetail.commissionOfferedPercentage,
                        "discountOfferedPercentage":commissionDetail.discountOfferedPercentage,
                        "paidAmount":commissionDetail.paidAmount,
                        "finalCommission":commissionDetail.finalCommission,
                        "currency":commissionDetail.currency,
                        "orderAmount":commissionDetail.orderAmount,
                        "updatedAt":commissionDetail.updatedAt,
                        "createdAt":commissionDetail.createdAt,
                        "orderData" : {
                            orderId: commissionDetail.metadata.orderId,
                            commsionForUserId: commissionDetail.metadata.commsionForUserId,
                            atsignDetails: commissionDetail.metadata.orderData ? commissionDetail.metadata.orderData.reduce((acc,atsignDetail)=>{
                                acc[atsignDetail.originalAmount] = acc[atsignDetail.originalAmount] ? acc[atsignDetail.originalAmount] + 1 : 1;
                               return acc
                               },{}):[],
                        }
                    }
                }),
                total: commissionDetailPromise[1].value,
                pageNo,
                limit
            } })
        }

    } catch (error) {
        res.status(200).send({ status: 'error', message: messages.SOMETHING_WRONG_RETRY });
    }
}


module.exports = {
    checkAndProvideCommission,
    getDiscountDetails,
    getCommercialAtsign,
    postCommercialAtsign,
    deleteCommercialAtsign,
    getCommercialAtsignDetals,
    updateCommercialAtsign,
    getCommercialAtsignCommissionDetails,
    // getCommercialRepotsDetails,
    approveCommissionByAtsign,
    isCommercialAtsign,
    getCommercialReportsDetailsByAtsign,
    approveCommissionByAtsign,
    getCommercialAtsignCommissionByUser,
    getCommissionRepotsDetailsByUser
}