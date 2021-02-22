 
const { chai, app, should, assert, expect } = require('./main');
let utility = require('../../config/UtilityFunctions');
// let expect = chai.expect;
// let assert = require('chai').assert


describe('Check email for vaildity', () => {

    it('Should return false if valid email', (done) => {
        let validEmail = "thisisvaild@gmail.com"
        let result = utility.checkValidEmail(validEmail);
        expect(result).to.be.a('boolean');
        expect(result).to.equal(false);
        done();
    });

    it('Should return true if invalid email', (done) => {
        let validEmail = "thisisinvalidgmail.com"
        let result = utility.checkValidEmail(validEmail);
        expect(result).to.be.a('boolean');
        expect(result).to.equal(true);
        done();
    });

    it('Should return true if contact no is given in email', (done) => {
        let validEmail = "8899221199"
        let result = utility.checkValidEmail(validEmail);
        expect(result).to.be.a('boolean');
        expect(result).to.equal(true);
        done();
    });
});

describe('Check for special character and emoji', () => {

    it('Should return true if string contains special characters', (done) => {
        let invalidSign = "atsign##@";
        let result = utility.regexSpecialChars(invalidSign);
        expect(result).to.be.a('boolean');
        expect(result).to.equal(true);
        done();
    });

    it('Should return false if string does not contains special characters except underscore', (done) => {
        let invalidSign = "atsign123_";
        let result = utility.regexSpecialChars(invalidSign);
        expect(result).to.be.a('boolean');
        expect(result).to.equal(false);
        done();
    });

    it('Should return true if string contains integer , character underscore and emoji', (done) => {
        let validSign = "atsign123_😀😁😂😃😄";
        let result = utility.regexSpecialChars(validSign);
        expect(result).to.be.a('boolean');
        expect(result).to.equal(false);
        done();
    });

    it('Should return true if string contains emoji only', (done) => {
        let validSign = "😀😁😂😃😄";
        let result = utility.regexSpecialChars(validSign);
        expect(result).to.be.a('boolean');
        expect(result).to.equal(false);
        done();
    });

    it('Should return correct count of emoji in string', (done) => {
        let validSign = "😀😁😂😃😄";
        let result = utility.regexCountEmoji(validSign);
        expect(result).to.equal(5);
        done();
    });

    it('Should return true if string contains emoji only', (done) => {
        let validSign = "😀😁😂😃😄";
        let result = utility.atSignEmojiOnly(validSign);
        expect(result).to.be.a('boolean');
        expect(result).to.equal(true);
        done();
    });

    it('Should return false if string does not contains emoji only', (done) => {
        let validSign = "😀😁😂😃😄atsign";
        let result = utility.atSignEmojiOnly(validSign);
        expect(result).to.be.a('boolean');
        expect(result).to.equal(false);
        done();
    });


});

describe('Check for special character and not emoji', () => {

    it('Should return true if string contains special characters', (done) => {
        let invalidSign = "atsign##@";
        let result = utility.regexSpecialChars(invalidSign);
        expect(result).to.be.a('boolean');
        expect(result).to.equal(true);
        done();
    });

    it('Should return false if string does not contains special characters except underscore', (done) => {
        let invalidSign = "atsign123_";
        let result = utility.regexSpecialChars(invalidSign);
        expect(result).to.be.a('boolean');
        expect(result).to.equal(false);
        done();
    });

    it('Should return true if string contains integer , character underscore and emoji', (done) => {
        let validSign = "atsign123_😀😁😂😃😄";
        let result = utility.regexSpecialChars(validSign);
        expect(result).to.be.a('boolean');
        expect(result).to.equal(false);
        done();
    });

    it('Should return true if string contains emoji only', (done) => {
        let validSign = "😀😁😂😃😄";
        let result = utility.regexSpecialChars(validSign);
        expect(result).to.be.a('boolean');
        expect(result).to.equal(false);
        done();
    });

});



