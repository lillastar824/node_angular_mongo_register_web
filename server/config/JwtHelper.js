const jwt = require('jsonwebtoken');
const userService = require('../services/user.service');
const { messages } = require('./../config/const');
const authService = require('../services/auth.service');

const adminRoutes = [
    '/api/commercial-atsign',
    '/api/commercial-atsign/*',
    '/api/commission',
    '/api/commission/reports/*',
    '/api/commission/approve',
    '/api/execute-promo-code-script',
    '/api/app-config',
    '/api//app-config/enable-waitlist',
    '/api/saved-atsign',
    '/api/add-reserve-atsign',
    '/api/all-users',
    '/api/all-atsigns',
    '/api/reports/user',
    '/api/change-password',
    '/api/create-user',
    '/api/send-invite-link',
    '/api/all-transfer-atsign',
    '/api/admin/transfer-atsign'
];
const reportRoutes = [
    '/api/reports/user',
    '/api/commission/reports/:atsign', //Need to fix
];

module.exports.verifyJwtToken = (req, res, next) => {
    let token;
    if ('authorization' in req.headers)
        token = req.headers['authorization'].split(' ')[1];

    if (!token)
        return res.status(403).send({ auth: false, message: messages.UNAUTH_REQ });
    else {
        jwt.verify(token, process.env.JWT_SECRET,
            async (err, decoded) => {
                //@todo 500->401
                if (err)
                    return res.status(500).send({ auth: false, message: messages.INVALID_TOKEN });
                else {
                    req._id = decoded._id;
                    let validUser = await authService.checkTokenExistInDb(req._id, token);
                    if (await verifyRole(req) && validUser) {
                        // if(await verifyRole(req)){
                        next();
                    } else {
                        return res.status(401).send({ auth: false, message: messages.UNAUTH_USER });
                    }

                }
            }
        )
    }
}

module.exports.getIdIfExists = (req) => {
    let token;
    if ('authorization' in req.headers)
        token = req.headers['authorization'].split(' ')[1];
    if (token != undefined && token != 'null') {
        return jwt.verify(token, process.env.JWT_SECRET,
            (err, decoded) => {
                if (err)
                    return false;
                else {
                    return decoded._id;
                }
            }
        )
    }
    else {
        return "";
    }
}

async function verifyRole(req) {
    let role = await userService.getUserRoleById(req._id);
    let originalUrl = req.originalUrl.split('?')[0]
    let regexUrl = originalUrl.split('/')//.push('*').join('/')
    regexUrl[regexUrl.length - 1] = '*';
    regexUrl = regexUrl.join('/')
    if (role === 'AdminReport' && (reportRoutes.indexOf(originalUrl) > -1) || reportRoutes.indexOf(regexUrl) > -1) {
        return true;
    }
    if (role !== "Admin" && (adminRoutes.indexOf(originalUrl) !== -1 || adminRoutes.indexOf(regexUrl) !== -1)) {
        return false;
    }
    return true;
}