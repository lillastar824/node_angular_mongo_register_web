const { chai, app } = require('../lib/main');

const admin = {
    email: 'admin@demo.com',
    password: '123456'
};
exports.admin = admin;

async function loginAsAdmin() {
    const postData = {
        email: admin.email,
        password: admin.password
    }
    return chai.request(app)
        .post('/api/authenticate')
        .set('content-type', 'application/json')
        .send(postData);
}
exports.loginAsAdmin = loginAsAdmin;