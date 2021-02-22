const Notifications = require('./../models/notifications.model').Notifications

const addNotification = async function (to, notificationType, notificationData) {
    try {
        const Notification = await Notifications.create({
            userId: to,
            type: notificationType,
            data: notificationData,
            readAt: null,
            deleted: false
        })
        return { value: Notification }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}

const getUnreadNotifications = async function (userId) {
    try {
        return { notifications: await Notifications.find({ userId: userId , readAt : null}).sort({createdAt:-1}) };
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}

const getNotifications = async function (userId) {
    try {
        return { notifications: await Notifications.find({ userId: userId }).sort({createdAt:-1}) };
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}

const markNotificationsAsRead = async function (notifications) {
    try {
        let ids = notifications.map((notification) => notification._id)
        let result  =  await Notifications.updateMany({ _id: { $in : ids} }, {$set : { readAt : Date.now()}});
        return { notifications: result };
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}

module.exports = { addNotification, getNotifications, getUnreadNotifications, markNotificationsAsRead }