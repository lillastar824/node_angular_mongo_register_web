const AtsignController = require('./../controllers/atsign.controller');
const JwtHelper = require('../config/JwtHelper');

const registerRoutes = function (router) {
    router.post('/reserve-atsign', JwtHelper.verifyJwtToken, AtsignController.reserveatsign);
    router.put('/reserve-atsign', JwtHelper.verifyJwtToken, AtsignController.updateReserveAtsign);
    router.post('/purchase-free-atsign-cart', JwtHelper.verifyJwtToken, AtsignController.saveFreeOnlyCart);
    router.get('/cart-atsign-data', JwtHelper.verifyJwtToken, AtsignController.getCartData);
    router.post('/check-valid-atsign', AtsignController.checkValidAtsign);
    router.post('/atsign-advance-setting',JwtHelper.verifyJwtToken, AtsignController.updateAdvanceSetting);
    
    // --unused --need-to-check
    router.post('/deletereserveatsign', JwtHelper.verifyJwtToken, AtsignController.deleteReserveAtsign);
    router.post('/fetchreserveatsign', JwtHelper.verifyJwtToken, AtsignController.fetchReserveAtsign);
}

module.exports = { registerRoutes }