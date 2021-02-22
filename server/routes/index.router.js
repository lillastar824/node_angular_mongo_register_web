const express = require('express');
const router = express.Router();
const { celebrate } = require('celebrate');

const JwtHelper = require('../config/JwtHelper');

const AdminRoutes = require('./admin.routes')
AdminRoutes.registerRoutes(router)

const InvitationRoutes = require('./invitation.routes')
InvitationRoutes.registerRoutes(router)

const PaymentRoutes = require('./payment.routes')
PaymentRoutes.registerRoutes(router)

const AtsignRoutes = require('./atsign.routes')
AtsignRoutes.registerRoutes(router)

const UserRoutes = require('./user.routes')
UserRoutes.registerRoutes(router)

const NotificationRoutes = require('./notifications.routes')
NotificationRoutes.registerRoutes(router)

const GeneralRoutes = require('./general.routes')
GeneralRoutes.registerRoutes(router)

const CronRoutes = require('./cron.routes')
CronRoutes.registerRoutes(router)

const CommissionRoutes = require('./commission.routes');
CommissionRoutes.registerRoutes(router)

//routes for public data of social sites
const social = require('../controllers/social.controller');
router.get('/getTwitterProfile', social.getTwitterPublicProfile);


const HealthCheckController = require('../controllers/healthCheckup.controller');
router.get('/health', HealthCheckController.checkMongoConnectionStatus);

const TransferAtsignController = require('../controllers/transfer-atsign.controller');
router.post('/transfer-atsign', JwtHelper.verifyJwtToken, TransferAtsignController.transferAtsign)
router.put('/transfer-atsign/:transferId', JwtHelper.verifyJwtToken, TransferAtsignController.updateTransferAtsign)
router.get('/atsign-transfer-list', JwtHelper.verifyJwtToken, TransferAtsignController.getTransferAtsignOfUser)
router.put('/resend-transfer-notification/:transferId', JwtHelper.verifyJwtToken, TransferAtsignController.resendTransferNotifcationRoute)
router.get('/changeAtsignTransferTime/:atsign/:date', async function (req, res) {
    let result = await TransferAtsignController.changeAtsignTransferTime(req.params.atsign, new Date(req.params.date));
    res.send(result)
})

module.exports = router;