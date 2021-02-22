
const InvitationController = require('../controllers/invitation.controller');
const UserSchemas = require('./../validation-schemas/user')

const { celebrate } = require('celebrate');

const JwtHelper = require('../config/JwtHelper');
const registerRoutes = function (router) {
    router.post('/send-invite/email', [celebrate(UserSchemas.inviteUserByEmailSchema), JwtHelper.verifyJwtToken], InvitationController.inviteUserByEmail);
    router.post('/sendInvite', [celebrate(UserSchemas.sendInviteSchema)], InvitationController.initiateRegistration);
    router.get('/checkInviteCodeValid', InvitationController.checkInviteCodeValid);
}

module.exports = {
    registerRoutes
}