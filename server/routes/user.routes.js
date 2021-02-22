const UserController = require('../controllers/user.controller');
const AtsignDetailController = require('../controllers/atsign-detail.controller');

const UserSchemas = require('./../validation-schemas/user')

const { celebrate } = require('celebrate');

const JwtHelper = require('../config/JwtHelper');
const registerRoutes = function (router) {

    router.post('/getuserlogs', JwtHelper.verifyJwtToken, UserController.getLogs);
    router.post('/activateAtSign', JwtHelper.verifyJwtToken, UserController.activateAtSign);
    router.post('/deactivateAtSign', JwtHelper.verifyJwtToken, UserController.deactivateAtSign);
    router.post('/checkAtSignStatus', JwtHelper.verifyJwtToken, UserController.checkAtSignStatus);
    router.post('/checkActivateStatus', JwtHelper.verifyJwtToken, UserController.checkActivateStatus);
    router.post('/showQRCode', JwtHelper.verifyJwtToken, UserController.showQRCode);
    router.get('/user/atsign', JwtHelper.verifyJwtToken, UserController.getAllAtsignOfCurrentUser)
    router.get('/sendNewInviteLink', JwtHelper.verifyJwtToken, UserController.sendNewInviteLink)
    router.post('/checkAtsignAvailability', JwtHelper.verifyJwtToken, UserController.checkAtsignAvailability);
    router.post('/cancelSubscription', JwtHelper.verifyJwtToken, UserController.cancelSubscription);
    router.post('/upgradeHandle', JwtHelper.verifyJwtToken, UserController.upgradeHandle);
    router.get('/userProfile', JwtHelper.verifyJwtToken, UserController.userProfile);
    router.post('/viewHistory', JwtHelper.verifyJwtToken, UserController.viewHistory);
    router.post('/createNewHandle', JwtHelper.verifyJwtToken, UserController.createNewHandle);
    router.post('/saveProductNotification', JwtHelper.verifyJwtToken, UserController.saveProductNotification);
    router.post('/createInvites', JwtHelper.verifyJwtToken, UserController.createInviteCode);
    //admin api
    router.post('/deleteUser', JwtHelper.verifyJwtToken, UserController.deleteUser);
    router.get('/inviteHistory', JwtHelper.verifyJwtToken, UserController.inviteHistory);
    router.post('/deleteStandardAtsign', JwtHelper.verifyJwtToken, UserController.deleteStandardAtsign);
    router.get('/freesigncount', JwtHelper.verifyJwtToken, UserController.freeSignCount);
    router.post('/verification-method/sendotp', JwtHelper.verifyJwtToken, UserController.sendOTPForAddingVerificationMethod)
    router.post('/verification-method/verify', JwtHelper.verifyJwtToken, UserController.verifyVerificationMethod)
    router.post('/cart-referal-code', JwtHelper.verifyJwtToken, UserController.cartReferalCode)
    router.get('/logout', JwtHelper.verifyJwtToken, UserController.logout);
    //unauthenticated routes
    router.get('/getatsignavailability/:atsign', UserController.getAtsignAvailability);
    router.get('/randomatSign', UserController.randomatSign);
    router.get('/getRandomOptions', UserController.getRandomOptions);
    router.post('/register', UserController.register);
    router.post('/authenticate', [celebrate(UserSchemas.authenticateSchema)], UserController.authenticate);
    router.post('/checkFriendInviteValid', UserController.checkFriendInviteValid);
    router.post('/getUserDetailsFromCode', UserController.getUserDetailsFromCode);
    router.post('/listSimilarAtSigns', JwtHelper.verifyJwtToken, UserController.listSimilarAtSigns);
    router.post('/getUserDetails', UserController.getUserDetails);
    router.get('/checkLastVerification', JwtHelper.verifyJwtToken, UserController.checkLastVerification);
    router.post('/sendVerificationCode', UserController.sendVerificationCode);
    router.post('/verifyContact', [celebrate(UserSchemas.verifyContactSchema)], UserController.verifyContact);
    router.post('/removecontact', JwtHelper.verifyJwtToken, UserController.removeContact);

    // --no-ui-route
    router.post('/insertJson', UserController.insertJson);

    // --no-ui-route --unused
    router.get('/updateAtsignType', UserController.updateAtsignType);
    router.get('/updateemailcase', UserController.updateEmailCase);
    // router.post('/removereserved', JwtHelper.verifyJwtToken, UserController.removeReserved);
    // router.get('/updateDatetoObject', UserController.updateDatetoObject);
    // router.get('/updateTrasactionObj', UserController.updateTrasactionObj);

    router.get('/executeRenewalScripts', function (req, res) {
        UserController.sendRenewalNotification()
        UserController.sendRenewalNotificationPast30()
        UserController.sendRenewalNotificationPast60()
        UserController.sendRenewalNotificationPast61()
        UserController.sendRenewalNotificationCurrent()
        res.send({ status: 'success', message: 'Success' })
    })

    router.get('/changeAtsignValidTillTime/:atsign/:date',async function(req,res){
        let result = await AtsignDetailController.changeAtsignValidTillTime(req.params.atsign,new Date(req.params.date));
        res.send(result)
    })
}

module.exports = {
    registerRoutes
}