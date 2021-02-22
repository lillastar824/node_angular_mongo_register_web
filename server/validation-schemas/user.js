const { Joi } = require('celebrate');
const { validationSchemas } = require('./../config/const')
const { sendInviteSchemaMsg, verifyContactSchemaMsg, sendVerificationCodeSchemaMsg, registerSchemaMsg, authenticateSchemaMsg, checkFriendInviteValidSchemaMsg,inviteUserByEmailSchemaMsg } = validationSchemas.user

const sendInviteSchema = {
    body: Joi.object().keys({
        email: Joi.string().email().required().error(Error(sendInviteSchemaMsg.emailErrorMsg)),
        atsign: Joi.string().allow('').error(Error(sendInviteSchemaMsg.atsignErrorMsg))
    })
}

const verifyContactSchema = {
    body: Joi.object().keys({
        email: Joi.string().email().allow("").error(Error(verifyContactSchemaMsg.emailErrorMsg)),
        contact: Joi.string().allow("").error(Error(sendVerificationCodeSchemaMsg.contactErrorMsg)),
        atsign: Joi.string().allow("").error(Error(sendVerificationCodeSchemaMsg.contactErrorMsg)),
        mobileOtp: Joi.string().error(Error(verifyContactSchemaMsg.mobileOtpErrorMsg)),
        isApplicationLogin: Joi.boolean().allow(""),
    })
}

const sendVerificationCodeSchema = {
    body: Joi.object().keys({
        email: Joi.string().email().required().error(Error(sendVerificationCodeSchemaMsg.emailErrorMsg)),
        contact: Joi.string().allow("").error(Error(sendVerificationCodeSchemaMsg.contactErrorMsg))
    })
}

// Need to configure
const registerSchema = {
    body: Joi.object().keys({
        fullName: Joi.string().required().error(Error(registerSchemaMsg.fullNameErrorMsg)),
        email: Joi.string().email().required().error(Error(registerSchemaMsg.emailErrorMsg)),
        password: Joi.string().required().error(Error(registerSchemaMsg.passwordErrorMsg)),
        secretkey: Joi.string().required().error(Error(registerSchemaMsg.secretkeyErrorMsg))
    })
}

const authenticateSchema = {
    body: Joi.object().keys({
        email: Joi.string().email().required().error(Error(authenticateSchemaMsg.emailErrorMsg)),
        password: Joi.string().required().error(Error(authenticateSchemaMsg.passwordErrorMsg))
    })
}

const checkFriendInviteValidSchema = {
    body: Joi.object().keys({
        friendInviteCode: Joi.string().required().error(Error(checkFriendInviteValidSchemaMsg.friendInviteCodeErrorMsg)),
    })
}

const inviteUserByEmailSchema = {
    body: Joi.object().keys({
        email: Joi.string().email().required().error(Error(inviteUserByEmailSchemaMsg.emailErrorMsg)),
        from:Joi.string().required().error(Error(inviteUserByEmailSchemaMsg.fromErrorMsg)),
        personalNote:Joi.string().allow(""),
        sendCopy:Joi.boolean().required()
    })
}

module.exports = {
    sendInviteSchema,
    verifyContactSchema,
    registerSchema,
    authenticateSchema,
    checkFriendInviteValidSchema,
    sendVerificationCodeSchema,
    inviteUserByEmailSchema
}
