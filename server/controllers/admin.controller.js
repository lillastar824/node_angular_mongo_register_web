const userService = require('../services/user.service');
const reportsService = require('../services/reports.service');
const atsignService = require('../services/atsign.service');
const UtilityFunctions = require('../config/UtilityFunctions');
const { messages } = require('../config/const');
const logError = require('../config/handleError');
const CommissionController = require('../controllers/commission.controller');
const TransferAtsignController = require('../controllers/transfer-atsign.controller');
const AtsignDetailController = require('../controllers/atsign-detail.controller');
const GiftUpController = require('../controllers/gift-up.controller');
const { fstat ,createReadStream , createWriteStream} = require('fs');
const AtsignConfigsController = require('../controllers/atsignconfigs.controller');
const InvitationController = require('../controllers/invitation.controller');
const UserController = require('../controllers/user.controller');
const PaymentController = require('./../controllers/payment.controller')

module.exports.getAllUsers = async (req, res) => {
    let paginationData = {};
    paginationData['pageSize'] = req.query.pageSize ? req.query.pageSize : 25;
    paginationData['pageNo'] = req.query.pageNo ? req.query.pageNo : 1;
    paginationData['sortBy'] = req.query.sortBy;
    paginationData['sortOrder'] = req.query.sortOrder;
    paginationData['searchTerm'] = UtilityFunctions.escapeRegExp(decodeURIComponent(req.query.searchTerm))

    let userData = await userService.getAllUsersData(paginationData);
    if (typeof (userData) === 'object') {
        return res.status(200).json({ status: true, user: userData });
    } else {
        res.status(404).send({ status: false, message: messages.NO_RECORD_FOUND });
    }
}

module.exports.getUsersForReport = async (req, res) => {
    let startdate = new Date(req.body.fromDate);
    let lastdate = new Date(req.body.toDate);
    lastdate.setHours(23, 59, 59, 999);
    let paginationData = {};
    paginationData['pageSize'] = req.body.pageSize ? req.body.pageSize : 25;
    paginationData['pageNo'] = req.body.pageNo ? req.body.pageNo : 1;
    paginationData['sortBy'] = req.body.sortBy;
    paginationData['sortOrder'] = req.body.sortOrder;
    paginationData['atsignType'] = req.body.atsignType;
    paginationData['startdate'] = startdate;
    paginationData['lastdate'] = lastdate;
    paginationData['csv'] = req.body.csv;
    let data = null
    if(paginationData['atsignType'] === 'promo-code'){
        data = await PaymentController.getPromoCodeReport(paginationData);
    }else{
        data = await reportsService.getUsersForReport(paginationData);
    }
    
    if (paginationData['csv'] === 'all') {
        res.setHeader('content-type', 'text/csv');
        res.setHeader('content-disposition', 'attachment; filename='+data.fileName);
        res.setHeader('file-name', data.fileName);
        res.setHeader('Access-Control-Expose-Headers', 'file-name');
        var readStream = createReadStream(data.filePath);
        readStream.pipe(res)
    }
    else if (typeof (data) === 'object') {
        return res.status(200).json({ status: true, ...data });
    } else if (typeof (data) === 'string' && data === 'Unauthorized') {
        res.status(422).send({ message: messages.UNAUTH });
    } else {
        res.status(404).send({ status: false, message: messages.NO_RECORD_FOUND });
    }
}

exports.getAllAtsigns = async (req, res) => {
    let paginationData = {};
    paginationData['pageSize'] = req.query.pageSize ? req.query.pageSize : 25;
    paginationData['pageNo'] = req.query.pageNo ? req.query.pageNo : 1;
    paginationData['sortBy'] = req.query.sortBy;
    paginationData['sortOrder'] = req.query.sortOrder;
    paginationData['atsignType'] = req.query.atsignType;
    paginationData['searchTerm'] = req.query.searchTerm;
    let allatsign = await atsignService.getAllAtsigns(paginationData);
    res.send(allatsign);
}

exports.addReserveAtsigns = async (req, res) => {
    const name = req.body.name.toLowerCase();
    const type = req.body.type;
    let data = await atsignService.addReserveAtsigns(name, type);
    if (data.status === 'logError') {
        res.status(422).send(data.error);
        logError(data.error, req);
    } else {
        res.send(data);
    }
}

exports.deleteSavedAtsign = async (req, res) => {
    let type = req.body.type;
    let id = req.body._id;
    let data = await atsignService.deleteSavedAtsign(id, type);
    if (data.status === 'logError') {
        logError(data.error, req);
        res.status(422).send(data.error);
    }
    else {
        res.send(data);
    }
}

exports.updateSavedAtsign = async (req, res) => {
    let id = req.body._id;
    let type = req.body.type;
    let name = req.body.name;
    let data = await atsignService.updateSavedAtsign(id, type, name);
    if (data.status === 'logError') {
        logError(data.error, req);
        res.status(422).send(data.error);
    }
    else {
        res.send(data);
    }
}
exports.changePassword = async (req, res) => {
    let id = req.body.fromGrid ? req.body.id : req._id;
    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;
    let confirmNewPassword = req.body.confirmNewPassword;
    let data = await userService.changePassword(id, oldPassword, newPassword, confirmNewPassword);
    if (data.status === 'logError') {
        logError(data.error, req);
        res.status(422).send(data.error);
    }
    else {
        res.send(data);
    }
}


//  commercial-atsign api 
exports.getCommercialAtsign = async (req, res) => {
    let pageNo = req.query.pageNo && Number(req.query.pageNo) > 0 ? Number(req.query.pageNo) : 1
    let limit = req.query.limit && Number(req.query.limit) > 0 ? Number(req.query.limit) : 10
    let filter = req.query.searchTerm ? { atsign: { '$regex': `^${req.query.searchTerm}`, '$options': 'i' } } : null
    let sortBy = req.query.sortBy ? { [req.query.sortBy]: req.query.sortOrder == 'desc' ? -1 : 1 } : null
    let { error, value } = await CommissionController.getCommercialAtsign(filter, sortBy, pageNo, limit);

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

// save Commercial Atsign
exports.postCommercialAtsign = async (req, res) => {
    let data = req.body;
    let { error, value } = await CommissionController.postCommercialAtsign(data);
    if (value) {
        return res.status(200).json({ status: 'success', message: messages.SUCCESSFULLY, data: value })
    } else {
        if (error.type == 'info') {
            res.status(200).json({ status: 'error', message: error.message })
        } else {
            logError(error.data, req)
            res.status(200).send({ status: 'error', message: messages.SOMETHING_WRONG_RETRY });
        }
    }
}

// delete atsign api
exports.deleteCommercialAtsign = async (req, res) => {
    let id = req.params.id;
    let data = await CommissionController.deleteCommercialAtsign(id);
    if (data.status === 'logError') {
        logError(data.error, req);
        res.status(422).send(data.error);
    }
    else {
        res.send(data);
    }
}


// get atsign destails bu ID
exports.getCommercialAtsignDetals = async (req, res) => {
    let id = req.params.id;
    let { error, value } = await CommissionController.getCommercialAtsignDetals(id);
    if (value) {
        return res.status(200).json({ status: 'success', message: messages.SUCCESSFULLY, data: value })
    } else {
        if (error.type == 'info') {
            res.status(200).json({ status: 'error', message: error.message })
        } else {
            logError(error.data, req)
            res.status(200).send({ status: 'error', message: messages.SOMETHING_WRONG_RETRY });
        }
    }
}

// update Commercial Atsign
exports.updateCommercialAtsign = async (req, res) => {
    let id = req.body._id;
    let detsils = req.body;
    let { error, value } = await CommissionController.updateCommercialAtsign(id, detsils);
    if (value) {
        return res.status(200).json({ status: 'success', message: messages.SUCCESSFULLY, data: value })
    } else {
        if (error.type == 'info') {
            res.status(200).json({ status: 'error', message: error.message })
        } else {
            logError(error.data, req)
            res.status(200).send({ status: 'error', message: messages.SOMETHING_WRONG_RETRY });
        }
    }
}

// commercial

exports.getCommercialAtsignCommissionDetails = async (req, res) => {
    let pageNo = req.query.pageNo && Number(req.query.pageNo) > 0 ? Number(req.query.pageNo) : 1
    let limit = req.query.limit && Number(req.query.limit) > 0 ? Number(req.query.limit) : 10
    let filter = req.query.searchTerm ? { atsign: { '$regex': `^${req.query.searchTerm}`, '$options': 'i' } } : null
    if(req.query.fromDate || req.query.endDate){
        filter['createdAt'] = {}
        if(req.query.fromDate){filter['createdAt'] = {$gte:new Date(req.query.fromDate)}}
        if(req.query.fromDate){filter['createdAt'] = {$lte:new Date(req.query.endDate)}}
    }
    let sortBy = req.query.sortBy ? { [req.query.sortBy]: req.query.sortOrder == 'desc' ? -1 : 1 } : null
    let { error, value } = await CommissionController.getCommercialAtsignCommissionDetails(filter, sortBy, pageNo, limit);
    if (value) {
        return res.status(200).json({ status: 'success', message: messages.SUCCESSFULLY, data: value })
    } else {
        if (error.type == 'info') {
            res.status(200).json({ status: 'error', message: error.message })
        } else {
            logError(error.data, req)
            res.status(200).send({ status: 'error', message: messages.SOMETHING_WRONG_RETRY });
        }
    }
}

// get atsign reports details... 

exports.getCommercialReportsDetailsByAtsign = async (req, res) => {
    let atsign = req.params.atsign;
    let pageNo = req.query.pageNo && Number(req.query.pageNo) > 0 ? Number(req.query.pageNo) : 1
    let limit = req.query.limit && Number(req.query.limit) > 0 ? Number(req.query.limit) : 10
    let sortBy = req.query.sortBy ? { [req.query.sortBy]: req.query.sortOrder == 'desc' ? -1 : 1 } : null

    let { error, value } = await CommissionController.getCommercialReportsDetailsByAtsign(atsign, limit, pageNo, sortBy);
    if (value) {
        return res.status(200).json({ status: 'success', message: messages.SUCCESSFULLY, data: value })
    } else {
        if (error.type == 'info') {
            res.status(200).json({ status: 'error', message: error.message })
        } else {
            logError(error.data, req)
            res.status(200).send({ status: 'error', message: messages.SOMETHING_WRONG_RETRY });
        }
    }
}

exports.approveCommissionByAtsign = async (req, res) => {
    if (!req.body.atsign) return res.status(200).send({ status: 'error', message: messages.INVALID_REQ_BODY });
    const transactionId = UtilityFunctions.generateOrderId(), currentTime = (new Date());
    const { error, value } = await CommissionController.approveCommissionByAtsign(req._id, req.body.atsign, currentTime, transactionId);
    if (value) {
        return res.status(200).json({ status: 'success', message: messages.SUCCESSFULLY, data: value })
    } else {
        if (error.type == 'info') {
            res.status(200).json({ status: 'error', message: error.message })
        } else {
            logError(error.data, req)
            res.status(200).send({ status: 'error', message: messages.SOMETHING_WRONG_RETRY });
        }
    }
}



// Enable-Wait-List
exports.enableWaitList = async (req, res) => {
    let toggleValue = req.body.value;
    let { error, value } = await AtsignConfigsController.enableWaitList(toggleValue);
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


exports.getAdminConfigs = async (req, res) => {
    let { error, value } = await AtsignConfigsController.getConfigs();
    if (value) {
        return res.status(200).json({ status: 'success', message: messages.SUCCESSFULLY, data: value })
    } else {
        if (error.type == 'info') {
            res.status(200).json({ status: 'error', message: error.message })
        } else {
            logError(error.data, req)
            res.status(200).send({ status: 'error', message: messages.SOMETHING_WRONG_RETRY });
        }
    }
}

//all-transfer-atsign ..
exports.getAllTransferAtsigns = async (req, res) => {
    let pageNo = req.query.pageNo && Number(req.query.pageNo) > 0 ? Number(req.query.pageNo) : 1
    let limit = req.query.limit && Number(req.query.limit) > 0 ? Number(req.query.limit) : 10
    let filter = req.query.searchTerm ? { atsign: { '$regex': `^${req.query.searchTerm}`, '$options': 'i' } } : null
    let sortBy = req.query.sortBy ? { [req.query.sortBy]: req.query.sortOrder == 'desc' ? -1 : 1 } : null

    let { error, value } = await TransferAtsignController.getAllTransferAtsigns(filter, sortBy, pageNo, limit);

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
exports.sendInviteLink = async (req,res) => {
    InvitationController.sendInviteLink(req,res);
}
exports.addUserAtsign = async (req,res) => {
    InvitationController.addUserAtsign(req,res);
}
exports.transferUserAtsign = async (req,res) => {
    if(!req.body.email || !req.body.atsign) return res.send({status:'error',message:messages.INVALID_REQ_BODY})
    
    const atsignOwner = await UserController.getUserByAtsign(req.body.atsign)
    if(!atsignOwner) return res.send({status:'error',message:messages.INVALID_ATSIGN})
    const transferToUser =  await UserController.getUserByEmail(req.body.email)
    if(transferToUser.error){
        if (transferToUser.error.type == 'info') {
            return res.status(200).json({ status: "error", message: transferToUser.error.message })
        } else {
            logError(transferToUser.error.data, req)
            return res.status(200).json({ status: "error", message: messages.SOMETHING_WRONG_RETRY })
        }
    }
    if(!transferToUser.value) res.send({status:'error',message:messages.INVALID_EMAIL_PHONE})

    let { error, value } = await TransferAtsignController.transferAtsignInitialization(req.body.atsign, atsignOwner._id, transferToUser.value._id, req._id, transferPrice = 0);
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


exports.assignAtsignToUser = async (req,res) => {
    if(!req.body.email || !req.body.atsign) return res.send({status:'error',message:messages.INVALID_REQ_BODY})
    UserController.assignAtsignToUserByAdmin(req,res)
}
exports.getAdminAssignedAtsign = async (req,res) => {
    let pageNo = req.query.pageNo && Number(req.query.pageNo) > 0 ? Number(req.query.pageNo) : 1
    let limit = req.query.limit && Number(req.query.limit) > 0 ? Number(req.query.limit) : 10
    let filter = req.query.searchTerm ? { atsignName: { '$regex': `^${req.query.searchTerm}`, '$options': 'i' } } : {}
    let sortBy = req.query.sortBy ? { [req.query.sortBy]: req.query.sortOrder == 'desc' ? -1 : 1 } : null
    filter['assignedByAdmin'] = {"$exists":true}
    let { error, value } = await AtsignDetailController.getAdminAssignedAtsign(filter, sortBy, pageNo, limit);
    if (value) {
        if(value.records){
            value.records = await Promise.all(value.records.map(async record=>{
                const userDetail = await UserController.getUserById(record.userId)
                if(userDetail && userDetail.value && userDetail.value.email) record.email = userDetail.value.email
                return record;
            }))
        }
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



