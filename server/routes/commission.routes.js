const CommissionController = require('../controllers/commission.controller');

const { celebrate } = require('celebrate');

const JwtHelper = require('../config/JwtHelper');
const registerRoutes = function (router) {
    router.get('/user-commission/atsign', JwtHelper.verifyJwtToken,CommissionController.getCommercialAtsignCommissionByUser);
    router.get('/user-commission/',JwtHelper.verifyJwtToken, CommissionController.getCommissionRepotsDetailsByUser);
}

module.exports = {
    registerRoutes
}