const proxyquire = require('proxyquire');
const { expect } = require('../lib/main');
const emojiRegexFunction = require('emoji-regex');
const emojiRegex = emojiRegexFunction();
class AtsignStub {
    static atSigns = [
        { _id: '1', name: 'atsign1', type: 'paid' },
        { _id: '2', name: 'atsign3', type: 'paid' },
        { _id: '3', name: 'atsign5', type: 'paid' },
        { _id: '4', name: 'atsign7', type: 'paid' },
        { _id: '5', name: 'atsign9', type: 'paid' },
        { _id: '6', name: 'atsign2', type: 'free' },
        { _id: '7', name: 'atsign4', type: 'free' },
        { _id: '8', name: 'atsign6', type: 'free' },
        { _id: '9', name: 'atsign8', type: 'free' },
        { _id: '10', name: 'atsign10', type: 'free' },
        { _id: '11', name: 'atsign12', type: 'free' },
    ]
    constructor() {
        return AtsignStub
    }
    static catch() {
        return this
    }

    static save(name) {
        if (!name) name = AtsignStub.name;
        if (!name) throw Error('Invalid value')
        if (AtsignStub.findOne({ name })) throw Error('Already Exist')
        AtsignStub.atSigns.push({ name, _id: '120' })
        return AtsignStub
    }
    static results = []
    static exec() {
        return this.results;
    }
    static sort(obj) {
        obj = obj && Object.keys(obj).length > 0 ? obj : { _id: 1 }
        let property = Object.keys(obj)[0]
        let sortType = obj[property]
        let property1, property2
        this.results = this.results.sort(function (a, b) {
            if (sortType == 1 || sortType == 'asc') {
                property1 = typeof a[property] === 'string' ? a[property].toUpperCase() : a[property];
                property2 = typeof b[property] === 'string' ? b[property].toUpperCase() : b[property];
            } else {
                property2 = typeof a[property] === 'string' ? a[property].toUpperCase() : a[property];
                property1 = typeof b[property] === 'string' ? b[property].toUpperCase() : b[property];
            }
            if (property1 < property2) {
                return -1;
            }
            if (property1 > property2) {
                return 1;
            }
            return 0;
        });
        return this;
    }
    static skip(skipNo) {
        this.results = this.results.slice(skipNo)
        return this;
    }
    static limit(limit) {
        this.results = this.results.slice(0, limit)
        return this;
    }
    static lean() {
        return this;
    }
    static find(findCriteria) {
        let atSigns = this.atSigns.filter(atSign => {
            let propertyMatch = [];
            Object.keys(findCriteria).forEach(property => {
                propertyMatch.push(atSign[property] === findCriteria[property] || atSign[property].indexOf(findCriteria[property]) > -1)
            })
            return propertyMatch.indexOf(false) == -1
        });
        this.results = atSigns
        return this
    }
    static findOneAndDelete(findCriteria) {
        let atSignsIndex = this.atSigns.findIndex(atSign => {
            let propertyMatch = [];
            Object.keys(findCriteria).forEach(property => {
                propertyMatch.push(atSign[property] === findCriteria[property] || atSign[property].indexOf(findCriteria[property]) > -1)
            })
            return propertyMatch.indexOf(false) == -1
        });

        if (atSignsIndex > -1) {
            this.atSigns.splice(atSignsIndex, 1)
            return true;
        } else {
            return false;
        }
    }
    static findOneAndUpdate(findCriteria, updateObject) {
        let atSignsIndex = this.atSigns.findIndex(atSign => {
            let propertyMatch = [];
            Object.keys(findCriteria).forEach(property => {
                propertyMatch.push(atSign[property] === findCriteria[property] || atSign[property].indexOf(findCriteria[property]) > -1)
            })
            return propertyMatch.indexOf(false) == -1
        });
        if (atSignsIndex < 0) return
        for (let key in updateObject) {
            this.atSigns[atSignsIndex][key] = updateObject[key]
        }
    }
    static countDocuments(findCriteria) {
        let atSigns = this.atSigns.filter(atSign => {
            let propertyMatch = [];
            Object.keys(findCriteria).forEach(property => {
                propertyMatch.push(atSign[property] === findCriteria[property] || atSign[property].indexOf(findCriteria[property]) > -1)
            })
            return propertyMatch.indexOf(false) == -1
        });
        return atSigns.length
    }
    static findOne(findCriteria) {
        let atSign = this.atSigns.find(atSign => {
            let propertyMatch = [];
            Object.keys(findCriteria).forEach(property => {
                propertyMatch.push(atSign[property] === findCriteria[property] || atSign[property].indexOf(findCriteria[property]) > -1)
            })
            return propertyMatch.indexOf(false) == -1
        });
        return atSign || null
    }
}


class BrandStub {
    static brands = [
        { _id: '1', name: 'brands1', type: 'paid' },
        { _id: '2', name: 'brands3', type: 'paid' },
        { _id: '3', name: 'brands5', type: 'paid' },
        { _id: '4', name: 'brands7', type: 'paid' },
        { _id: '5', name: 'brands9', type: 'paid' },
        { _id: '6', name: 'brands2', type: 'free' },
        { _id: '7', name: 'brands4', type: 'free' },
        { _id: '8', name: 'brands6', type: 'free' },
        { _id: '9', name: 'brands8', type: 'free' },
        { _id: '10', name: 'brands10', type: 'free' },
        { _id: '11', name: 'brands12', type: 'free' },
    ]
    static results = []
    constructor() {

        return BrandStub
    }
    static catch() {
        return this
    }

    static save(name) {
        if (!name) name = BrandStub.name;
        if (!name) throw Error('Invalid value')
        if (BrandStub.findOne({ name })) throw Error('Already Exist')
        BrandStub.brands.push({ name, _id: '120' })

        return BrandStub
    }
    static exec() {
        return this.results;
    }
    static sort(obj) {
        obj = obj && Object.keys(obj).length > 0 ? obj : { _id: 1 }
        let property = Object.keys(obj)[0]
        let sortType = obj[property]
        let property1, property2;
        this.results = this.results.sort(function (a, b) {
            if (sortType == 1 || sortType == 'asc') {
                property1 = typeof a[property] === 'string' ? a[property].toUpperCase() : a[property];
                property2 = typeof b[property] === 'string' ? b[property].toUpperCase() : b[property];
            } else {
                property2 = typeof a[property] === 'string' ? a[property].toUpperCase() : a[property];
                property1 = typeof b[property] === 'string' ? b[property].toUpperCase() : b[property];
            }
            if (property1 < property2) {
                return -1;
            }
            if (property1 > property2) {
                return 1;
            }
            return 0;
        });
        return this;
    }
    static skip(skipNo) {
        this.results = this.results.slice(skipNo)
        return this;
    }
    static limit(limit) {
        this.results = this.results.slice(0, limit)
        return this;
    }
    static lean() {
        return this;
    }
    static find(findCriteria) {
        let brands = this.brands.filter(brand => {
            let propertyMatch = [];
            Object.keys(findCriteria).forEach(property => {
                propertyMatch.push(brand[property] === findCriteria[property] ? true : (Array.isArray(brand[property]) ? brand[property].indexOf(findCriteria[property]) > -1 : false))

            })
            return propertyMatch.indexOf(false) == -1
        });
        this.results = brands
        return this
    }
    static findOneAndDelete(findCriteria) {
        let brandIndex = this.brands.findIndex(brand => {
            let propertyMatch = [];
            Object.keys(findCriteria).forEach(property => {
                propertyMatch.push(
                    brand[property] === findCriteria[property] ?
                        true :
                        (Array.isArray(brand[property]) ? brand[property].indexOf(findCriteria[property]) > -1 : false))
            })
            return propertyMatch.indexOf(false) == -1
        });
        if (brandIndex > -1) {
            this.brands.splice(brandIndex, 1)
            return true;
        } else {
            return false;
        }
    }
    static findOneAndUpdate(findCriteria, updateObject) {

        let brandIndex = this.brands.findIndex(brand => {
            let propertyMatch = [];
            Object.keys(findCriteria).forEach(property => {
                propertyMatch.push(
                    brand[property] === findCriteria[property] ?
                        true :
                        (Array.isArray(brand[property]) ? brand[property].indexOf(findCriteria[property]) > -1 : false))
            })
            return propertyMatch.indexOf(false) == -1
        });

        if (brandIndex < 0) return
        for (let key in updateObject) {
            this.brands[brandIndex][key] = updateObject[key]
        }
    }
    static countDocuments(findCriteria) {
        let brands = this.brands.filter(brand => {
            let propertyMatch = [];
            Object.keys(findCriteria).forEach(property => {
                propertyMatch.push(brand[property] === findCriteria[property] || brand[property].indexOf(findCriteria[property]) > -1)
            })
            return propertyMatch.indexOf(false) == -1
        });
        return brands.length
    }
    static findOne(findCriteria) {
        let brand = this.brands.find(brand => {
            let propertyMatch = [];
            Object.keys(findCriteria).forEach(property => {
                propertyMatch.push(brand[property] === findCriteria[property] || brand[property].indexOf(findCriteria[property]) > -1)
            })
            return propertyMatch.indexOf(false) == -1
        });
        return brand || null
    }
}

const MongodbStub = {
    ObjectID: function (id) {
        return id
    }
}

const UtilityStub = {
    regexSpecialChars: function regexSpecialChars(inputStr) {
        let temp = inputStr.replace(emojiRegex, 'aaaa');
        let splCharRegex = /^[\w]+$/;
        return !splCharRegex.test(temp);
    }
}

const AtSignService = proxyquire('./../../services/atsign.service', {
    './../models/brands.model': BrandStub,
    './../models/atsigns.model': AtsignStub,
    '../config/UtilityFunctions': UtilityStub,
    'mongodb': MongodbStub
});

describe('AtSignService service', function () {
    it('must be a module', function (done) {
        expect(AtSignService).to.be.an('object');
        expect(AtSignService).to.have.property('getAllAtsigns')
        expect(AtSignService).to.have.property('addReserveAtsigns')
        expect(AtSignService).to.have.property('deleteSavedAtsign')
        expect(AtSignService).to.have.property('updateSavedAtsign')
        done()
    })

    describe('Get All Atsigns', function () {

        let getAllAtsignsParameter = {
            pageNo: 1,
            pageSize: 10,
            sortBy: 'name',
            sortOrder: 'asc',
            atsignType: 'atsign',
            searchTerm: ''
        }

        it('"getAllAtsigns" must be a function', function (done) {
            expect(AtSignService.getAllAtsigns).to.be.an('function');
            done()
        })

        it('"getAllAtsigns" must return paginated object', async function () {
            const result = await AtSignService.getAllAtsigns(getAllAtsignsParameter)
            expect(result).to.be.an('object');
            expect(result).to.have.property('atsigns');
            expect(result).to.have.property('pageNo');
            expect(result).to.have.property('totalPage');
            expect(result).to.have.property('totalData');
        })

        it('must have a valid atsign', async function () {
            const result = await AtSignService.getAllAtsigns(getAllAtsignsParameter)
            expect(result.atsigns).to.be.an('array');
            expect(result.atsigns.length).to.be.equal(10);
        })



        it('must return valid no of results', async function () {
            getAllAtsignsParameter.pageSize = 5;
            const result = await AtSignService.getAllAtsigns(getAllAtsignsParameter)
            expect(result.atsigns).to.be.an('array');
            expect(result.atsigns.length).to.be.equal(5);
        })

        it('must have valid "totalPage"', async function () {
            getAllAtsignsParameter.pageSize = 5;
            const result = await AtSignService.getAllAtsigns(getAllAtsignsParameter)
            expect(result.totalPage).to.be.an('number');
            expect(result.totalPage).to.be.equal(3);
        })

        it('must have valid "totalData"', async function () {
            getAllAtsignsParameter.pageSize = 5;
            const result = await AtSignService.getAllAtsigns(getAllAtsignsParameter)
            expect(result.totalData).to.be.an('number');
            expect(result.totalData).to.be.equal(11);
        })

        it('must have desc sorting by name', async function () {
            getAllAtsignsParameter.sortOrder = 'desc';
            const result = await AtSignService.getAllAtsigns(getAllAtsignsParameter)
            expect(result.atsigns[0]).to.be.an('object');
            expect(result.atsigns[0].name).to.be.equal('atsign9');
        })

        it('must have valid value for atsignType', async function () {
            getAllAtsignsParameter.atsignType = 'Brand';
            const result = await AtSignService.getAllAtsigns(getAllAtsignsParameter)
            expect(result.atsigns[0]).to.be.an('object');
            expect(result.atsigns[0].name).to.be.equal('brands9');
        })
    })

    describe('Add Reserve Atsigns', function () {
        it('"addReserveAtsigns" must be a function', function (done) {
            expect(AtSignService.addReserveAtsigns).to.be.an('function');
            done()
        })

        it('must add a new atsign successfully', async function () {
            expect(AtsignStub.atSigns.length).to.be.equal(11);
            const results = await AtSignService.addReserveAtsigns('customatsign', 'Atsign')
            expect(results).to.be.an('object');
            expect(results).to.have.property('status');
            expect(results.status).to.equal('success');
        })

        it('must enter valid atsign entry in db', function (done) {
            expect(AtsignStub.atSigns).to.be.an('array');
            expect(AtsignStub.atSigns.length).to.be.equal(12);
            done()
        })

        it('must add a new Brand successfully', async function () {
            expect(BrandStub.brands.length).to.be.equal(11);
            const results = await AtSignService.addReserveAtsigns('customBrand', 'Brand')
            expect(results).to.be.an('object');
            expect(results).to.have.property('status');
            expect(results.status).to.equal('success');
        })

        it('must enter valid Brand entry in db', function (done) {
            expect(BrandStub.brands).to.be.an('array');
            expect(BrandStub.brands.length).to.be.equal(12);
            done()
        })

    })
    describe('Delete Saved Atsign', function () {
        it('"deleteSavedAtsign" must be a function', function (done) {
            expect(AtSignService.deleteSavedAtsign).to.be.an('function');
            done()
        })

        it('must delete a Brand successfullly', async function () {
            expect(BrandStub.brands.findIndex(brand => brand._id == '5')).to.not.be.equal(-1);

            const results = await AtSignService.deleteSavedAtsign('5', 'Brand')

            expect(results).to.be.an('object');
            expect(results).to.have.property('status');
            expect(results.status).to.equal('success');
        })

        it('must delete a Brand from db', function (done) {
            expect(BrandStub.brands).to.be.an('array');
            expect(BrandStub.brands.findIndex(brand => brand._id == '5')).to.be.equal(-1);
            done()
        })

        it('must delete a "Atsign" successfullly', async function () {
            expect(AtsignStub.atSigns.findIndex(atsign => atsign._id == '5')).to.not.be.equal(-1);
            const results = await AtSignService.deleteSavedAtsign('5', 'Atsign')
            expect(results).to.be.an('object');
            expect(results).to.have.property('status');
            expect(results.status).to.equal('success');
        })

        it('must delete a Atsign from db', function (done) {
            expect(AtsignStub.atSigns).to.be.an('array');
            expect(AtsignStub.atSigns.findIndex(atsign => atsign._id == '5')).to.be.equal(-1);
            done()
        })

        it('must throw error if id is null', async function () {
            const results = await AtSignService.deleteSavedAtsign(null, 'Atsign')
            expect(results).to.be.an('object');
            expect(results).to.have.property('status');
            expect(results.status).to.equal('error');
            expect(results.message).to.equal('Please provide @sign to delete');
        })

        it('must throw error if id is invalid', async function () {
            const results = await AtSignService.deleteSavedAtsign('100', 'Atsign')
            expect(results).to.be.an('object');
            expect(results).to.have.property('status');
            expect(results.status).to.equal('error');
            expect(results.message).to.equal('Please provide @sign to delete');
        })
    })

    describe('Update Saved Atsign', function () {
        it('"updateSavedAtsign" must be a function', function (done) {
            expect(AtSignService.updateSavedAtsign).to.be.an('function');
            done()
        })

        it('must update a Brand successfullly', async function () {
            const results = await AtSignService.updateSavedAtsign('8', 'Brand', 'brandeight')
            expect(results).to.be.an('object');
            expect(results).to.have.property('status');
            expect(results.status).to.equal('success');
        })

        it('must update a Brand from db', function (done) {
            expect(BrandStub.brands).to.be.an('array');
            expect(BrandStub.brands.findIndex(brand => brand._id == '8')).to.not.be.equal(-1);
            expect(BrandStub.brands.find(brand => brand._id == '8').name).to.be.equal('brandeight');
            done()
        })

        it('must delete a "Atsign" successfullly', async function () {
            const results = await AtSignService.updateSavedAtsign('8', 'Atsign', 'atsigneight')
            expect(results).to.be.an('object');
            expect(results).to.have.property('status');
            expect(results.status).to.equal('success');
        })

        it('must delete a Atsign from db', function (done) {
            expect(AtsignStub.atSigns).to.be.an('array');
            expect(AtsignStub.atSigns.findIndex(atsign => atsign._id == '8')).to.not.be.equal(-1);
            expect(AtsignStub.atSigns.find(atsign => atsign._id == '8').name).to.be.equal('atsigneight');
            done()
        })

        it('must throw error if atsign already exist', async function () {
            const results = await AtSignService.updateSavedAtsign('1000', 'Brand', 'brandeight')
            expect(results).to.be.an('object');
            expect(results).to.have.property('status');
            expect(results.status).to.equal('error');
            expect(results.message).to.equal('@sign already exist');
            const results2 = await AtSignService.updateSavedAtsign('1000', 'Atsign', 'atsigneight')
            expect(results2).to.be.an('object');
            expect(results2).to.have.property('status');
            expect(results2.status).to.equal('error');
            expect(results2.message).to.equal('@sign already exist');
        })

        it('must throw error if name is invalid', async function () {
            const results = await AtSignService.updateSavedAtsign('1000', 'Brand', 'bra***ndeight')
            expect(results).to.be.an('object');
            expect(results).to.have.property('status');
            expect(results.status).to.equal('error');
            expect(results.message).to.equal('Special Characters not allowed in @sign name');
        })
    })
})



