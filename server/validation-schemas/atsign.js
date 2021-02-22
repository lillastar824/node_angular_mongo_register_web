const { Joi } = require('celebrate');
const { validationSchemas } = require('./../config/const')
const { saveAtSignSchemaMsg } = validationSchemas.atsign

// const saveAtSignSchema = {
//     body: Joi.object().keys({
//         atsignName: Joi.string().error(Error(saveAtSignSchemaMsg.atsignNameErrorMsg)),
//         email: Joi.string().email().required().error(Error(saveAtSignSchemaMsg.emailErrorMsg)),
//         atsignType: Joi.string().required().valid('paid', 'free').error(Error(saveAtSignSchemaMsg.atsignTypeErrorMsg)),
//         inviteCode: Joi.string().required().error(Error(saveAtSignSchemaMsg.inviteCodeErrorMsg)),
//         isReserved: Joi.boolean().required().error(Error(saveAtSignSchemaMsg.isReservedErrorMsg)),
//     })
// }

module.exports = {
   // saveAtSignSchema,

}
