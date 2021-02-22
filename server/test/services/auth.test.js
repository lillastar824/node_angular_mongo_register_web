const proxyquire = require('proxyquire');
const { expect } = require('../lib/main');

const userStub = {
    users: [{ _id: '', token: [] }],
    findByIdAndUpdate: function (findCriteria, updateCriteria) {
        let userIndex = this.users.findIndex(user => {
            return user._id = findCriteria._id
        });
        Object.keys(updateCriteria.$set).forEach(property => {
            this.users[userIndex][property] = updateCriteria.$set[property]
        });
    },
    findOne: function (findCriteria) {
        let user = this.users.find(user => {
            let propertyMatch = [];
            Object.keys(findCriteria).forEach(property => {
                propertyMatch.push(user[property] === findCriteria[property] || user[property].indexOf(findCriteria[property]) > -1)
            })
            return propertyMatch.indexOf(false) == -1
        });
        return user || null
    }
}

const mongodbStub = {
    ObjectID: function (id) {
        return id
    }
}

var authService = proxyquire('./../../services/auth.service', {
    './../models/user.model': userStub,
    'mongodb': mongodbStub
});

describe('auth service', function () {
    it('must be a module', function (done) {
        expect(authService).to.be.an('object');
        expect(authService).to.have.property('getToken')
        expect(authService).to.have.property('checkTokenExistInDb')
        expect(authService).to.have.property('logout')
        done()
    })

    describe('Get Token', function () {
        it('"getToken" must be a function', function (done) {
            expect(authService.getToken).to.be.an('function');
            done()
        })
        it('must return a valid token', async function () {
            const user = {
                _id: 'testuser1',
                generateJwt: function () {
                    return JSON.stringify({ id: this._id })

                }
            }
            let token = await authService.getToken(user)
            expect(token).to.be.an('string')
            expect(token).to.be.equal(JSON.stringify({ id: user._id }))
        })
        it('must enter a valid token in db', function (done) {
            const user = userStub.users.find(user => user._id == 'testuser1' && user.token.indexOf('{"id":"testuser1"}') > -1)
            expect(user).to.be.an('object')
            expect(user._id).to.be.equal('testuser1')
            expect(user.token).to.be.an('array')
            expect(user.token.length).to.be.equal(1)
            done()
        })
    })

    describe('Check Token Exist In DB', function () {
        it('"checkTokenExistInDb" must be a function', function (done) {
            expect(authService.checkTokenExistInDb).to.be.an('function');
            done()
        })
        it('Valid token : must return a valid user', async function () {
            const user = {
                _id: 'testuser1',
                generateJwt: function () {
                    return JSON.stringify({ id: this._id })
                }
            }
            let searchedUser = await authService.checkTokenExistInDb(user._id, user.generateJwt())
            expect(searchedUser).to.be.an('object')
            expect(searchedUser._id).to.be.equal('testuser1')
        })

        it('Invalid token : must return a null', async function () {
            const user = {
                _id: 'testuser1',
            }
            let searchedUser = await authService.checkTokenExistInDb(user._id, "12121")
            expect(searchedUser).to.be.equal(null)
        })

    })

    describe('Logout', function () {
        it('"logout" must be a function', function (done) {
            expect(authService.logout).to.be.an('function');
            done()
        })
        it('must remove all token in db', async function () {
            const user = {
                _id: 'testuser1',
            }
            await authService.logout(user._id)
            const dbUser = userStub.users.find(dbuser => dbuser._id == user._id)

            expect(dbUser).to.be.an('object')
            expect(dbUser.token).to.be.an('array')
            expect(dbUser.token.length).to.be.equal(0)
        })
    })
})

