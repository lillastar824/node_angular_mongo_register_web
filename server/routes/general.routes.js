const GeneralController = require('./../controllers/general.controller');
const JwtHelper = require('../config/JwtHelper');

const registerRoutes = function (router) {
    router.get('/download1', GeneralController.downlaodFileStructure)
    router.get('/calculate-atsign-length/:atsign', JwtHelper.verifyJwtToken, GeneralController.calculateUTF7Length);
    router.get('/', GeneralController.serverStatus);
}

module.exports = { registerRoutes }