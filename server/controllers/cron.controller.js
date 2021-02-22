
const CronService = require('./../services/cron.service')
const GiftUpController = require('./gift-up.controller')
const UserController = require('./user.controller')
const TransferAtsignController = require('./transfer-atsign.controller')
const logError = require('./../config/handleError');
const axios = require('axios');
const logger = require('../config/log');


const isCronExecutable = async function (cron, isForced) {
    if (isForced == 'forced') return { value: { status: true } }
    const curDate = new Date()
    const date = curDate.getDate() + '-' + curDate.getMonth() + '-' + curDate.getFullYear()
    const datetime = curDate.getDate() + '-' + curDate.getMonth() + '-' + curDate.getFullYear() + '-' + curDate.getHours() + '-' + curDate.getMinutes() + '-' + curDate.getSeconds()
    switch (cron) {
        case 'pre60': return CronService.isCronExecutable('pre60', date);
        case 'current': return CronService.isCronExecutable('current', date);
        case 'past30': return CronService.isCronExecutable('past30', date);
        case 'past60': return CronService.isCronExecutable('past60', date);
        case 'past61': return CronService.isCronExecutable('past61', date);
        case 'transfer_past30': return CronService.isCronExecutable('past30', date);
        case 'transfer_past59': return CronService.isCronExecutable('past60', date);
        case 'transfer_past60': return CronService.isCronExecutable('past61', date);
        case 'promo-code': return CronService.isCronExecutable('promo-code', datetime);
        case 'secondary': return CronService.isCronExecutable('secondary', date);
    }
}
const sendRenewalNotificationPre60 = async function (req, res) {
    const cronExecutableScript = await isCronExecutable('pre60', req.params.forced)
    if (cronExecutableScript.error) {
        return res.status(400).json({ status: 'error', message: cronExecutableScript.error.message })
    }
    if (cronExecutableScript.value.status === true) {
        UserController.sendRenewalNotification()
            .then(function () {
                if (cronExecutableScript.value.data && cronExecutableScript.value.data._id) CronService.updateStatus(cronExecutableScript.value.data._id)
            })
            .catch(function (error) {
                logError(error)
            })
        return res.status(200).json({ status: 'success', message: 'Executing', data: cronExecutableScript.value.data })
    } else {
        res.status(400).json({ status: 'error', message: 'Cron is either executed or in scheduling state', data: cronExecutableScript.value.data })
    }
}
const sendRenewalNotificationCurrent = async function (req, res) {
    const cronExecutableScript = await isCronExecutable('current', req.params.forced)
    if (cronExecutableScript.error) {
        return res.status(400).json({ status: 'error', message: cronExecutableScript.error.message })
    }
    if (cronExecutableScript.value.status === true) {
        UserController.sendRenewalNotificationCurrent()
            .then(function () {
                if (cronExecutableScript.value.data && cronExecutableScript.value.data._id) CronService.updateStatus(cronExecutableScript.value.data._id)
            })
            .catch(function (error) {
                logError(error)
            })
        return res.status(200).json({ status: 'success', message: 'Executing' })
    } else {
        res.status(400).json({ status: 'error', message: 'Cron is either executed or in scheduling state', data: cronExecutableScript.value.data })
    }
}
const sendRenewalNotificationPast30 = async function (req, res) {
    const cronExecutableScript = await isCronExecutable('past30', req.params.forced)
    if (cronExecutableScript.error) {
        return res.status(400).json({ status: 'error', message: cronExecutableScript.error.message })
    }
    if (cronExecutableScript.value.status === true) {
        UserController.sendRenewalNotificationPast30()
            .then(function () {
                if (cronExecutableScript.value.data && cronExecutableScript.value.data._id) CronService.updateStatus(cronExecutableScript.value.data._id)
            })
            .catch(function (error) {
                logError(error)
            })
        return res.status(200).json({ status: 'success', message: 'Executing' })
    } else {
        res.status(400).json({ status: 'error', message: 'Cron is either executed or in scheduling state', data: cronExecutableScript.value.data })
    }
}
const sendRenewalNotificationPast60 = async function (req, res) {
    const cronExecutableScript = await isCronExecutable('past60', req.params.forced)
    if (cronExecutableScript.error) {
        return res.status(400).json({ status: 'error', message: cronExecutableScript.error.message })
    }
    if (cronExecutableScript.value.status === true) {
        UserController.sendRenewalNotificationPast60()
            .then(function () {
                if (cronExecutableScript.value.data && cronExecutableScript.value.data._id) CronService.updateStatus(cronExecutableScript.value.data._id)
            })
            .catch(function (error) {
                logError(error)
            })
        return res.status(200).json({ status: 'success', message: 'Executing' })
    } else {
        res.status(400).json({ status: 'error', message: 'Cron is either executed or in scheduling state', data: cronExecutableScript.value.data })
    }
}
const sendRenewalNotificationPast61 = async function (req, res) {
    const cronExecutableScript = await isCronExecutable('past61', req.params.forced)
    if (cronExecutableScript.error) {
        return res.status(400).json({ status: 'error', message: cronExecutableScript.error.message })
    }
    if (cronExecutableScript.value.status === true) {
        UserController.sendRenewalNotificationPast61()
            .then(function () {
                if (cronExecutableScript.value.data && cronExecutableScript.value.data._id) CronService.updateStatus(cronExecutableScript.value.data._id)
            })
            .catch(function (error) {
                logError(error)
            })
        return res.status(200).json({ status: 'success', message: 'Executing' })
    } else {
        res.status(400).json({ status: 'error', message: 'Cron is either executed or in scheduling state', data: cronExecutableScript.value.data })
    }
}
const sendTransferNotificationPast30 = async function (req, res) {
    const cronExecutableScript = await isCronExecutable('transfer_past30', req.params.forced)
    if (cronExecutableScript.error) {
        return res.status(400).json({ status: 'error', message: cronExecutableScript.error.message })
    }
    if (cronExecutableScript.value.status === true) {
        TransferAtsignController.expireAtsignScript('30_DAY_REMINDER')
            .then(function () {
                if (cronExecutableScript.value.data && cronExecutableScript.value.data._id) CronService.updateStatus(cronExecutableScript.value.data._id)
            })
            .catch(function (error) {
                logError(error)
            })
        return res.status(200).json({ status: 'success', message: 'Executing' })
    } else {
        res.status(400).json({ status: 'error', message: 'Cron is either executed or in scheduling state', data: cronExecutableScript.value.data })
    }
}
const sendTransferNotificationPast59 = async function (req, res) {
    const cronExecutableScript = await isCronExecutable('transfer_past59', req.params.forced)
    if (cronExecutableScript.error) {
        return res.status(400).json({ status: 'error', message: cronExecutableScript.error.message })
    }
    if (cronExecutableScript.value.status === true) {
        TransferAtsignController.expireAtsignScript('59_DAY_REMINDER')
            .then(function () {
                if (cronExecutableScript.value.data && cronExecutableScript.value.data._id) CronService.updateStatus(cronExecutableScript.value.data._id)
            })
            .catch(function (error) {
                logError(error)
            })
        return res.status(200).json({ status: 'success', message: 'Executing' })
    } else {
        res.status(400).json({ status: 'error', message: 'Cron is either executed or in scheduling state', data: cronExecutableScript.value.data })
    }
}
const expireTransferPast60 = async function (req, res) {
    const cronExecutableScript = await isCronExecutable('transfer_past60', req.params.forced)
    if (cronExecutableScript.error) {
        return res.status(400).json({ status: 'error', message: cronExecutableScript.error.message })
    }
    if (cronExecutableScript.value.status === true) {
        TransferAtsignController.expireAtsignScript('60_DAY_EXPIRE')
            .then(function () {
                if (cronExecutableScript.value.data && cronExecutableScript.value.data._id) CronService.updateStatus(cronExecutableScript.value.data._id)
            })
            .catch(function (error) {
                logError(error)
            })
        return res.status(200).json({ status: 'success', message: 'Executing' })
    } else {
        res.status(400).json({ status: 'error', message: 'Cron is either executed or in scheduling state', data: cronExecutableScript.value.data })
    }
}

const executePromoCodeScript = async function (req, res) {
    const cronExecutableScript = await isCronExecutable('promo-code', req.params.forced)
    if (cronExecutableScript.error) {
        return res.status(400).json({ status: 'error', message: cronExecutableScript.error.message })
    }
    if (cronExecutableScript.value.status === true) {
        GiftUpController.undoAwaitedTransaction()
            .then(function (data) {
                if (cronExecutableScript.value.data && cronExecutableScript.value.data._id) CronService.updateStatus(cronExecutableScript.value.data._id)
            })
            .catch(function (error) {
                logError(error)
            })
        return res.status(200).json({ status: 'success', message: 'Executing' })
    } else {
        res.status(400).json({ status: 'error', message: 'Cron is either executed or in scheduling state', data: cronExecutableScript.value.data })
    }

}

const getCronDetails = async function (req, res) {
    const cronExecutableScript = await CronService.getCronDetails(req.body.find || {}, req.body.limit || 25, req.body.sort || {})
    if (cronExecutableScript.error) {
        return res.status(400).json({ status: 'error', message: cronExecutableScript.error.message })
    }
    return res.status(200).json({ status: 'success', data: cronExecutableScript.value })
}


const checkSecondaryStarted = async function (atsign) {
    const result = await axios({
        method: 'post',
        url: process.env.REGISTRAR_CHECK,
        data: { atsign: atsign },
        headers: { authorization: process.env.REGISTRAR_INFRA_TOKEN, 'content-type': 'application/json; charset=utf-8' }
    });
    return (result.status == 200 && result.data && result.data.data) ? true : false
}
const checkAtsignQueueIndex = async function (atsign, attemptCount) {
    const result = await axios({
        method: 'post',
        url: process.env.INFRASTRUCTUR_QUEUE_STATUS,
        data: { atsign: atsign },
        headers: { authorization: process.env.REGISTRAR_NODE_TOKEN, 'content-type': 'application/json; charset=utf-8' }
    })
    return result.status == 200 && result.data && result.data.data ? result.data.data.index : -1
}
const deleteSecondary = async function (atsign) {
    const result = axios({
        method: 'post',
        url: process.env.REGISTRAR_DELETE,
        data: { atsign: atsign },
        headers: { authorization: process.env.REGISTRAR_NODE_TOKEN, 'content-type': 'application/json; charset=utf-8' }
    })
    return
}

const validateSecondaryStarted = async function (atsign, cronValue) {
    let api = ''
    let checkCountInterval = null
    try {
        let timeoutTime = 2 * 60 * 1000
        let intervalTime = 1 * 60 * 1000
        setTimeout(async () => {
            api = process.env.REGISTRAR_CHECK;
            const isSecondaryStarted = await checkSecondaryStarted(atsign)
            if (isSecondaryStarted) {
                api = process.env.REGISTRAR_DELETE
                await deleteSecondary(atsign)

                if (cronValue.data && cronValue.data._id) CronService.updateStatus(cronValue.data._id)
                return;
            } else {
                let currentQueueIndex = 100000
                let attemptCount = 5
                checkCountInterval = setInterval(async () => {
                    if (attemptCount == 0) {
                        clearInterval(checkCountInterval)
                        throw Error('Unable to start secondary')
                    }
                    api = process.env.INFRASTRUCTUR_QUEUE_STATUS
                    let checkedCount = await checkAtsignQueueIndex(atsign, attemptCount)
                    attemptCount = attemptCount - 1
                    if (checkedCount < currentQueueIndex) {
                        currentQueueIndex = checkedCount
                        attemptCount = 5
                    }
                    if (checkedCount == -1) {
                        clearInterval(checkCountInterval)
                        const isSecondaryStarted = await checkSecondaryStarted(atsign)
                        if (isSecondaryStarted) {
                            api = process.env.REGISTRAR_DELETE
                            await deleteSecondary(atsign)
                            if (cronValue.data && cronValue.data._id) CronService.updateStatus(cronValue.data._id)
                            return;
                        } else {
                            throw Error('Unable to start secondary')
                        }
                    }
                }, intervalTime);
                return;
            }
        }, timeoutTime);
    } catch (error) {
        if (checkCountInterval) {
            clearInterval(checkCountInterval)
        }
        if (error.response) logError(Error(JSON.stringify({ status: error.response.status, statusText: error.response.statusText, api: process.env.REGISTRAR_ASSIGN })))
        else logError(error)
    }
}

const checkSecondary = async function (req, res) {
    let api = ''
    const createSecondaryPayload = {
        method: 'post',
        url: process.env.REGISTRAR_ASSIGN,
        data: { atsign: 'killdev123' },
        headers: { authorization: process.env.REGISTRAR_NODE_TOKEN, 'content-type': 'application/json; charset=utf-8' }
    }
    try {
        const cronExecutableScript = await isCronExecutable('secondary', req.params.forced)
        if (cronExecutableScript.error) {
            return res.status(400).json({ status: 'error', message: cronExecutableScript.error.message })
        }
        if (cronExecutableScript.value.status === true) {
            api = createSecondaryPayload.url
            const createSecondary = await axios(createSecondaryPayload);
            if (createSecondary.data['QRcode']) {
                validateSecondaryStarted(createSecondaryPayload.data.atsign, cronExecutableScript.value)
                res.send({ status: 'success', message: 'Executing' })
            } else {
                logError(Error('Unable to create secondary server'))
                res.send({ status: 'error', message: 'Unable to create secondary server' })
            }
        } else {
            res.status(400).json({ status: 'error', message: 'Cron is either executed or in scheduling state', data: cronExecutableScript.value.data })
        }
    } catch (error) {
        if (error.response) logError(Error(JSON.stringify({ status: error.response.status, statusText: error.response.statusText, api: api })))
        else logError(error)
    }
}
// checkSecondary({ params: {} }, { status: () => { return { json: console.log } }, json: console.log })


module.exports = {
    sendRenewalNotificationPre60,
    sendRenewalNotificationCurrent,
    sendRenewalNotificationPast30,
    sendRenewalNotificationPast60,
    sendRenewalNotificationPast61,
    executePromoCodeScript,
    getCronDetails,
    checkSecondary,
    sendTransferNotificationPast30,
    sendTransferNotificationPast59,
    expireTransferPast60
}