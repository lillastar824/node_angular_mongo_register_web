const PaymentController = require('../controllers/payment.controller');
const JwtHelper = require('../config/JwtHelper');

const registerRoutes = function (router) {
    router.get('/stripepublishkey', JwtHelper.verifyJwtToken, PaymentController.stripepublishkey);
    router.post('/pay', JwtHelper.verifyJwtToken, PaymentController.stripePay);
    router.get('/check-paid-user', JwtHelper.verifyJwtToken, PaymentController.checkUserPaid);
    router.get('/check-logged-in-user', JwtHelper.verifyJwtToken, PaymentController.checkLoggedInUser);
    router.get('/payments', JwtHelper.verifyJwtToken, PaymentController.getUserPaymentDetails);
    router.post('/promotional-card-value', JwtHelper.verifyJwtToken, PaymentController.getPromotinalCardValue)
    router.post('/renew-atsigns', JwtHelper.verifyJwtToken, PaymentController.renewalAtsignsPayment);
}

module.exports = {
    registerRoutes
}