const { chai, app, should, expect, assert } = require('../lib/main');
const mongoose = require('mongoose');
const Atsign = mongoose.model('Atsign');
const { messages } = require('./../../config/const');
const helper = require('./../lib/helper');

let temp = {
    admin: {}
};

describe('/POST addReserveAtsigns', async function () {

    it('should throw error on add reserved sign without login', async function () {
        const postData = {
            name: "babyYoda",
            type: "Custom"
        };
        temp.reservedSign = postData;
        res = await chai.request(app)
            .post('/api/add-reserve-atsign')
            .set('content-type', 'application/json')
            .send(postData);
        res.should.have.status(403);
        res.body.should.be.a('object');
        res.body.should.have.keys("auth", "message");
        assert.equal(res.body.auth, false);
        assert.equal(res.body.message, messages.UNAUTH_REQ);
    })

    // this case doesnt handle yet in app
    // it('should throw error on invalid params', async function () {
    //     let res = await loginAsAdmin();
    //     temp.admin.token = res.body.token;
    //     const postData = {
    //         names: "babyYoda",
    //     };
    //     res = await chai.request(app)
    //         .post('/api/reserve-atsign')
    //         .set('content-type', 'application/json')
    //         .set('Authorization', `Bearer ${temp.admin.token}`)
    //         .send(postData);
    //     // res.should.have.status(200);
    //     // res.body.should.be.a('object');
    //     // assert.equal(res.body.status, "success");
    //     // assert.equal(res.body.message.toLowerCase(), "@sign added successfully");
    //     // res.body.should.have.keys("status", "message", "data");
    //     // res.body.data.should.be.a('object');
    // })

    it('should add reserved sign on valid params', async function () {
        let res = await helper.loginAsAdmin();
        temp.admin.token = res.body.token;
        const postData = {
            name: "babyYoda",
            type: "Custom"
        };
        res = await chai.request(app)
            .post('/api/add-reserve-atsign')
            .set('content-type', 'application/json')
            .set('Authorization', `Bearer ${temp.admin.token}`)
            .send(postData);
        res.should.have.status(200);
        res.body.should.be.a('object');
        assert.equal(res.body.status, "success");
        assert.equal(res.body.message.toLowerCase(), messages.SIGN_ADDED);
        res.body.should.have.keys("status", "message", "data");
        res.body.data.should.be.a('object');
    })

});

describe('/POST updateSavedAtsign', async function () {

    it('should throw error on update reserved sign without login', async function () {
        const astignName = await Atsign.findOne({ name: temp.reservedSign.name.toLowerCase() });
        temp.reservedSign._id = astignName._id;
        temp.reservedSign.name = 'babyyoda1';
        const postData = {
            name: temp.reservedSign.name,
            type: temp.reservedSign.type,
            _id: temp.reservedSign._id
        };
        res = await chai.request(app)
            .post('/api/saved-atsign')
            .set('content-type', 'application/json')
            .send(postData);
        res.should.have.status(403);
        res.body.should.be.a('object');
        res.body.should.have.keys("auth", "message");
        assert.equal(res.body.auth, false);
        assert.equal(res.body.message, messages.UNAUTH_REQ);
    })

    // this case doesnt handle yet in app
    // it('should throw error on invalid params', async function () {
    //     let res = await loginAsAdmin();
    //     temp.admin.token = res.body.token;
    //     const postData = {
    //         names: "babyYoda",
    //     };
    //     res = await chai.request(app)
    //         .post('/api/saved-atsign')
    //         .set('content-type', 'application/json')
    //         .set('Authorization', `Bearer ${temp.admin.token}`)
    //         .send(postData);
    //     // res.should.have.status(200);
    //     // res.body.should.be.a('object');
    //     // assert.equal(res.body.status, "success");
    //     // assert.equal(res.body.message.toLowerCase(), "@sign added successfully");
    //     // res.body.should.have.keys("status", "message", "data");
    //     // res.body.data.should.be.a('object');
    // })

    it('should update reserved sign on valid params', async function () {
        const postData = {
            name: temp.reservedSign.name,
            type: temp.reservedSign.type,
            _id: temp.reservedSign._id
        };
        const res = await chai.request(app)
            .post('/api/saved-atsign')
            .set('content-type', 'application/json')
            .set('Authorization', `Bearer ${temp.admin.token}`)
            .send(postData);
        res.should.have.status(200);
        res.body.should.be.a('object');
        assert.equal(res.body.status, "success");
        res.body.should.have.keys("status", "message", "data");
        res.body.data.should.be.a('object');
    })

});

describe('/POST deleteSavedAtsign', async function () {

    it('should throw error on delete reserved sign without login', async function () {
        const astignName = await Atsign.findOne({ name: temp.reservedSign.name.toLowerCase() });
        temp.reservedSign._id = astignName._id;
    
        const postData = {
            name: temp.reservedSign.name,
            type: temp.reservedSign.type,
            _id: temp.reservedSign._id
        };
        const res = await chai.request(app)
            .delete('/api/saved-atsign')
            .set('content-type', 'application/json')
            .send(postData);
        res.should.have.status(403);
        res.body.should.be.a('object');
        res.body.should.have.keys("auth", "message");
        assert.equal(res.body.auth, false);
        assert.equal(res.body.message, messages.UNAUTH_REQ);
    })

    // this case doesnt handle yet in app
    // it('should throw error on invalid params', async function () {
    //     let res = await loginAsAdmin();
    //     temp.admin.token = res.body.token;
    //     const postData = {
    //         names: "babyYoda",
    //     };
    //     res = await chai.request(app)
    //         .delete('/api/saved-atsign')
    //         .set('content-type', 'application/json')
    //         .set('Authorization', `Bearer ${temp.admin.token}`)
    //         .send(postData);
    //     // res.should.have.status(200);
    //     // res.body.should.be.a('object');
    //     // assert.equal(res.body.status, "success");
    //     // assert.equal(res.body.message.toLowerCase(), "@sign added successfully");
    //     // res.body.should.have.keys("status", "message", "data");
    //     // res.body.data.should.be.a('object');
    // })

    it('should update reserved sign on valid params', async function () {
        const postData = {
            name: temp.reservedSign.name,
            type: temp.reservedSign.type,
            _id: temp.reservedSign._id
        };
        const res = await chai.request(app)
            .delete('/api/saved-atsign')
            .set('content-type', 'application/json')
            .set('Authorization', `Bearer ${temp.admin.token}`)
            .send(postData);
        res.should.have.status(200);
        res.body.should.be.a('object');
        assert.equal(res.body.status, "success");
        res.body.should.have.keys("status", "message", "data");
        res.body.data.should.be.a('object');
    })
});

describe('/GET getAllAtsigns', async function () {
    it('should throw error on getallatsign without login', async function() {
        const res = await chai.request(app)
            .get('/api/all-atsigns?pageNo=1&pageSize=25&sortBy=name&sortOrder=asc&searchTerm=&atsignType=Custom');
        
        res.should.have.status(403);
        res.body.should.be.a('object');
        res.body.should.have.keys("auth", "message");
        assert.equal(res.body.auth, false);
        assert.equal(res.body.message, messages.UNAUTH_REQ);
    });

    it('should return empty resultset', async function() {
        const res = await chai.request(app)
            .get('/api/all-atsigns?pageNo=1&pageSize=25&sortBy=name&sortOrder=asc&searchTerm=&atsignType=Custom')
            .set('Authorization', `Bearer ${temp.admin.token}`);
        
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.keys("atsigns", "pageNo", "totalPage", "totalData");
        expect(res.body.atsigns).to.be.an('array').that.is.empty;
    });

    it('should return resultset', async function() {
        const atSignNames = [{ name: 'babaYaga' }, { name: 'killerFrost' }, { name: 'darthVader' }];
        await Atsign.insertMany(atSignNames);

        const res = await chai.request(app)
            .get('/api/all-atsigns?pageNo=1&pageSize=25&sortBy=name&sortOrder=asc&searchTerm=&atsignType=Custom')
            .set('Authorization', `Bearer ${temp.admin.token}`);
        
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.keys("atsigns", "pageNo", "totalPage", "totalData");
        expect(res.body.atsigns).to.be.an('array').to.have.lengthOf(atSignNames.length);
    });
});