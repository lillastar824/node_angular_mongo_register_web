const proxyquire = require('proxyquire');
const fs = require('fs')
const uuid = require('uuid');
const crypto = require('crypto');
const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

var isDate = function (date) {
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}

class UserStub {

    static users = [
        { "_id": "5f1bc16e6c00c73cc3dca9bf", "mobileVerified": true, "invitedOn": "2020-07-25T05:21:50.220Z", "reserveTime": "1595654510220", "atsignDetails": [{ "_id": "5f1bc16e6c00c73cc3dca9c0", "inviteCode": "C5KaY", "atsignCreatedOn": "2020-07-25T05:51:50.707Z", "atsignName": "66voluntary", "atsignType": "free" }, { "_id": "5f1bc931df46bd480d315711", "inviteCode": "d21ecbcc2118f357b1ca29b058f0a010a0c6f6b766a8ade0c0b6ff271dd2a55c", "inviteLink": "http://localhost:4200/welcome/ankurag0728@gmail.com/d21ecbcc2118f357b1ca29b058f0a010a0c6f6b766a8ade0c0b6ff271dd2a55c/false", "atsignCreatedOn": "2020-07-26T08:54:23.489Z", "atsignName": "yoursmineandourslabour", "atsignType": "free" }, { "isActivated": false, "_id": "5f1d4a2556ef9874e31bb3ff", "inviteCode": "00b7d3a37814dfcf69cbfe1cc8a791a4a41d56cbf510e36b8639c01fbd595acc", "inviteLink": "http://localhost:4200/welcome/ankurag0728@gmail.com/00b7d3a37814dfcf69cbfe1cc8a791a4a41d56cbf510e36b8639c01fbd595acc/false", "atsignCreatedOn": "2020-07-26T09:18:08.082Z", "atsignName": "supporting64", "atsignType": "paid" }], "inviteFriendDetails": [{ "_id": "5f1d3f68a3455d6c08336dab", "inviteCodefriends": "577e9c9e8d61e282a7ec253220e9465963ea768ee400cbc6b3cd1dfc7b3503b4", "used": false, "inviteLink": "http://localhost:4200/welcome/d2itechnology.ankur@gmail.com/577e9c9e8d61e282a7ec253220e9465963ea768ee400cbc6b3cd1dfc7b3503b4/false", "sentOn": "2020-07-26T08:31:36.436Z" }], "invitedBy": "", "userStatus": "Active", "userRole": "User", "email": "ankurag0728@gmail.com", "saltSecret": "$2a$10$Dm2iSE.iCotThPXtn0kQse", "__v": 0, "mobileOtp": 4019, "otpGenerateTime": "2020-07-26T09:17:37.997Z", "productNotificationEmail": true },
        { "_id": "5f1d258e085f7b5d12c831bd", "mobileVerified": true, "invitedOn": "2020-07-26T06:41:18.263Z", "reserveTime": "1595745678263", "atsignDetails": [{ "_id": "5f1bc16e6c00c73cc3dca9c4", "inviteCode": "asasas", "atsignCreatedOn": "2020-07-25T05:51:50.707Z", "atsignName": "12voluntary", "atsignType": "free" }, { "_id": "5f1bc931df46bd480d315713", "inviteCode": "asasasas212", "inviteLink": "", "atsignCreatedOn": "2020-07-26T08:54:23.489Z", "atsignName": "yoursmineandours23", "atsignType": "free" }], "inviteFriendDetails": [], "invitedBy": "", "userStatus": "Active", "userRole": "User", "email": "test@testsite.in", "saltSecret": "$2a$10$5xNQXDu/kWUfbDg71GC1Fe", "__v": 0 },
        { "_id": "5f1d379052c1de6a0f247640", "mobileVerified": false, "invitedOn": "2020-07-26T07:58:08.320Z", "reserveTime": "1595750288320", "atsignDetails": [{ "_id": "5f1d379052c1de6a0f247641", "inviteCode": "P39t4" }], "inviteFriendDetails": [], "invitedBy": "", "userStatus": "Invited", "userRole": "User", "email": "ankurag728@gmail.com", "saltSecret": "$2a$10$ALO2Dq7XPHuhtkJB9ou70u", "__v": 0 },
        { "_id": "5f1d3f68a3455d6c08336dac", "mobileVerified": false, "invitedOn": "2020-07-26T08:31:36.440Z", "reserveTime": "1595752296440", "atsignDetails": [], "inviteFriendDetails": [], "invitedBy": "ankurag0728@gmail.com", "userStatus": "Invited", "userRole": "User", "email": "d2itechnology.ankur@gmail.com", "saltSecret": "$2a$10$ErtiSYyrymUDHOqtIWX9U.", "__v": 0 }
    ]
    constructor() {
        return UserStub
    }
    static catch() {
        return this
    }

    static save(email) {
        if (!email) email = UserStub.email;
        if (!email) throw Error('Invalid email')
        if (UserStub.findOne({ email: email })) throw Error('Already Exist')
        let user = {
            email, _id: '120',
            userStatus: UserStub.userStatus,
            userRole: UserStub.userRole,
            atsignDetails: UserStub.atsignDetails
        }
        UserStub.users.push(user)
        return user
    }
    static find(findCriteria, projection = null, records = this.users) {
        let results = []
        if (!records) records = this.users
        records.forEach(record => {
            let match = []
            if (findCriteria && Object.keys(findCriteria).length == 1 && findCriteria['$and']) {
                findCriteria = findCriteria['$and'].reduce((acc, obj) => { return { ...acc, ...obj } }, {})
            }
            for (let key in findCriteria) {

                let recordValue = key.split('.').reduce((acc, val) => acc[val], record)
                if (Array.isArray(recordValue)) {
                    if (typeof findCriteria[key] === 'object') {
                        for (let findCriteriaPerKey in findCriteria[key]) {
                            if (findCriteriaPerKey == '$elemMatch') {
                                findCriteria[key] = findCriteria[key][findCriteriaPerKey]
                            }
                            if ((findCriteriaPerKey == '$and')) {
                                findCriteria[key] = findCriteria[key][findCriteriaPerKey].reduce((acc, obj) => { return { ...acc, ...obj } }, {})
                            }

                            if (findCriteriaPerKey == '$all') {
                                findCriteria[key] = findCriteria[key][findCriteriaPerKey].reduce((acc, obj) => {
                                    if (obj['$elemMatch']) obj = obj['$elemMatch']
                                    return { ...acc, ...obj }
                                }, {})
                            }

                            for (let childKey in findCriteria[key]) {
                                let childSearchParam = findCriteria[key][childKey]
                                if (typeof childSearchParam === 'object') {
                                    for (let operator in childSearchParam) {
                                        if (operator == "$gte") {
                                            if (recordValue.some(rec => rec[childKey] >= childSearchParam['$gte'])) { match.push(true); continue }
                                            match.push(recordValue.some(rec => {
                                                if (isDate(rec[childKey]) && isDate(childSearchParam['$gte'])) {
                                                    childSearchParam['$gte'] = new Date(childSearchParam['$gte'])
                                                    rec[childKey] = new Date(rec[childKey])
                                                }
                                                return rec[childKey] >= childSearchParam['$gte']
                                            }))
                                        }
                                        if (operator == "$lte") {
                                            if (recordValue.some(rec => rec[childKey] <= childSearchParam['$gte'])) { match.push(true); continue }

                                            match.push(recordValue.some(rec => {
                                                if (isDate(rec[childKey]) && isDate(childSearchParam['$lte'])) {
                                                    childSearchParam['$lte'] = new Date(childSearchParam['$lte'])
                                                    rec[childKey] = new Date(rec[childKey])
                                                }
                                                return rec[childKey] <= childSearchParam['$lte']
                                            }))
                                        }
                                        if (operator == "$gt") {
                                            if (recordValue.some(rec => rec[childKey] > childSearchParam['$gt'])) { match.push(true); continue }
                                            match.push(recordValue.some(rec => {
                                                if (isDate(rec[childKey]) && isDate(childSearchParam['$gt'])) {
                                                    childSearchParam['$gt'] = new Date(childSearchParam['$gt'])
                                                    rec[childKey] = new Date(rec[childKey])
                                                }
                                                return rec[childKey] > childSearchParam['$gt']
                                            }))
                                        }
                                        if (operator == "$lt") {
                                            if (recordValue.some(rec => rec[childKey] < childSearchParam['$lt'])) { match.push(true); continue }
                                            match.push(recordValue.some(rec => {
                                                if (isDate(rec[childKey]) && isDate(childSearchParam['$lt'])) {
                                                    childSearchParam['$lt'] = new Date(childSearchParam['$lt'])
                                                    rec[childKey] = new Date(rec[childKey])
                                                }
                                                return rec[childKey] < childSearchParam['$lt']
                                            }))
                                        }
                                        if (operator == "$ne") {
                                            match.push(recordValue.some(rec => rec[childKey] != childSearchParam['$ne']))
                                        }
                                        if (operator == "$exists") {
                                            match.push(recordValue.some(rec => typeof rec[childKey] != 'undefined'))
                                        }
                                    }
                                } else {
                                    match.push(recordValue.some(rec => rec[childKey] == childSearchParam))
                                }
                            }
                        }

                    } else {
                        match.push(recordValue.indexOf(findCriteria[key]))
                    }
                } else {
                    if (typeof findCriteria[key] === 'object') {
                        for (let operator in findCriteria[key]) {
                            if (operator == "$gte") {
                                if (recordValue >= findCriteria[key]['$lt']) { match.push(true); continue }
                                if (isDate(recordValue) && isDate(findCriteria[key]['$gte'])) {
                                    findCriteria[key]['$gte'] = new Date(findCriteria[key]['$gte'])
                                    recordValue = new Date(recordValue)
                                }
                                match.push(recordValue >= findCriteria[key]['$gte'])
                            }
                            if (operator == "$lte") {
                                if (recordValue <= findCriteria[key]['$lt']) { match.push(true); continue }
                                if (isDate(recordValue) && isDate(findCriteria[key]['$gte'])) {
                                    findCriteria[key]['$gte'] = new Date(findCriteria[key]['$gte'])
                                    recordValue = new Date(recordValue)
                                }
                                match.push(recordValue <= findCriteria[key]['$lte'])
                            }
                            if (operator == "$gt") {
                                if (recordValue > findCriteria[key]['$lt']) { match.push(true); continue }
                                if (isDate(recordValue) && isDate(findCriteria[key]['$gte'])) {
                                    findCriteria[key]['$gte'] = new Date(findCriteria[key]['$gte'])
                                    recordValue = new Date(recordValue)
                                }
                                match.push(recordValue > findCriteria[key]['$gt'])
                            }
                            if (operator == "$lt") {
                                if (recordValue < findCriteria[key]['$lt']) { match.push(true); continue }
                                if (isDate(recordValue) && isDate(findCriteria[key]['$gte'])) {
                                    findCriteria[key]['$gte'] = new Date(findCriteria[key]['$gte'])
                                    recordValue = new Date(recordValue)
                                }
                                match.push(recordValue < findCriteria[key]['$lt'])
                            }
                            if (operator == "$exists") {
                                match.push(typeof recordValue != 'undefined')
                            }
                            if (operator == "$in") {
                                match.push(recordValue && recordValue.findIndex(rec => findCriteria[key]['$in'].indexOf(rec)) == -1)
                            }
                        }
                    } else {
                        match.push(recordValue == findCriteria[key])
                    }
                }
            }
            if (match.indexOf(false) == -1) {
                results.push(record)
            }
        })
        return results;
    }
    static findByIdAndUpdate(findCriteria, updateCriteria) {
        let userIndex = this.users.findIndex(user => {
            return user._id = findCriteria._id
        });
        Object.keys(updateCriteria.$set).forEach(property => {
            this.users[userIndex][property] = updateCriteria.$set[property]
        });
    }
    static findOne(findCriteria) {
        let user = this.users.find(user => {
            let propertyMatch = [];
            Object.keys(findCriteria).forEach(property => {
                propertyMatch.push(user[property] === findCriteria[property] || user[property].indexOf(findCriteria[property]) > -1)
            })
            return propertyMatch.indexOf(false) == -1
        });
        return user || null
    }
    static unwind(data, key) {
        let result = []
        data.forEach(user => {
            if (Array.isArray(user[key])) {
                user[key].forEach(atsign => {
                    let userAtsign = { ...user }
                    userAtsign[key] = atsign
                    result.push(userAtsign)
                })
            }
        })
        return result
    }
    static group(records, groupindData) {
        let results = []
        records.forEach(user => {
            let obj = {}
            if (results.length == 0) {
                for (let key in groupindData._id) {
                    let value = groupindData._id[key].substring(1)
                    obj[key] = value.indexOf('.') < 0 ? user[value] : value.split('.').reduce((acc, val) => acc[val], user)
                }

                results.push({ _id: obj })
                return;
            }
            let recordIndex = results.findIndex(result => {
                let present = [];
                for (let key in groupindData._id) {
                    let value = groupindData._id[key].substring(1)
                    present.push(result[key] === value.split('.').reduce((acc, val) => acc[val], user))
                    obj[key] = value.indexOf('.') < 0 ? user[value] : value.split('.').reduce((acc, val) => acc[val], user)

                }
                return present.indexOf(false) == -1
            })
            if (recordIndex < 0) {
                results.push({ _id: obj })
            }
        })
        return results;
    }
    static match(records, findCriteria) {
        findCriteria = findCriteria['$and'] ? findCriteria['$and'] : findCriteria
        if (Array.isArray(findCriteria)) {
            findCriteria = findCriteria.reduce((acc, obj) => { return { ...acc, ...obj } }, {})
        }
        if (!records) records = this.users

        return this.find(findCriteria, null, records)
    }
    static sort(records, obj) {
        obj = obj && Object.keys(obj).length > 0 ? obj : { _id: 1 }
        let property = Object.keys(obj)[0]
        let sortType = obj[property]
        let property1, property2;
        records = records.sort(function (a, b) {
            let aProperty = property.split('.').reduce((acc, val) => acc[val], a)
            let bProperty = property.split('.').reduce((acc, val) => acc[val], b)
            if (sortType == 1 || sortType == 'asc') {
                property1 = typeof aProperty === 'string' ? aProperty.toUpperCase() : aProperty;
                property2 = typeof bProperty === 'string' ? bProperty.toUpperCase() : bProperty;
            } else {
                property2 = typeof aProperty === 'string' ? aProperty.toUpperCase() : aProperty;
                property1 = typeof bProperty === 'string' ? bProperty.toUpperCase() : bProperty;
            }
            if (property1 < property2) {
                return -1;
            }
            if (property1 > property2) {
                return 1;
            }
            return 0;
        });
        return records;
    }
    static skip(records, skipNo) {
        records = records.slice(skipNo)
        return records;
    }
    static limit(records, limit) {
        records = records.slice(0, limit)
        return records;
    }
    static aggregate(criterias) {
        let results = this.users;
        if (!Array.isArray(criterias)) throw Error('Must be an array')
        criterias.forEach(criteria => {
            if (Object.keys(criteria)[0] == '$unwind') {
                results = this.unwind(results, criteria['$unwind'].substring(1))
            }
            if (Object.keys(criteria)[0] == '$group') {
                results = this.group(results, criteria['$group'])
            }
            if (Object.keys(criteria)[0] == '$match') {
                results = this.match(results, criteria['$match'])
            }
            if (Object.keys(criteria)[0] == '$sort') {
                results = this.sort(results, criteria['$sort'])
            }
            if (Object.keys(criteria)[0] == '$skip') {
                results = this.skip(results, criteria['$skip'])
            }
            if (Object.keys(criteria)[0] == '$limit') {
                results = this.limit(results, criteria['$limit'])
            }
            if (Object.keys(criteria)[0] == '$count') {
                results = [{ count: results.length }]
            }
        })
        return results
    }
}


class ReserveAtsignsStub {
    static reservedAtsign = [];
    static insertMany(reservedAtsigns) {
        reservedAtsigns.forEach(atsign => {
            ReserveAtsignsStub.reservedAtsign.push(atsign)
        })
        return true
    }
}

class TransactionsStub {
    static find(){
        return []
    }
}

const { expect } = require('../lib/main');

const mongodbStub = {
    function(id) {
        return id
    }
}
const UtilityStub = {
    checkValidEmail: function (email) {
        return (!(emailRegex.test(email)))
    },
    generateInviteCode: function () {
        let inviteCode = uuid.v4();
        const hash = crypto.createHmac('sha256', inviteCode)
            .digest('hex');
        return hash;
    },
    makeid: function (length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}

const MailStub = {
    mails: [],
    sendEmailSendGrid: function (data) {
        this.mails.push(data)
    }
}

var UserService = proxyquire('./../../services/user.service', {
    './../models/user.model': UserStub,
    './../models/transactions.model': TransactionsStub,
    './../models/reserveatsigns.model': ReserveAtsignsStub,
    '../config/UtilityFunctions': UtilityStub,
    './../config/mailer': MailStub
});

describe('User service', function () {

    let paginationData = {
        startdate: new Date('2020-07-20'),
        lastdate: new Date('2020-07-30'),
        atsignType: 'all',
        pageNo: 1,
        pageSize: 2,
        sortOrder: 'asc',
        sortBy: 'atsignName'
    }

    it('must be a module', function (done) {
        expect(UserService).to.be.an('object');
        expect(UserService).to.have.property('getAllUsersData')
        expect(UserService).to.have.property('getUserRoleById')
        expect(UserService).to.have.property('sendInviteLink')
        expect(UserService).to.have.property('addUser')
        expect(UserService).to.have.property('changePassword')
        done()
    })

    describe('Get All Users Data', function () {
        const sortFunc = Array.prototype.sort

        beforeEach(() => {
            Array.prototype.skip = function (skipNo) {
                return this.slice(skipNo);
            }

            Array.prototype.limit = function (limit) {
                return this.slice(0, limit)
            }

            Array.prototype.sort = function (sortCriteria) {
                return this
            }

            Array.prototype.lean = function () {
                return this
            }
            Array.prototype.count = function () {
                return this.length
            }
            Array.prototype.select = function () {
                return this
            }



        });

        afterEach(() => {
            Array.prototype.sort = sortFunc
            delete Array.prototype.skip
            delete Array.prototype.limit

        });
        it('"getAllUsersData" must be a function', function (done) {
            expect(UserService.getAllUsersData).to.be.an('function');
            done()
        })
        let paginationData = {
            sortOrder:'asc',
            sortBy:'email',
            pageSize:10,
            pageNo:1
            
        }
        it('must return a valid object', async function () {
            const result = await UserService.getAllUsersData(paginationData)
            expect(result).to.be.an('object');
            
            expect(result).to.have.property('users');
            expect(result).to.have.property('pageNo');
            expect(result).to.have.property('totalPage');
            expect(result).to.have.property('totalData');
            expect(result.pageNo).to.be.equal(1);
            expect(result.totalPage).to.be.equal(1);
            expect(result.totalData).to.be.equal(4);
            expect(result.users).to.be.an('array');
        })
    })


    describe('Get User Role By Id', function () {
        it('"getUserRoleById" must be a function', function (done) {
            expect(UserService.getUserRoleById).to.be.an('function');
            done()
        })
        it('"getUserRoleById" must return a valid object', async function () {
            const result = await UserService.getUserRoleById('5f1d3f68a3455d6c08336dac')
            expect(result).to.be.an('String');
            expect(result).to.be.equal('User');
        })
    })

    describe('Add User', function () {
        const mailCount = MailStub.mails.length
        it('must be a function', function (done) {
            expect(UserService.addUser).to.be.an('function');
            done()
        })
        let cartData = [
            { email: 'testUser1@testuser.com', payAmount: 1000 },
            { email: 'testUser2@testuser.com', payAmount: 1000 }
        ];

        it('must add a valid object', async function () {
            const result = await UserService.addUser(cartData, "test")
            expect(result.status).to.be.equal('success')
            expect(result.message).to.be.equal('Invite Sent Successfully')
            expect(result).to.have.property('data')
            expect(result.data._id).to.be.equal('120')
        })
        it('must add user in db', async function (done) {
            const userCount = UserStub.users.length
            expect(userCount).to.be.equal(5)
            done()

        })
        it('must reserve 2 atsign', async function (done) {
            const reservedAtsignCount = ReserveAtsignsStub.reservedAtsign.length
            expect(reservedAtsignCount).to.be.equal(2)
            done()

        })
        it('must send 1 mails', function (done) {
            const currentMailCount = MailStub.mails.length
            expect(currentMailCount).to.be.equal(mailCount + 1)
            done()
        })
        it('must throw error on duplicate user', async function () {
            const result = await UserService.addUser(cartData, "test")
            expect(result.status).to.be.equal('error')
            expect(result.message).to.be.equal('This person has already been added to our list. We will be in touch with you soon!')
        })

        it('must throw error on invalid email', async function () {
            let newCartData = [
                { email: 'testUser1', payAmount: 1000 },
                { email: 'testUser2', payAmount: 1000 }
            ];
            const result = await UserService.addUser(newCartData, "test")
            expect(result.status).to.be.equal('error')
            expect(result.message).to.be.equal('Please enter a valid email address')
        })

        it('must throw error on 0 pay amount', async function () {
            let newCartData = [
                { email: 'testUser1', payAmount: 0 },
                { email: 'testUser2', payAmount: 0 }
            ];
            const result = await UserService.addUser(newCartData, "test")
            expect(result.status).to.be.equal('error')
            expect(result.message).to.be.equal('Amount cannot be 0')
        })
    })
})

