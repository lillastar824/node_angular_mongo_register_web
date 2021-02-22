const proxyquire = require('proxyquire');
const fs = require('fs')
var isDate = function (date) {
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}
Object.defineProperty(Array.prototype, "collation", { enumerable: false, value() { return this; } })
Object.defineProperty(Array.prototype, "exec", { enumerable: false, value() { return this; } })
Object.defineProperty(Array.prototype, "countDocuments", { enumerable: false, value() { return this.length; } })


class UserStub {

    static users = [
        { "_id": "5f1bc16e6c00c73cc3dca9bf", "mobileVerified": true, "invitedOn": "2020-07-25T05:21:50.220Z", "reserveTime": "1595654510220", "atsignDetails": [{ "_id": "5f1bc16e6c00c73cc3dca9c0", "inviteCode": "C5KaY", "atsignCreatedOn": "2020-07-25T05:51:50.707Z", "atsignName": "66voluntary", "atsignType": "free" }, { "_id": "5f1bc931df46bd480d315711", "inviteCode": "d21ecbcc2118f357b1ca29b058f0a010a0c6f6b766a8ade0c0b6ff271dd2a55c", "inviteLink": "http://localhost:4200/welcome/ankurag0728@gmail.com/d21ecbcc2118f357b1ca29b058f0a010a0c6f6b766a8ade0c0b6ff271dd2a55c/false", "atsignCreatedOn": "2020-07-26T08:54:23.489Z", "atsignName": "yoursmineandourslabour", "atsignType": "free" }, { "isActivated": false, "_id": "5f1d4a2556ef9874e31bb3ff", "inviteCode": "00b7d3a37814dfcf69cbfe1cc8a791a4a41d56cbf510e36b8639c01fbd595acc", "inviteLink": "http://localhost:4200/welcome/ankurag0728@gmail.com/00b7d3a37814dfcf69cbfe1cc8a791a4a41d56cbf510e36b8639c01fbd595acc/false", "atsignCreatedOn": "2020-07-26T09:18:08.082Z", "atsignName": "supporting64", "atsignType": "paid" }], "inviteFriendDetails": [{ "_id": "5f1d3f68a3455d6c08336dab", "inviteCodefriends": "577e9c9e8d61e282a7ec253220e9465963ea768ee400cbc6b3cd1dfc7b3503b4", "used": false, "inviteLink": "http://localhost:4200/welcome/d2itechnology.ankur@gmail.com/577e9c9e8d61e282a7ec253220e9465963ea768ee400cbc6b3cd1dfc7b3503b4/false", "sentOn": "2020-07-26T08:31:36.436Z" }], "invitedBy": "", "userStatus": "Active", "userRole": "User", "email": "ankurag0728@gmail.com", "saltSecret": "$2a$10$Dm2iSE.iCotThPXtn0kQse", "__v": 0, "mobileOtp": 4019, "otpGenerateTime": "2020-07-26T09:17:37.997Z", "productNotificationEmail": true },
        { "_id": "5f1d258e085f7b5d12c831bd", "mobileVerified": true, "invitedOn": "2020-07-26T06:41:18.263Z", "reserveTime": "1595745678263", "atsignDetails": [{ "_id": "5f1bc16e6c00c73cc3dca9c4", "inviteCode": "asasas", "atsignCreatedOn": "2020-07-25T05:51:50.707Z", "atsignName": "12voluntary", "atsignType": "free" }, { "_id": "5f1bc931df46bd480d315713", "inviteCode": "asasasas212", "inviteLink": "", "atsignCreatedOn": "2020-07-26T08:54:23.489Z", "atsignName": "yoursmineandours23", "atsignType": "free" }], "inviteFriendDetails": [], "invitedBy": "", "userStatus": "Active", "userRole": "User", "email": "test@testsite.in", "saltSecret": "$2a$10$5xNQXDu/kWUfbDg71GC1Fe", "__v": 0 },
        { "_id": "5f1d379052c1de6a0f247640", "mobileVerified": false, "invitedOn": "2020-07-26T07:58:08.320Z", "reserveTime": "1595750288320", "atsignDetails": [{ "_id": "5f1d379052c1de6a0f247641", "inviteCode": "P39t4" }], "inviteFriendDetails": [], "invitedBy": "", "userStatus": "Invited", "userRole": "User", "email": "ankurag728@gmail.com", "saltSecret": "$2a$10$ALO2Dq7XPHuhtkJB9ou70u", "__v": 0 },
        { "_id": "5f1d3f68a3455d6c08336dac", "mobileVerified": false, "invitedOn": "2020-07-26T08:31:36.440Z", "reserveTime": "1595752296440", "atsignDetails": [], "inviteFriendDetails": [], "invitedBy": "ankurag0728@gmail.com", "userStatus": "Invited", "userRole": "User", "email": "d2itechnology.ankur@gmail.com", "saltSecret": "$2a$10$ErtiSYyrymUDHOqtIWX9U.", "__v": 0 }
    ]
    constructor() {
    }
    static find(findCriteria, projection = null, records = this.users ) {
        let results = []
        if (!records) records = this.users
        records.forEach(record => {
            let match = []
            if(Object.keys(findCriteria).length==1 && findCriteria['$and']){
                findCriteria = findCriteria['$and'].reduce((acc, obj) => { return { ...acc, ...obj } }, {})
            }
            for (let key in findCriteria) {
                
                let recordValue = key.split('.').reduce((acc, val) => acc[val], record)
                if (Array.isArray(recordValue)) {
                    if (typeof findCriteria[key] === 'object') {
                        for (let findCriteriaPerKey in findCriteria[key]) {
                            if(findCriteriaPerKey == '$elemMatch'){
                                findCriteria[key] = findCriteria[key][findCriteriaPerKey]
                            }
                            if((findCriteriaPerKey == '$and' )){
                                findCriteria[key] = findCriteria[key][findCriteriaPerKey].reduce((acc, obj) => { return { ...acc, ...obj } }, {})
                            }

                            if(findCriteriaPerKey == '$all'){
                                findCriteria[key] = findCriteria[key][findCriteriaPerKey].reduce((acc, obj) => { 
                                    if(obj['$elemMatch']) obj = obj['$elemMatch']
                                    return { ...acc, ...obj } 
                                }, {})
                            }

                            for (let childKey in findCriteria[key]) {
                                let childSearchParam = findCriteria[key][childKey]
                                if (typeof childSearchParam === 'object') {
                                    for (let operator in childSearchParam) {
                                        if (operator == "$gte") {
                                            if (recordValue.some(rec => rec[childKey] >= childSearchParam['$gte'])) {match.push(true);continue}
                                            match.push(recordValue.some(rec => {
                                                if (isDate(rec[childKey]) && isDate(childSearchParam['$gte'])) {
                                                    childSearchParam['$gte'] = new Date(childSearchParam['$gte'])
                                                    rec[childKey] = new Date(rec[childKey])
                                                }
                                                return rec[childKey] >= childSearchParam['$gte']
                                            }))
                                        }
                                        if (operator == "$lte") {
                                            if (recordValue.some(rec => rec[childKey] <= childSearchParam['$gte'])) {match.push(true);continue}
                                            
                                            match.push(recordValue.some(rec => {
                                                if (isDate(rec[childKey]) && isDate(childSearchParam['$lte'])) {
                                                    childSearchParam['$lte'] = new Date(childSearchParam['$lte'])
                                                    rec[childKey] = new Date(rec[childKey])
                                                }
                                                return rec[childKey] <= childSearchParam['$lte']
                                            }))
                                        }
                                        if (operator == "$gt") {
                                            if (recordValue.some(rec => rec[childKey] > childSearchParam['$gt'])) {match.push(true);continue}
                                            match.push(recordValue.some(rec => {
                                                if (isDate(rec[childKey]) && isDate(childSearchParam['$gt'])) {
                                                    childSearchParam['$gt'] = new Date(childSearchParam['$gt'])
                                                    rec[childKey] = new Date(rec[childKey])
                                                }
                                                return rec[childKey] > childSearchParam['$gt']
                                            }))
                                        }
                                        if (operator == "$lt") {
                                            if (recordValue.some(rec => rec[childKey] < childSearchParam['$lt'])) {match.push(true);continue}
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
                                if (recordValue >= findCriteria[key]['$lt']) {match.push(true);continue}
                                if (isDate(recordValue) && isDate(findCriteria[key]['$gte'])) {
                                    findCriteria[key]['$gte'] = new Date(findCriteria[key]['$gte'])
                                    recordValue = new Date(recordValue)
                                }
                                match.push(recordValue >= findCriteria[key]['$gte'])
                            }
                            if (operator == "$lte") {
                                if (recordValue <= findCriteria[key]['$lt']) {match.push(true);continue}
                                if (isDate(recordValue) && isDate(findCriteria[key]['$gte'])) {
                                    findCriteria[key]['$gte'] = new Date(findCriteria[key]['$gte'])
                                    recordValue = new Date(recordValue)
                                }
                                match.push(recordValue <= findCriteria[key]['$lte'])
                            }
                            if (operator == "$gt") {
                                if (recordValue > findCriteria[key]['$lt']) {match.push(true);continue}
                                if (isDate(recordValue) && isDate(findCriteria[key]['$gte'])) {
                                    findCriteria[key]['$gte'] = new Date(findCriteria[key]['$gte'])
                                    recordValue = new Date(recordValue)
                                }
                                match.push(recordValue > findCriteria[key]['$gt'])
                            }
                            if (operator == "$lt") {
                                if (recordValue < findCriteria[key]['$lt']) {match.push(true);continue}
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
        
        return this.find(findCriteria,null,records)
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

const { expect } = require('../lib/main');

const mongodbStub = {
    function(id) {
        return id
    }
}

var reportService = proxyquire('./../../services/reports.service', {
    './../models/user.model': UserStub,
});


describe('Report service', function () {

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
        expect(reportService).to.be.an('object');
        expect(reportService).to.have.property('getUsersForReport')
        done()
    })
    

    it('must return a valid object', async function () {
        let paginatedData2 = {...paginationData}
        paginatedData2.sortOrder = 'desc'
        const result = await reportService.getUsersForReport(paginatedData2)
        expect(result).to.be.an('object')
        expect(result).to.have.property('csvData')
        expect(result).to.have.property('pageNo')
        expect(result).to.have.property('totalPage')
        expect(result).to.have.property('totalData')
    })

    it('must return a valid object', async function () {
        const result = await reportService.getUsersForReport(paginationData)
        expect(result).to.be.an('object')
        expect(result).to.have.property('csvData')
        expect(result).to.have.property('pageNo')
        expect(result).to.have.property('totalPage')
        expect(result).to.have.property('totalData')
    })

    it('must return a valid data for "atsignType:all"', async function () {
        const result = await reportService.getUsersForReport(paginationData)
        expect(result).to.be.an('object')
        expect(result).to.have.property('csvData')
        expect(result.csvData.header).to.be.an('object')
        expect(result.csvData.header.atsignName).to.be.equal('@sign Name')
        expect(result.csvData.header.email).to.be.equal('Email')
        expect(result.csvData.header.contact).to.be.equal('Mobile No.')
        expect(result.csvData.header.payAmount).to.be.equal('Paid Amount')
        expect(result.csvData.header.atsignCreatedOn).to.be.equal('Date')
        expect(result.csvData.header.premiumAtsignType).to.be.equal('@sign Type')
        expect(result.csvData.rows).to.be.an('array')
        expect(result.csvData.rows.length).to.be.equal(2)
        expect(result.csvData.rows[0].atsignName).to.be.equal('12voluntary')
        expect(result.csvData.rows[1].atsignName).to.be.equal('66voluntary')
        expect(result.totalPage).to.be.equal(3)
        expect(result.totalData).to.be.equal(5)
    })

    it('must return a valid data for "atsignType:all-paid"', async function () {
        let paginatedData2 = { ...paginationData }
        paginatedData2.atsignType = 'all-paid'
        const result = await reportService.getUsersForReport(paginatedData2)
        expect(result).to.be.an('object')
        expect(result).to.have.property('csvData')
        expect(result.csvData.header).to.be.an('object')
        expect(result.csvData.header.atsignName).to.be.equal('@sign Name')
        expect(result.csvData.header.email).to.be.equal('Email')
        expect(result.csvData.header.contact).to.be.equal('Mobile No.')
        expect(result.csvData.header.payAmount).to.be.equal('Paid Amount')
        expect(result.csvData.header.atsignCreatedOn).to.be.equal('Date')
        expect(result.csvData.header.premiumAtsignType).to.be.equal('@sign Type')
        expect(result.csvData.rows).to.be.an('array')
        expect(result.csvData.rows.length).to.be.equal(1)
        expect(result.csvData.rows[0].atsignName).to.be.equal('supporting64')
    })

    it('must return false for invalid assignType', async function () {
        let paginatedData2 = { ...paginationData }
        paginatedData2.atsignType = 'free'
        const result = await reportService.getUsersForReport(paginatedData2)
        expect(result).to.be.an('boolean')
        expect(result).to.be.equal(false)
    })

    it('must return data for all required atsignType', async function () {
        // free
        // 'paid',

        let paginatedData2 = { ...paginationData }

        let atsignType = ['all', 'all-free', 'all-paid', 'all-reserved', 'all-custom', 'all-single', 'all-three'];
        for (let i in atsignType) {
            paginatedData2.atsignType = atsignType[i]
            let result = await reportService.getUsersForReport(paginatedData2)
            expect(result).to.be.an('object')
            expect(result).to.have.property('csvData')
            expect(result).to.have.property('pageNo')
            expect(result).to.have.property('totalPage')
            expect(result).to.have.property('totalData')
        }
    })

    it('must return valid csv file', async function () {
        let paginationData2 = {   ...paginationData}
        paginationData2.csv= 'all'
        let result = await reportService.getUsersForReport(paginationData2)
        expect(result).to.be.an('object')
        expect(result).to.have.property('fileName')
        expect(result.fileName).to.be.equal('all_7-20-2020_7-30-2020.csv')
    })

    // it('csv file exists in fs', async function (npp) {
    //     //Need to implement
    //     expect(true).to.be.equal(true)
    // })

    describe('User Reports', function () {
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



        });

        afterEach(() => {
            Array.prototype.sort = sortFunc
            delete Array.prototype.skip
            delete Array.prototype.limit

        });

        

        it('must return valid csv file', async function () {
            let paginatedData2 = { ...paginationData }
            paginatedData2.atsignType = 'all-users'
            paginatedData2.csv = 'all'
            const result = await reportService.getUsersForReport(paginatedData2)
            expect(result).to.be.an('object')
            expect(result).to.have.property('fileName')
            expect(result.fileName).to.be.equal('all-users_7-20-2020_7-30-2020.csv')
            Array.prototype.sort = sortFunc
            delete Array.prototype.skip
            delete Array.prototype.limit
        })

        it('must return valid object for "atsignType:all-users"', async function () {
            let paginatedData2 = { ...paginationData }
            paginatedData2.sortBy = 'email'
            paginatedData2.sortOrder = 'asc'
            paginatedData2.atsignType = 'all-users'
            const result = await reportService.getUsersForReport(paginatedData2)
            expect(result).to.be.an('object')
            expect(result).to.have.property('csvData')
            expect(result.csvData.header).to.be.an('object')
            expect(result.csvData.header.email).to.be.equal('Email')
            expect(result.csvData.header.contact).to.be.equal('Mobile No.')
            expect(result.csvData.header.atsignCreatedOn).to.be.equal('Date')
            expect(result.csvData.header.userStatus).to.be.equal('Status')
            expect(result.csvData.header.freeAtsignCount).to.be.equal('Free @signs')
            expect(result.csvData.header.paidAtsignCount).to.be.equal('Paid @signs')
            expect(result.csvData.header.totalAtsignCount).to.be.equal('Total @signs')
            expect(result.csvData.rows).to.be.an('array')
            expect(result.csvData.rows.length).to.be.equal(2)
            expect(result.csvData.rows[0].email).to.be.equal('ankurag0728@gmail.com')
            // expect(result.csvData.rows[0].freeAtsignCount).to.be.equal(2)
            // expect(result.csvData.rows[0].paidAtsignCount).to.be.equal(1)
            // expect(result.csvData.rows[0].totalAtsignCount).to.be.equal(3)
            
            expect(result.csvData.rows[1].email).to.be.equal('test@testsite.in')
            // expect(result.csvData.rows[1].freeAtsignCount).to.be.equal(2)
            // expect(result.csvData.rows[1].paidAtsignCount).to.be.equal(0)
            // expect(result.csvData.rows[1].totalAtsignCount).to.be.equal(2)

        })

        it('must return valid object for "atsignType:all-invite"', async function () {
            let paginatedData2 = { ...paginationData }
            paginatedData2.sortBy = 'email'
            paginatedData2.sortOrder = 'asc'
            paginatedData2.atsignType = 'all-invite'
            const result = await reportService.getUsersForReport(paginatedData2)
            expect(result).to.be.an('object')
            expect(result).to.have.property('csvData')
            expect(result.pageNo).to.be.equal(1)
            expect(result.totalPage).to.be.equal(1)
            expect(result.totalData).to.be.equal(2)
            expect(result.csvData.header).to.be.an('object')
            expect(result.csvData.header.email).to.be.equal('Email')
            expect(result.csvData.header.contact).to.be.equal('Mobile No.')
            expect(result.csvData.header.atsignCreatedOn).to.be.equal('Date')
            expect(result.csvData.header.userStatus).to.be.equal('Status')
            expect(result.csvData.header.atsignType).to.be.equal('Type')
            expect(result.csvData.rows).to.be.an('array')
            expect(result.csvData.rows.length).to.be.equal(2)
            expect(result.csvData.rows[0].email).to.be.equal('ankurag728@gmail.com')
            expect(result.csvData.rows[1].email).to.be.equal('d2itechnology.ankur@gmail.com')

        })

        it('must return valid object for "atsignType:friend-invite"', async function () {
            let paginatedData2 = { ...paginationData }
            paginatedData2.sortBy = 'email'
            paginatedData2.sortOrder = 'asc'
            paginatedData2.atsignType = 'friend-invite'
            const result = await reportService.getUsersForReport(paginatedData2)
            expect(result).to.be.an('object')
            expect(result).to.have.property('csvData')
            expect(result.pageNo).to.be.equal(1)
            expect(result.totalPage).to.be.equal(1)
            expect(result.totalData).to.be.equal(1)
            expect(result.csvData.header).to.be.an('object')
            expect(result.csvData.header.email).to.be.equal('Email')
            expect(result.csvData.header.contact).to.be.equal('Mobile No.')
            expect(result.csvData.header.freeAtsignCount).to.be.equal('Free @signs')
            expect(result.csvData.header.paidAtsignCount).to.be.equal('Paid @signs')
            expect(result.csvData.header.totalAtsignCount).to.be.equal('Total @signs')
            expect(result.csvData.header.activeCount).to.be.equal('Total Active Invites')
            expect(result.csvData.header.inactiveCount).to.be.equal('Total Pending Invites')
            expect(result.csvData.header.invitedCount).to.be.equal('Total Invites')
            expect(result.csvData.rows).to.be.an('array')
            expect(result.csvData.rows.length).to.be.equal(1)
            expect(result.csvData.rows[0].email).to.be.equal('ankurag0728@gmail.com')
            expect(result.csvData.rows[0].inactiveCount).to.be.equal(1)
            expect(result.csvData.rows[0].invitedCount).to.be.equal(1)
        })

        it('must return valid object for "atsignType:referred-by"', async function () {
            let paginatedData2 = { ...paginationData }
            paginatedData2.sortBy = 'email'
            paginatedData2.sortOrder = 'asc'
            paginatedData2.atsignType = 'referred-by'
            const result = await reportService.getUsersForReport(paginatedData2)
            expect(result).to.be.an('object')
            expect(result).to.have.property('csvData')
            expect(result.pageNo).to.be.equal(1)
            expect(result.totalPage).to.be.equal(0)
            expect(result.totalData).to.be.equal(0)
            expect(result.csvData.header).to.be.an('object')
            expect(result.csvData.header.email).to.be.equal('Email')
            expect(result.csvData.header.contact).to.be.equal('Mobile No.')
            expect(result.csvData.header.freeAtsignCount).to.be.equal('Free @signs')
            expect(result.csvData.header.paidAtsignCount).to.be.equal('Paid @signs')
            expect(result.csvData.header.totalAtsignCount).to.be.equal('Total @signs')
            expect(result.csvData.header.activeCount).to.be.equal('Total Active Invites')
            expect(result.csvData.header.inactiveCount).to.be.equal('Total Pending Invites')
            expect(result.csvData.header.invitedCount).to.be.equal('Total Invites')
            expect(result.csvData.rows).to.be.an('array')
            expect(result.csvData.rows.length).to.be.equal(0)
            
        })

        it('must return valid object for "atsignType:abcd"', async function () {
            let paginatedData2 = { ...paginationData }
            paginatedData2.sortBy = 'email'
            paginatedData2.sortOrder = 'asc'
            paginatedData2.atsignType = 'abcd'
            const result = await reportService.getUsersForReport(paginatedData2)
            expect(result).to.be.an('boolean')
            expect(result).to.be.equal(false)
            
            
        })

        it('must return valid object for "atsignType:all-free-users"', async function () {
            let paginatedData2 = { ...paginationData }
            paginatedData2.sortBy = 'email'
            paginatedData2.sortOrder = 'asc'
            paginatedData2.atsignType = 'all-free-users'
            const result = await reportService.getUsersForReport(paginatedData2)
            expect(result).to.be.an('object')
            expect(result).to.have.property('csvData')
            expect(result.pageNo).to.be.equal(1)
            expect(result.totalPage).to.be.equal(1)
            expect(result.totalData).to.be.equal(2)
            expect(result.csvData.header).to.be.an('object')
            expect(result.csvData.header.email).to.be.equal('Email')
            expect(result.csvData.header.contact).to.be.equal('Mobile No.')
            expect(result.csvData.header.freeAtsignCount).to.be.equal('Free @signs')
            expect(result.csvData.header.paidAtsignCount).to.be.equal('Paid @signs')
            expect(result.csvData.header.totalAtsignCount).to.be.equal('Total @signs')
            expect(result.csvData.header.atsignCreatedOn).to.be.equal('Date')
            expect(result.csvData.header.userStatus).to.be.equal('Status')
            expect(result.csvData.rows).to.be.an('array')
            expect(result.csvData.rows[0].email).to.be.equal('ankurag0728@gmail.com')
            expect(result.csvData.rows[1].email).to.be.equal('test@testsite.in')
        })

        it('must return valid object for "atsignType:all-paid-users"', async function () {
            let paginatedData2 = { ...paginationData }
            paginatedData2.sortBy = 'email'
            paginatedData2.sortOrder = 'asc'
            paginatedData2.atsignType = 'all-paid-users'
            const result = await reportService.getUsersForReport(paginatedData2)
            expect(result).to.be.an('object')
            expect(result).to.have.property('csvData')
            expect(result.pageNo).to.be.equal(1)
            expect(result.totalPage).to.be.equal(0)
            expect(result.totalData).to.be.equal(0)
            expect(result.csvData.header).to.be.an('object')
            expect(result.csvData.header.email).to.be.equal('Email')
            expect(result.csvData.header.contact).to.be.equal('Mobile No.')
            expect(result.csvData.header.freeAtsignCount).to.be.equal('Free @signs')
            expect(result.csvData.header.paidAtsignCount).to.be.equal('Paid @signs')
            expect(result.csvData.header.totalAtsignCount).to.be.equal('Total @signs')
            expect(result.csvData.header.atsignCreatedOn).to.be.equal('Date')
            expect(result.csvData.header.userStatus).to.be.equal('Status')
            expect(result.csvData.rows).to.be.an('array')
            
        })
    })

})

