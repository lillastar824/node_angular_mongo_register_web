const AtsignConfigs = require('./../models/atsignconfigs.model');
const { messages } = require('../config/const');

// Enable-Wait-List
const enableWaitList = async function (toggleValue) {
    try {
        if (toggleValue === 1 || toggleValue === 0) {
            const waitListData = await AtsignConfigs.findOneAndUpdate({ key: 'enable_waitlist' }, { $set: { key: 'enable_waitlist', value: toggleValue } }, { upsert: true, new: true });
            return { value: waitListData }
        } else {
            return { error: { type: 'info', message: messages.INVALID_TOGGLE_VALUE } }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}
const getConfigs = async function (toggleValue) {
    try {
        const configs = await AtsignConfigs.find();
        return { value: configs }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}



module.exports = {
    enableWaitList,
    getConfigs
}