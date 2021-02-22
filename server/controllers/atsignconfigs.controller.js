const AtsignConfigsService = require('./../services/atsignconfigs.service')

// Enable-Wait-List
const enableWaitList = async function (toggleValue) {
    try {
        const waitList = await AtsignConfigsService.enableWaitList(toggleValue)
        if (waitList.value) {
            return { value: { 'enableWaitList': waitList.value } }
        } else {
            return { error: waitList.error }
        }
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}

const getConfigs = async function () {
    try {
        const configs = await AtsignConfigsService.getConfigs()
        return configs
    } catch (error) {
        return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
    }
}


module.exports = {
    enableWaitList,
    getConfigs
}