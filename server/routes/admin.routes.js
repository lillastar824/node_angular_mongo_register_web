//----Admin Routes----
const AdminController = require('../controllers/admin.controller');
const AdminSchemas = require('./../validation-schemas/admin')
const { celebrate } = require('celebrate');

const JwtHelper = require('../config/JwtHelper');
const registerRoutes = function (router) {

    //--Commertial Atsign Routes--
    router.get('/commercial-atsign', JwtHelper.verifyJwtToken, AdminController.getCommercialAtsign)
    router.get('/commercial-atsign/:id', JwtHelper.verifyJwtToken, AdminController.getCommercialAtsignDetals)
    router.put('/commercial-atsign', JwtHelper.verifyJwtToken, AdminController.updateCommercialAtsign)
    router.post('/commercial-atsign', JwtHelper.verifyJwtToken, AdminController.postCommercialAtsign)
    router.delete('/commercial-atsign/:id', JwtHelper.verifyJwtToken, AdminController.deleteCommercialAtsign)
    //--Commertial Atsign Routes End--

    //--Commission Routes--
    router.get('/commission', JwtHelper.verifyJwtToken, AdminController.getCommercialAtsignCommissionDetails)
    router.get('/commission/reports/:atsign', JwtHelper.verifyJwtToken, AdminController.getCommercialReportsDetailsByAtsign)
    router.post('/commission/approve', JwtHelper.verifyJwtToken, AdminController.approveCommissionByAtsign)
    //--Commission Routes End--

    

    //--App Config Routes--
    router.get('/app-config', JwtHelper.verifyJwtToken, AdminController.getAdminConfigs)
    router.post('/app-config/enable-waitlist', [celebrate(AdminSchemas.enableWaitListSchema), JwtHelper.verifyJwtToken], AdminController.enableWaitList)
    //--App Config Routes End--

    //--Saved Atsign Routes--
    router.post('/saved-atsign', JwtHelper.verifyJwtToken, AdminController.updateSavedAtsign);
    router.put('/saved-atsign', JwtHelper.verifyJwtToken, AdminController.deleteSavedAtsign);
    //--Saved Atsign Routes End--

    //--Reserve Atsign Routes--
    router.post('/add-reserve-atsign', JwtHelper.verifyJwtToken, AdminController.addReserveAtsigns);
    //--Reserve Atsign Routes End--

    router.get('/all-users', JwtHelper.verifyJwtToken, AdminController.getAllUsers);
    router.get('/all-atsigns', JwtHelper.verifyJwtToken, AdminController.getAllAtsigns);
    router.post('/reports/user', JwtHelper.verifyJwtToken, AdminController.getUsersForReport);
    router.post('/change-password', JwtHelper.verifyJwtToken, AdminController.changePassword);

    router.post('/send-invite-link', JwtHelper.verifyJwtToken, AdminController.sendInviteLink);
    router.post('/create-user', JwtHelper.verifyJwtToken, AdminController.addUserAtsign);
    router.post('/admin/transfer-atsign', JwtHelper.verifyJwtToken, AdminController.transferUserAtsign)

    router.get('/all-transfer-atsign', JwtHelper.verifyJwtToken, AdminController.getAllTransferAtsigns)
    
    //--assign-atsign
    router.post('/admin/assign-atsign', JwtHelper.verifyJwtToken, AdminController.assignAtsignToUser)
    router.get('/admin/assign-atsign', JwtHelper.verifyJwtToken, AdminController.getAdminAssignedAtsign)
}
module.exports = { registerRoutes }
//----Admin Routes End----