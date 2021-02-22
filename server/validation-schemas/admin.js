const { Joi } = require('celebrate');
const { validationSchemas } = require('./../config/const')
const { enableWaitListSchemaMsg } = validationSchemas.admin

const enableWaitListSchema = {
    body: Joi.object().keys({
        value: Joi.number().error(Error(enableWaitListSchemaMsg.keyErrorMsg)),
    })
}

module.exports = {
    enableWaitListSchema
}