const Cron = require('./../models/cron.model')


const isCronExecutable = async function (cron, date) {
    try {
        let newCron = await Cron.create({ name: cron, date: date })
        return { value: { status: true, data: newCron } };
    } catch (error) {
        if (error.name === 'MongoError' && error.code === 11000) return { error: { type: 'info', message: 'Already executed' } }
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}
const updateStatus = async function (cronId) {
    try {
        let newCron = await Cron.findOneAndUpdate({ _id: cronId }, { status: 'SUCCESS' })
        return { value: { status: true, data: newCron } };
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}
const getCronDetails = async function (find, limit, sort) {
    try {
        let newCron = await Cron.find(find).sort(sort).limit(limit)
        return { value: { status: true, data: newCron } };
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
    }
}

module.exports = {
    isCronExecutable,
    updateStatus,
    getCronDetails
}