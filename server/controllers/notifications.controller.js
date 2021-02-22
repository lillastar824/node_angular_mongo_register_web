const Notifications = require('./../models/notifications.model').Notifications
const NotificationService = require('./../services/notifications.service')

const getNotificationsByUser = async function (req, res) {
    let userId = req._id;

    if (userId) {
        let { error, notifications } = await NotificationService.getNotifications(userId);

        if(error) {
            res.status(500).send({ status: 'error', message: "Failed to fetch the notifications" })
        } else {
            res.json(notifications);
        }

    } else {
        res.status(500).send({ status: 'error', message: "Userid is required" })
    }
}

const getUnreadNotifications = async function (req, res) {
    let userId = req._id;

    if (userId) {
        let { error, notifications } = await NotificationService.getUnreadNotifications(userId);

        if(error) {
            res.status(500).send({ status: 'error', message: "Failed to fetch the unread notifications" })
        } else {
            res.json(notifications);
        }

    } else {
        res.status(500).send({ status: 'error', message: "Userid is required" })
    }
}

const addNotification = async function (to, notificationType, notificationData) {
    const { error, value } = await NotificationService.addNotification(to, notificationType, notificationData)
    return { error, value }
}

const markNotificationsAsRead = async function (req, res) {
    let notifications = req.body;

    if (notifications.length > 0) {
        let { error, udpatedNotifications } = await NotificationService.markNotificationsAsRead(notifications);

        if(error) {
            res.status(500).send({ status: 'error', message: "Failed to update notifications as read" })
        } else {
            res.json(udpatedNotifications);
        }

    } else {
        res.status(500).send({ status: 'error', message: "no notifications found to update" })
    }
}

module.exports = {
    getNotificationsByUser,
    addNotification,
    getUnreadNotifications,
    markNotificationsAsRead
}