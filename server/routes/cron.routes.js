const CronController = require('../controllers/cron.controller');
const CronMiddleware = function (req, res, next) {
    if (req.headers.authorization && req.headers.authorization == '@t$ign_5cRipt') {
        next()
    } else {
        res.status(401).json({ status: 'error', message: "Unauthoized" })
    }
}
const registerRoutes = function (router) {
    router.get('/cron/renewal/pre60/:forced?',CronMiddleware, CronController.sendRenewalNotificationPre60);
    router.get('/cron/renewal/current/:forced?',CronMiddleware, CronController.sendRenewalNotificationCurrent);
    router.get('/cron/renewal/past30/:forced?',CronMiddleware, CronController.sendRenewalNotificationPast30);
    router.get('/cron/renewal/past60/:forced?',CronMiddleware, CronController.sendRenewalNotificationPast60);
    router.get('/cron/renewal/past61/:forced?',CronMiddleware, CronController.sendRenewalNotificationPast61);
    router.get('/cron/payment/promo-code/:forced?',CronMiddleware, CronController.executePromoCodeScript);
    router.get('/cron/secondary/:forced?',CronMiddleware, CronController.checkSecondary);
    router.post('/cron',CronMiddleware, CronController.getCronDetails);
}

module.exports = { registerRoutes }