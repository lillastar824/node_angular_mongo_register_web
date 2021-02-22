const NotificationsController = require('../controllers/notifications.controller');
const JwtHelper = require('../config/JwtHelper');

const registerRoutes = function (router) {
    router.get('/notifications', JwtHelper.verifyJwtToken, NotificationsController.getNotificationsByUser);
    router.get('/unreadNotifications', JwtHelper.verifyJwtToken, NotificationsController.getUnreadNotifications);
    router.post('/markNotificationsAsRead', JwtHelper.verifyJwtToken, NotificationsController.markNotificationsAsRead);
}

module.exports = {
    registerRoutes
}