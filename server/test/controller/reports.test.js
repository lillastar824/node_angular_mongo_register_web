const { chai, app, should, expect, assert } = require('../lib/main');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const { messages } = require('./../../config/const');
const helper = require('./../lib/helper');

const temp = {
    admin: {},
    sampleUser: JSON.parse(`{ "mobileVerified": false, "invitedOn": { "$date": { "$numberLong": "" } }, "atsignDetails": [{ "atsignName": "", "atsignType": "", "atsignCreatedOn": { "$date": { "$numberLong": "" } } }], "invitedBy": "", "userStatus": "Active", "userRole": "User", "email": "" }`),
    all: []
};

describe('/POST getUsersForReport', async function () {

    it('should throw error on getUsersForReport without login', async function () {
        const postData = { 
            "pageNo": 1, 
            "pageSize": 25, 
            "sortBy": "email", 
            "sortOrder": "asc", 
            "atsignType": "all", 
            "toDate": new Date().toISOString(), 
            "fromDate": new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
        temp.postData = postData;
        res = await chai.request(app)
            .post('/api/reports/user')
            .set('content-type', 'application/json')
            .send(postData);
        res.should.have.status(403);
        res.body.should.be.a('object');
        res.body.should.have.keys("auth", "message");
        assert.equal(res.body.auth, false);
        assert.equal(res.body.message, messages.UNAUTH_REQ);
    });

    it('should throw error and empty results on getUsersForReport', async function () {
        let res = await helper.loginAsAdmin();
        temp.admin.token = res.body.token;
        const postData = {...temp.postData};
        res = await chai.request(app)
            .post('/api/reports/user')
            .set('Authorization', `Bearer ${temp.admin.token}`)
            .set('content-type', 'application/json')
            .send(postData);
        res.should.have.status(404);
        res.body.should.be.a('object');
        assert.equal(res.body.status, false);
        res.body.should.have.keys("status", "message");
        assert.equal(res.body.message, messages.NO_RECORD_FOUND);
    });

    it('should display 2 results on passing sign type is free', async function () {
        temp.free = [];
        let freeEntry = {...temp.sampleUser};
        freeEntry.invitedOn = new Date(Date.now()  - 3 * 24 * 60 * 60 * 1000).toISOString();
        freeEntry.atsignDetails[0].atsignName = 'darthVader';
        freeEntry.atsignDetails[0].atsignType = 'free';
        freeEntry.atsignDetails[0].atsignCreatedOn = new Date(Date.now()  - 2 * 24 * 60 * 60 * 1000).toISOString();
        freeEntry.email = "free1@test.com";
        temp.free.push(freeEntry);
        temp.all.push(freeEntry);

        freeEntry = {...temp.sampleUser};
        freeEntry.invitedOn = new Date(Date.now()  - 3 * 24 * 60 * 60 * 1000).toISOString();
        freeEntry.atsignDetails = [];
        freeEntry.atsignDetails.push({});
        freeEntry.atsignDetails[0].atsignName = 'obiwanknobi';
        freeEntry.atsignDetails[0].atsignType = 'free';
        freeEntry.atsignDetails[0].atsignCreatedOn = new Date(Date.now()  - 2 * 24 * 60 * 60 * 1000).toISOString();
        freeEntry.email = "free2@test.com";
        temp.free.push(freeEntry);
        temp.all.push(freeEntry);

        await User.insertMany(temp.free);

        const postData = {...temp.postData};
        postData.atsignType = 'all-free';
        res = await chai.request(app)
            .post('/api/reports/user')
            .set('Authorization', `Bearer ${temp.admin.token}`)
            .set('content-type', 'application/json')
            .send(postData);
        res.should.have.status(200);
        res.body.should.be.a('object');
        assert.equal(res.body.status, true);
        res.body.should.have.keys("status", "csvData", "pageNo", "totalPage", "totalData");
        assert.equal(res.body.totalData, temp.free.length);
    });

    it('should display 2 results on passing atSignType as all', async function () {
        const postData = {...temp.postData};
        res = await chai.request(app)
            .post('/api/reports/user')
            .set('Authorization', `Bearer ${temp.admin.token}`)
            .set('content-type', 'application/json')
            .send(postData);
        res.should.have.status(200);
        res.body.should.be.a('object');
        assert.equal(res.body.status, true);
        res.body.should.have.keys("status", "csvData", "pageNo", "totalPage", "totalData");
        assert.equal(res.body.totalData, temp.all.length);
    });

    it('should return empty results on datefilter is set for previous month', async function () {
        const postData = {...temp.postData};
        postData.toDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 ).toISOString();
        postData.fromDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000 ).toISOString();
        res = await chai.request(app)
            .post('/api/reports/user')
            .set('Authorization', `Bearer ${temp.admin.token}`)
            .set('content-type', 'application/json')
            .send(postData);
        res.should.have.status(404);
        res.body.should.be.a('object');
        assert.equal(res.body.status, false);
        res.body.should.have.keys("status", "message");
        assert.equal(res.body.message, messages.NO_RECORD_FOUND);
    });

    it('should display 2 results on passing sign type is all-paid', async function () {
        temp.paid = [];
        let freeEntry = {...temp.sampleUser};
        freeEntry.invitedOn = new Date(Date.now()  - 4 * 24 * 60 * 60 * 1000).toISOString();
        freeEntry.atsignDetails = [{}];
        freeEntry.atsignDetails[0].atsignName = 'princessleia';
        freeEntry.atsignDetails[0].atsignType = 'paid';
        freeEntry.atsignDetails[0].premiumAtsignType = 'Custom';
        freeEntry.atsignDetails[0].payAmount = '100';
        freeEntry.atsignDetails[0].atsignCreatedOn = new Date(Date.now()  - 4 * 24 * 60 * 60 * 1000).toISOString();
        freeEntry.email = "paid1@test.com";
        temp.paid.push(freeEntry);
        temp.custom = [];
        temp.custom.push(freeEntry);
        temp.all.push(freeEntry);

        freeEntry = {...temp.sampleUser};
        freeEntry.invitedOn = new Date(Date.now()  - 4 * 24 * 60 * 60 * 1000).toISOString();
        freeEntry.atsignDetails = [];
        freeEntry.atsignDetails.push({});
        freeEntry.atsignDetails[0].atsignName = 'luke';
        freeEntry.atsignDetails[0].atsignType = 'paid';
        freeEntry.atsignDetails[0].premiumAtsignType = 'Reserved';
        freeEntry.atsignDetails[0].payAmount = '100';
        freeEntry.atsignDetails[0].atsignCreatedOn = new Date(Date.now()  - 4 * 24 * 60 * 60 * 1000).toISOString();
        freeEntry.email = "paid2@test.com";
        temp.paid.push(freeEntry);
        temp.reserve = [];
        temp.reserve.push(freeEntry);
        temp.all.push(freeEntry);

        await User.insertMany(temp.paid);

        const postData = {...temp.postData};
        postData.atsignType = 'all-paid';
        res = await chai.request(app)
            .post('/api/reports/user')
            .set('Authorization', `Bearer ${temp.admin.token}`)
            .set('content-type', 'application/json')
            .send(postData);
        res.should.have.status(200);
        res.body.should.be.a('object');
        assert.equal(res.body.status, true);
        res.body.should.have.keys("status", "csvData", "pageNo", "totalPage", "totalData");
        assert.equal(res.body.totalData, temp.paid.length);
    });
    it('should match temp.reserve length results on passing atSignType as all-reserved', async function () {
        const postData = {...temp.postData};
        postData.atsignType = 'all-reserved';
        res = await chai.request(app)
            .post('/api/reports/user')
            .set('Authorization', `Bearer ${temp.admin.token}`)
            .set('content-type', 'application/json')
            .send(postData);
        res.should.have.status(200);
        res.body.should.be.a('object');
        assert.equal(res.body.status, true);
        res.body.should.have.keys("status", "csvData", "pageNo", "totalPage", "totalData");
        assert.equal(res.body.totalData, temp.reserve.length);
    });
    it('should match temp.custom length on passing atSignType as all-custom', async function () {
        const postData = {...temp.postData};
        postData.atsignType = 'all-custom';
        res = await chai.request(app)
            .post('/api/reports/user')
            .set('Authorization', `Bearer ${temp.admin.token}`)
            .set('content-type', 'application/json')
            .send(postData);
        res.should.have.status(200);
        res.body.should.be.a('object');
        assert.equal(res.body.status, true);
        res.body.should.have.keys("status", "csvData", "pageNo", "totalPage", "totalData");
        assert.equal(res.body.totalData, temp.custom.length);
    });

});