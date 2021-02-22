const mongoose = require('mongoose');
const emojiRegexFunction = require('emoji-regex');
const emojiRegex = emojiRegexFunction();
const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
const crypto = require('crypto');
const uuid = require('uuid');
const User = mongoose.model('User');
const Atsign = mongoose.model('Atsign');
const Brands = mongoose.model('brands');
const ReserveAtsigns = mongoose.model('Reserveatsigns');
const Dictionary = mongoose.model('dictionary');
const FirstNames = mongoose.model('firstNames');
const LastNames = mongoose.model('lastNames');
const Countries = mongoose.model('countries');
const States = mongoose.model('states');
const Cities = mongoose.model('cities');
const CryptoJs = require("crypto-js");
const { uniqueNamesGenerator, adjectives } = require('unique-names-generator');
const { allChoices, messages,CONSTANTS } = require('./const');
const defaultTimeLeft = 1200;
const transactions = mongoose.model('Transactions');
const ObjectId = require('mongodb').ObjectID;
const { exec } = require('child_process');

const shuffle = function (arrayToShuffle) {
    var currentIndex = arrayToShuffle.length,
        temporaryValue, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = arrayToShuffle[currentIndex];
        arrayToShuffle[currentIndex] = arrayToShuffle[randomIndex];
        arrayToShuffle[randomIndex] = temporaryValue;
    }
    return arrayToShuffle;
}
const calculateUTF7Length = async function (atsign) {
    return new Promise((resolve, reject) => {
        const ls = exec(`${process.env.LENGTH_SHELL ? process.env.LENGTH_SHELL : 'at-length'} ${atsign}`, function (error, stdout, stderr) {
            if (error) {
                reject(error)
            } else if (stderr) {
                reject(stderr)
            } else {
                resolve(Number(stdout))
            }
        })
    })
};
const generateRandom = function () {
    var dataArray = [];
    var randomNumber = Math.floor(Math.random() * 15);
    dataArray.push(allChoices['colors'][randomNumber]);
    randomNumber = Math.floor(Math.random() * 15);
    dataArray.push(allChoices['animals'][randomNumber]);
    randomNumber = Math.floor(Math.random() * 15);
    dataArray.push(allChoices['hobbies'][randomNumber]);
    randomNumber = Math.floor(Math.random() * 15);
    dataArray.push(allChoices['movies'][randomNumber]);
    randomNumber = Math.floor(Math.random() * 15);
    dataArray.push(allChoices['music'][randomNumber]);
    randomNumber = Math.floor(Math.random() * 15);
    dataArray.push(allChoices['sports'][randomNumber]);
    randomNumber = Math.floor(Math.random() * 15);
    dataArray.push(allChoices['foods'][randomNumber]);
    dataArray.push(Math.floor(Math.random() * 100) + 1);
    let randomNo = Math.floor(Math.random() * (+5 - +2)) + +2;
    let data = shuffle(dataArray).splice(0, randomNo);
    return data;
}
const findTimeStampTimeDiffMin = function (timeReserve) {
    let date = new Date();
    let timeNow = date.getTime();
    let diff = timeNow - timeReserve;
    let minutesDifference = Math.floor(diff / 1000 / 60);
    return minutesDifference;
}
const checkValidEmail = function (email) {
    return (!(emailRegex.test(email)))
}
const isEmailValid = function (email) {
    return emailRegex.test(email);
}
const checkValidMobile = function (contact) {
    const contactRegex = /^\+[1-9]\d{1,14}$/;
    return (!(contactRegex.test(contact)));
}
const isContactValid = function (contact) {
    contact = contact.replace(/ /g,'');
    const contactRegex = /^\+[1-9]\d{1,14}$/;
    return contactRegex.test(contact);
}
const regexSpecialChars = function (inputStr) {
    let temp = inputStr.replace(emojiRegex, 'aaaa');
    let splCharRegex = /^[\w]+$/;
    return !splCharRegex.test(temp);
}
const regexCountEmoji = function (inputStr) {
    let temp = inputStr.match(emojiRegex);
    return temp && temp.length;
}
const atSignEmojiOnly = function (inputStr) {
    let temp = inputStr.replace(emojiRegex, '');
    return temp.length === 0 ? true : false;
}
const generateInviteCode = function () {
    let inviteCode = uuid.v4();
    const hash = crypto.createHmac('sha256', inviteCode)
        .digest('hex');
    return hash;
}
const countAtsignLength = function(inputStr){
    let temp = inputStr.match(emojiRegex);
    let emojiLength = temp && temp.length ? temp.length : 0;
    let atsignWithoutEmoji = inputStr.replace(emojiRegex, '');
    let charLength = atsignWithoutEmoji && atsignWithoutEmoji.length ? atsignWithoutEmoji.length : 0
    return emojiLength + charLength
}

const checkSignAvailability = async function (input, returnPrice = false, type, isAdmin = false,userId=null) {
    try {
        let atsignName = input.toLowerCase();
        if (regexSpecialChars(atsignName)) {
            return false;
        }
        let utf7Length = await calculateUTF7Length(atsignName)
        if(utf7Length > 55) return false;
        
        if ((!isAdmin && countAtsignLength(atsignName) < 3) || countAtsignLength(atsignName) > 55) {
            return false;
        }
        const user = await User.find({ "atsignDetails.atsignName": { '$regex': `^${atsignName}$`, '$options': 'i' } });
        if (user.length > 0) {
            return false;
        }
        let reserveHandle = await ReserveAtsigns.findOne({ atsignName: { '$regex': `^${atsignName}$`, '$options': 'i' } });
        let alterRes = reserveHandle;
        if (reserveHandle) {
            let diff = findTimeStampTimeDiffMin(reserveHandle.createdOn);
            if (diff > defaultTimeLeft/60 || !(reserveHandle.timestamp && reserveHandle.timer_started)) {
                let deleteData = await ReserveAtsigns.deleteOne({ atsignName: { '$regex': `^${atsignName}$`, '$options': 'i' } });
                if (deleteData) {
                    reserveHandle = "";
                }
            }
        }
        if (reserveHandle && reserveHandle.userid !== userId) {
            return false;
        }
        const atsign = await Atsign.findOne({ name: { '$regex': `^${atsignName}$`, '$options': 'i' } });
        if (atsign) {
            return false;
        }
        const countries = await Countries.findOne({ name: atsignName });
        if (countries) {
            return false;
        }
        const states = await States.findOne({ name: atsignName });
        if (states) {
            return false;
        }
        const brands = await Brands.findOne({ name: atsignName });
        if (brands) {
            return 'brand';
        }
        let is_firstName;
        let is_lastName;
        let is_dictionary;
        let is_city;
        is_firstName = await FirstNames.findOne({ name: atsignName });
        is_lastName = await LastNames.findOne({ name: atsignName });
        is_dictionary = await Dictionary.findOne({ name: atsignName });
        is_city = await Cities.findOne({ name: atsignName });
        var price, handle_type;
        if ((type === 'free' || type === 'maketen') && (is_firstName || is_dictionary || is_lastName || is_city)) {
            return false;
        }
        if (type === 'maketen' && ((countAtsignLength(atsignName) == 3 && !is_firstName && !is_dictionary && !is_lastName && !is_city))) {
            return false;
        }
        if(alterRes && alterRes.userid === userId && (alterRes.price === 0 ||  alterRes.price === 10)){
            if (alterRes && alterRes.price === 0) {
                price = 0;
                handle_type = 'free';
            } else if (alterRes && alterRes.price === 10) {
                price = 10;
                handle_type = 'custom';
            }
        }
        else if ((countAtsignLength(atsignName) == 3 && !is_firstName && !is_dictionary && !is_lastName && !is_city) || (atSignEmojiOnly(atsignName) && regexCountEmoji(atsignName) === 3)) {
            price = 5000;
            handle_type = 'threeChar';
        } else {
            if (is_firstName || is_dictionary || is_lastName || is_city) {
                price = 1000;
                handle_type = 'singleWord';
            } else {
                price = 100;
                handle_type = 'custom';
            }
        }
        if(returnPrice){
          let data = {};
          data['price']= price;
          data['atsignName'] = input;
          data['handle_type'] = handle_type;
          data['reserveHandle'] = reserveHandle;
          return data;

        }
        return input;
    } catch (error) {
        return false;
    }
}
const decryptAtsign = function (ciphertext) {
    const bytes = CryptoJs.AES.decrypt(ciphertext, process.env.CRYPTO_KEY);
    return bytes.toString(CryptoJs.enc.Utf8);
}

const computeStandardAtsign = async function (data) {
    let arrayTocheck = data.arrayTocheck;
    let options = Object.values(data.arrayTocheck);
    for (let index in arrayTocheck) {
        if (index !== 'numbers' && allChoices[index] && allChoices[index].indexOf(arrayTocheck[index]) === -1) {
            options = await generateRandom();
        }
    }
    let array = [adjectives], length = 1;
    let uniquename = uniqueNamesGenerator({
        dictionaries: array,
        separator: '',
        length: length
    });
    options.push(uniquename);
    options = options.filter(option=> (option+'').split(' ')[0].length < CONSTANTS.FREE_ATSIGN_MAX_LENGTH)
    let currentOption = 0;
    while(options.join(" ").replace(/\W/g, '').length > CONSTANTS.FREE_ATSIGN_MAX_LENGTH){
        if(currentOption<options.length){
            options[currentOption] = options[currentOption].split(" ")[0]
            currentOption++
        }else{
            options.splice(Math.round((Math.random() * (options.length-1))), 1);
        }
    }
    
    let atsignOption;
    for (let i = 0; i < 15; i++) {
        if(i>10 || options.join(" ").replace(/\W/g, '').length < 15){
            options.push(Math.round(Math.random()*100))
        }
        shuffle(options);
        atsignOption = options.join('').replace(/\W/g, '');
        let atsign = await checkSignAvailability(atsignOption.toLowerCase(), false, 'free');
        if (atsign) {
            return atsign;
        }
    }
    return false;
}
const atSignWithEmojiLength = function (inputStr) {
    let nonEmojiLength = inputStr.replace(emojiRegex, '').length;
    let emojiLength = inputStr.match(emojiRegex) && inputStr.match(emojiRegex).length;
    return nonEmojiLength + emojiLength;
}
const findTimeDiffSec = function (timeReserve) {
    let date = new Date();
    let datereserve = new Date(timeReserve);
    let diff = Math.abs(datereserve - date) / 1000;
    let timeremaining = Math.floor(diff);
    return timeremaining;
}
const getErrrorMessage = function (data) {
    return messages[data['errorcode']];
}
const makeid = function (length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
const checkValidInviteLink = function (id, code, type) {
    return new Promise(async function (resolve, reject) {
        let user;
        if (id) {
            user = await User.findOne({ _id: ObjectId(id) });
        } else {
            user = await User.findOne({ "atsignDetails.inviteCode": code });
        }
        if (user && user['atsignDetails'] && user['atsignDetails'].length > 0) {
            for (let j = 0; j < user['atsignDetails'].length; j++) {
                if (user['atsignDetails'][j]['inviteCode'] === code && user['atsignDetails'][j]['atsignName'] && user['atsignDetails'][j]['atsignCreatedOn']) {
                    resolve(false);
                } else if (!user['atsignDetails'][j]['atsignCreatedOn']) {
                    resolve(true);
                } else {
                    if (j === user['atsignDetails'].length - 1) {
                        resolve(true);
                    }
                }
            }
        } else {
            resolve(true);
        }
    });
}
const checkValidInviteLinkForAccActivation = function (code) {
    return new Promise(async function (resolve, reject) {
        let user = await User.findOne({ "atsignDetails.inviteCode": code });
        if (user && user['atsignDetails'] && user['atsignDetails'].length > 0) {
            if (user.userStatus != 'Invited') resolve({ valid: false, reason: 'code_used' })
            for (let j = 0; j < user['atsignDetails'].length; j++) {
                if (user['atsignDetails'][j]['inviteCode'] === code && user['atsignDetails'][j]['atsignName'] && user['atsignDetails'][j]['atsignCreatedOn']) {
                    resolve({ valid: false, reason: 'invalid_code' });
                } else if (!user['atsignDetails'][j]['atsignCreatedOn']) {
                    resolve({ valid: true });
                } else {
                    if (j === user['atsignDetails'].length - 1) {
                        resolve({ valid: true });
                    }
                }
            }
        } else {
            resolve({ valid: false, reason: 'invalid_code' });
        }
    });
}
const checkPasswordFormat = function (password) {
    let regex = /(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,25}/;
    return regex.test(password);
}
const generateRandomNumber = function (randomNumberLength) {
    const ran = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
    var a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
    return Array(randomNumberLength).fill(null).map(x => {
        const randomNumber = a[(Math.random() * 8).toFixed()]
        a = ran.filter((x) => x != randomNumber)
        return randomNumber
    }).join("");
}
const generateOrderId = function () {
    return new Date().getTime().toString() + generateRandomNumber(4).toString();
}

const escapeRegExp = function (string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}


module.exports = {
    atSignEmojiOnly,
    atSignWithEmojiLength,
    checkPasswordFormat,
    checkSignAvailability,
    checkValidEmail,
    checkValidInviteLink,
    checkValidInviteLinkForAccActivation,
    checkValidMobile,
    computeStandardAtsign,
    decryptAtsign,
    findTimeDiffSec,
    findTimeStampTimeDiffMin,
    generateInviteCode,
    generateOrderId,
    generateRandomNumber,
    getErrrorMessage,
    isContactValid,
    isEmailValid,
    makeid,
    regexCountEmoji,
    regexSpecialChars,
    shuffle,
    defaultTimeLeft,
    escapeRegExp,
    countAtsignLength,
    calculateUTF7Length
}