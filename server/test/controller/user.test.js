const { chai, app, should, expect, assert } = require('../lib/main');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const { messages } = require('./../../config/const');
const helper = require('./../lib/helper')

let temp = {};

describe('/POST authenticate', () => {

    it('should register admin user', (done) => {
        const postData = {
            fullName: 'Admin Demo',
            password: helper.admin.password,
            email: helper.admin.email,
            secretkey: process.env.SIGNUP_KEY
        };
        temp.admin = postData;
        chai.request(app)
            .post('/api/register')
            .set('content-type', 'application/json')
            .send(postData)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.keys("status", "message");
                done();
            });
    });

    it('Users with valid credentials should authenticate', (done) => {
        const postData = {
            email: temp.admin.email,
            password: temp.admin.password
        }
        chai.request(app)
            .post('/api/authenticate')
            .set('content-type', 'application/json')
            .send(postData)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.keys("token", "user");
                temp.admin.token = res.body.token;
                done();
            });
    });

    it('Users with invalid email id should not authenticate', (done) => {
        let postData = {
            email: "aaa@aaa.com",
            password: "12345698"
        }
        chai.request(app)
            .post('/api/authenticate')
            .set('content-type', 'application/json')
            .send(postData)
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                res.body.should.have.property('message');
                assert.equal(res.body.message, messages.UNREGISTER_EMAIL);
                done();
            });
    });

    it('Users with valid email and invalid password should not authenticate', (done) => {
        let postData = {
            email: temp.admin.email,
            password: "1234567777"
        }
        chai.request(app)
            .post('/api/authenticate')
            .set('content-type', 'application/json')
            .send(postData)
            .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                res.body.should.have.property('message');
                assert.equal(res.body.message, messages.INVALID_PASS);
                done();
            });
    });
});

describe('/POST user on boarding', () => {

    it('Users should be able to send invite to a valid email', (done) => {
        let postData = {
            email: "user@test.com",
            inviteCode: ""
        }
        temp.user = postData;
        chai.request(app)
            .post('/api/sendInvite')
            .set('content-type', 'application/json')
            .send(postData)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.keys("status", "message");
                assert.equal(res.body.status, "success");
                done();
            });
    });

    it('Users should not be able to send invite to an invalid email', (done) => {
        let postData = {
            email: "invalid@email",
            inviteCode: ""
        }
        chai.request(app)
            .post('/api/sendInvite')
            .set('content-type', 'application/json')
            .send(postData)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.keys("status", "message");
                assert.equal(res.body.status, "error");
                assert.equal(res.body.message, messages.ENTER_VALID_MAIL);
                done();
            });
    });

    it('Users should be able to send verification code', (done) => {
        let postData = {
            email: temp.user.email,
            contact: ""
        }
        chai.request(app)
            .post('/api/sendVerificationCode')
            .set('content-type', 'application/json')
            .set('referer', `http://localhost:${process.env.PORT}/account-verify/devtestgmail%2B4@gmail.com/g7sae/false`)
            .send(postData)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.keys("status", "data", "message");
                assert.equal(res.body.message, messages.VERIFICATION_CODE_SENT);
                done();
            });
    });

    it('Users should not be able verify contact using wrong mobile OTP', (done) => {
        let postData = {
            mobileOtp: '0000', // invalid mobileOtp
            email: temp.user.email
        }
        chai.request(app)
            .post('/api/verifyContact')
            .set('content-type', 'application/json')
            .send(postData)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                assert.equal(res.body.status, "error");
                assert.equal(res.body.message, messages.INVALD_CODE);
                res.body.should.have.keys("status", "message", "data");
                done();
            });
    });

    it('Users should be able verify contact using correct mobile OTP', async () => {
        const user = await User.findOne({ email: temp.user.email });
        let postData = {
            mobileOtp: user.mobileOtp,
            email: temp.user.email
        }
        chai.request(app)
            .post('/api/verifyContact')
            .set('content-type', 'application/json')
            .send(postData)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                assert.equal(res.body.status, "success");
                assert.equal(res.body.message.toLowerCase(), "verified");
                res.body.should.have.keys("status", "message", "token");
            });
    })
});

describe("/POST Admin User Functionality", () => {

    it('Users should be able to send invite link to a valid email and a given code', async () => {
        const user = await User.findOne({ email: temp.user.email }).catch(err => console.log(error));
        let postData = {
            email: temp.user.email,
            inviteCode: user.atsignDetails[0].inviteCode
        }
        chai.request(app)
            .post('/api/send-invite-link')
            .set('content-type', 'application/json')
            .set('Authorization', `Bearer ${temp.admin.token}`)
            .send(postData)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                expect(res.body).to.have.property("data");
            });
    });
});