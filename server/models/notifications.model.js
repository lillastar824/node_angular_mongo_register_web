const { interfaces } = require('mocha');
const mongoose = require('mongoose');

const NotificationTypes = {
    RENEWAL: Symbol("RENEWAL"),

};
Object.freeze(NotificationTypes);

const notificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    type: {
        type: NotificationTypes,
        required: true
    },
    data: {
        type: Object,
        required: true,
    },
    readAt: {
        type: Date,
        default: null
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    collection: 'notifications',
    timestamps: true
});

const Notifications = mongoose.model('Notifications', notificationSchema);

module.exports = {
    Notifications,
    NotificationTypes
}