const User = require('./../models/user.model');
const transactions = require('./../models/transactions.model');
const ReserveAtsigns = require('./../models/reserveatsigns.model');
const objectId = require('mongodb').ObjectID;
const bcrypt = require('bcryptjs');

const mail = require('./../config/mailer');
const utility = require('../config/UtilityFunctions');
const { messages,otpExpiry } = require('../config/const');
const textMessage = require('./../config/textMessage');
// const { random } = require('lodash');


module.exports.getAllUsersData = async (paginationData) => {
  let users = {};
  let totalData;
  let selectString = 'email invitedOn atsignDetails userStatus userRole mobileOtp inviteFriendDetails contact';
  let sortOrder = paginationData.sortOrder === "asc" ? 1 : -1;
  let sortBy = paginationData.sortBy;
  let pageSize = Number(paginationData.pageSize);
  let searchTerm = paginationData.searchTerm;
  if (!searchTerm) {
    totalData = await User.find().count();
    users = await User.find()
      .sort({ [sortBy]: sortOrder })
      .select(selectString)
      .skip(pageSize * (paginationData['pageNo'] - 1))
      .limit(pageSize)
      .lean()
      .exec();
  } else {
    totalData = await User.find({
      $or: [
        { "email": { $regex: new RegExp(searchTerm, 'i') } },
        { "contact": { $regex: new RegExp(searchTerm, 'i') } },
        {
          atsignDetails: {
            $elemMatch: {
              atsignName: {
                $regex: new RegExp(searchTerm, 'i')
              }

            }
          }
        }
      ]
    }).countDocuments();

    users = await User.find({
      $or: [
        { "email": { $regex: new RegExp(searchTerm, 'i') } },
        { "contact": { $regex: new RegExp(searchTerm, 'i') } },
        {
          atsignDetails: {
            $elemMatch: {
              atsignName: {
                $regex: new RegExp(searchTerm, 'i')
              }

            }
          }
        }
      ]
    })
      .sort({ [sortBy]: sortOrder })
      .select(selectString)
      .skip(pageSize * (paginationData['pageNo'] - 1))
      .limit(pageSize)
      .lean()
      .exec();

  }
  if (users) {
    const handle = await transactions.find({});
    if (handle) {
      for (let i = 0; i < users.length; i++) {
        users[i]['inviteFriendDetailsCount'] = users[i]['inviteFriendDetails'].length;
        if (users[i]['atsignDetails']) {
          for (let k = 0; k < users[i]['atsignDetails'].length; k++) {
            users[i]['atsignDetails'][k]['orderId'] = '';
            for (let j = 0; j < handle.length; j++) {
              for (var m = 0; m < handle[j].atsignName.length; m++) {
                if (users[i]._id == handle[j].userId && users[i]['atsignDetails'][k].atsignName == handle[j].atsignName[m].atsignName) {
                  users[i]['atsignDetails'][k]['orderId'] = handle[j].orderId;
                }
              }
            }
          }
        }
        delete users[i]['inviteFriendDetails'];
      }
      let responseData = {};
      responseData['users'] = users;
      responseData['pageNo'] = paginationData['pageNo'];
      responseData['totalPage'] = Math.ceil(totalData / paginationData['pageSize']);
      responseData['totalData'] = totalData;
      return responseData;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

module.exports.getUserRoleById = async (id) => {
  const user = await User.findOne({ _id: objectId(id) });
  return user && user.userRole;
}

module.exports.sendInviteLink = async (email, inviteCode, origin) => {
  try {
    let filter = { email: email, 'atsignDetails.inviteCode': inviteCode };
    let update = {
      "$set": {
        "atsignDetails.$.inviteLink": (process.env.APP_URL || origin) + '/welcome' + '/' + inviteCode
      }
    };

    let doc = await User.findOneAndUpdate(filter, update, { new: true });
    if (doc) {
      let data = {
        templateName: "signup_invite",
        receiver: email,
        dynamicdata: {
          "invite_link": doc.atsignDetails[0].inviteLink
        }
      };
      mail.sendEmailSendGrid(data);
      return { status: 'success', message: messages.SENT_SUCCESS, data: doc.atsignDetails[0].inviteLink };

    } else {
      if (!utility.checkValidEmail(email)) {
        if (!email) { throw new Error(messages.MAIL_CONTACT_REQ); }
        inviteCode = await utility.generateInviteCode();
        let inviteLink = (process.env.APP_URL || origin) + '/welcome' + '/' + inviteCode;
        const user = new User();
        user['atsignDetails'] = {
          "inviteCode": inviteCode,
          "inviteLink": inviteLink
        };
        user['invitedBy'] = '';
        user['userStatus'] = 'Invited';
        user['userRole'] = 'User';
        user['email'] = email
        doc = await User.findOne({ email: email });
        if (!doc) {
          let doc2 = await user.save();
          let maildata = {
            templateName: "signup_invite",
            receiver: email,
            dynamicdata: {
              "invite_link": doc2.atsignDetails[0].inviteLink
            }
          };
          mail.sendEmailSendGrid(maildata);
          return { status: 'success', message: messages.SENT_SUCCESS, inviteCode: inviteCode, inviteLink: inviteLink, _id: doc2._id };
        }
        else {
          return { status: 'error', message: messages.USER_ALREADY_REGISTERED, data: { user_status: doc.userStatus } };
        }
      } else {
        return { status: 'error', message: messages.USER_ALREADY_REGISTERED, data: { user_status: doc.userStatus } };
      }
    }
  } catch (error) {

    return { status: 'logError', message: error, data: {} };
  }
}

module.exports.addUser = async (cartData, origin) => {
  try {
    let inviteCode = await utility.generateInviteCode();
    let email = cartData[0]['email'].toLowerCase();
    let inviteLink = (process.env.APP_URL || origin) + '/welcomep' + '/' + inviteCode;
    for (let i = 0; i < cartData.length; i++) {
      if (cartData[i]['payAmount'] == 0) {
        return { status: 'error', message: messages.AMT_NOT_0, data: {} };
      }
      if (i == 0) {
        cartData[i]['inviteCode'] = inviteCode;
      }
      else {
        cartData[i]['inviteCode'] = inviteCode + "_" + i;
      }
      cartData[i]['inviteLink'] = inviteLink;
    }
    if (!utility.checkValidEmail(email)) {
      let data = await User.findOne({ email: email });
      if (!data) {
        const user = new User();
        user['email'] = email;
        user['userStatus'] = 'Invited';
        user['userRole'] = 'User';
        user['atsignDetails'] = cartData;

        let doc = await user.save();
        if (doc) {
          let reserveData = [];
          for (let i = 0; i < cartData.length; i++) {
            let currentData = {};
            currentData['userid'] = doc._id;
            currentData['atsignName'] = cartData[i].atsignName;
            currentData['price'] = cartData[i].payAmount;
            currentData['atsignType'] = 'reserved';
            reserveData.push(currentData);
          }
          let reserve = await ReserveAtsigns.insertMany(reserveData);
          if (reserve) {
            data = {
              templateName: "signup_invite",
              receiver: email,
              dynamicdata: {
                "invite_link": inviteLink
              }
            };
            mail.sendEmailSendGrid(data);
            return { status: 'success', message: messages.INVITE_SENT, data: { inviteLink: inviteLink, _id: doc._id } };
          }
        }
      } else {
        return { status: 'error', message: messages.USER_ALREADY_REGISTERED };
      }
    } else {
      return { status: 'error', message: messages.ENTER_VALID_MAIL, data: {} };
    }
  } catch (error) {
    return { status: 'logError', message: error, data: {} };
  }
}

module.exports.changePassword = async (id, oldPassword, newPassword, confirmNewPassword) => {
  if (newPassword === confirmNewPassword) {
    if (!utility.checkPasswordFormat(newPassword)) {
      return { status: 'error', message: messages.PASSWORD_FORMAT_INCORRECT, data: {} };
    }
    let user = await User.findOne({ _id: objectId(id) });
    if (!user)
      return { status: 'error', message: messages.USER_NOT_FOUND, data: {} };
    // wrong password
    else if (oldPassword && !user.verifyPassword(oldPassword))
      return { status: 'error', message: messages.INVALID_OLD_PASS, data: {} };
    // authentication succeeded
    else {
      let saltSecret = await bcrypt.genSaltSync(10);
      newPassword = await bcrypt.hash(newPassword, saltSecret);
      try {
        await User.findOneAndUpdate({ _id: objectId(id) }, { password: newPassword, saltSecret: saltSecret }, { new: true });
        return { status: 'success', message: messages.SUCCESSFULLY, data: {} };
      } catch (error) {
        return { status: 'logError', message: error, data: {} };
      }
    }
  } else {
    return { status: 'error', message: messages.PASSWORD_MISMATCH, data: {} };
  }
}

exports.sendInviteCode = async (filter, update, atsign) => {
  let accountName = atsign ? 'atsign' : (Object.keys(update).length > 0 && Object.keys(update)[0]);
  let user = await User.findOne(filter);
  if (user && user[accountName] && user[accountName] !== update[accountName]) {
    return { status: "error", message: messages.INVALID_CONTACT_INFORMATION, data: {}};
  } 
  else if(!user)
  {
    return { status: "success", message: messages.VERIFICATION_CODE_SENT, data: filter['atsignDetails.atsignName'] ? { 'atsign': 1 } : {} };
  }
  else
  {
    let random = await this.randomOTP();//Math.floor(1000 + Math.random() * 9000);
    update['mobileOtp'] = random;
    update['otpGenerateTime'] = new Date();
    try {
      let doc = await User.findOneAndUpdate(filter, update);
      if (doc) {
        if (accountName === 'contact') {
          let messageattr = {
            to: update['contact'],
            receivername: '',
            message: random + ' is your verification code.'
          };
          textMessage.sendTextMessage(messageattr);
        } else if(atsign){
          if(doc.contact){
            textMessage.sendTextMessage({
              to: doc.contact,
              receivername: '',
              message: random + ' is your verification code.'
            });
          }
          if(doc.email){
            mail.sendEmailSendGrid({
              templateName: "verification_code",
              receiver: doc.email,
              dynamicdata: { verification_code: random }
            });
          }
        } else {
          let data = {
            templateName: "verification_code",
            receiver: doc.email || update['email'],
            dynamicdata: { verification_code: random }
          };
          mail.sendEmailSendGrid(data);
        }
      }
      return { status: "success", message: messages.VERIFICATION_CODE_SENT, data: {} };
    }
    catch (error) {
      return { status: 'logError', message: messages.USER_ALREADY_ADDED, data: {error} };
    }
  }
}

exports.checkUserExistByEmail = async ( email ) => {
  return await User.findOne({ email: email });
}

exports.saveUser = async ( userData ) => {
  let user = new User();
  Object.assign(user,userData);
  return await user.save();
}
exports.getAllAtsignByUser = async function (userId) {
  let user = await User.findOne({ _id: userId })
  
  if (user) {
    return {
      value: {
        Paid: user.atsignDetails.filter(atsign => atsign.atsignType == 'paid'),
        Free: user.atsignDetails.filter(atsign => atsign.atsignType == 'free')
        
      }
    }
  }else{
    return {error:{type:'info',message:messages.NO_RECORD_FOUND,data:{}}}
  }
}

module.exports.sendOTPForAddingVerificationMethod = async function (currentUserId, data) {
  try {
    let updateObj, otp = await this.randomOTP();
    if (data.email) {
      if (!utility.isEmailValid(data.email)) return { error: { type: 'info', message: messages.ENTER_VALID_MAIL } };
      const emailExist = await User.findOne({ email: data.email.toLowerCase() })
      if (emailExist && emailExist.email) return { error: { type: 'info', message: messages.EMAIL_ALREADY_EXIST } };
      mail.sendEmailSendGrid({
        templateName: "verification_code",
        receiver: data.email,
        dynamicdata: { verification_code: otp }
      });
      updateObj = { 'temp.email': data.email.toLowerCase(), 'temp.emailOpt': otp, 'temp.emailOtpCreationTime': new Date() }
    } else {
      const contactExist = await User.findOne({ contact: data.contact })
      if (contactExist) return { error: { type: 'info', message: messages.CONTACT_ALREADY_EXIST } };
      textMessage.sendTextMessage({
        to: data.contact,
        receivername: '',
        message: otp + ' is your verification code.'
      });
      updateObj = { 'temp.contact': data.contact, 'temp.contactOpt': otp, 'temp.contactOtpCreationTime': new Date() }
    }
    const userUpdated = await User.findOneAndUpdate({ _id: currentUserId }, { $set: updateObj })
    if (userUpdated) {
      return { value: true }
    } else {
      return { error: { type: 'info', message: messages.UNAUTH } }
    }
  } catch (error) {
    return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
  }
}

module.exports.verifyVerificationMethod = async function (currentUserId, data) {
  try {
    let filter, otpTime = new Date();
    otpTime.setMinutes(otpTime.getMinutes() - otpExpiry);
    if (data.email) {
      const emailExist = await User.findOne({ email: data.email.toLowerCase() })
      if (emailExist && emailExist.email) return { error: { type: 'info', message: messages.EMAIL_ALREADY_EXIST } };
      updateObj = { $set: { email: data.email.toLowerCase() }, $unset: { 'temp.email': 1, 'temp.emailOpt': 1, 'temp.emailOtpCreationTime': 1 } }
      filter = { 'temp.email': data.email.toLowerCase(), 'temp.emailOpt': data.otp, 'temp.emailOtpCreationTime': { $gte: otpTime } }
    } else {
      const contactExist = await User.findOne({ contact: data.contact })
      if (contactExist) return { error: { type: 'info', message: messages.CONTACT_ALREADY_EXIST } };
      updateObj = { $set: { contact: data.contact.toLowerCase() }, $unset: { 'temp.contact': 1, 'temp.contactOpt': 1, 'temp.contactOtpCreationTime': 1 } }
      filter = { 'temp.contact': data.contact.toLowerCase(), 'temp.contactOpt': data.otp, 'temp.contactOtpCreationTime': { $gte: otpTime } }
    }
    filter['_id'] = objectId(currentUserId);
    const updatedUser = await User.findOneAndUpdate(filter, updateObj)
    if (updatedUser) {
      return { value: true }
    } else {
      return { error: { type: 'info', message: messages.INVALD_CODE } }
    }
  } catch (error) {
    return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
  }
}

module.exports.getUserById = async (id) => {
  const user = await User.findOne({ _id: id }).select('-saltSecret -password -mobileOtp -mobileVerified -otpGenerateTime -temp').lean();;
  return user;
}
module.exports.getUserByEmail = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('-saltSecret -password -mobileOtp -mobileVerified -otpGenerateTime -temp').lean();;
  return user;
}

module.exports.getUserByAtsign = async function(atsign){
  let atsignName = atsign.toLowerCase().replace('@', '');
  if (utility.regexSpecialChars(atsignName)) {
      return null;
  }
  const user = await User.findOne({ "atsignDetails.atsignName": { '$regex': `^${atsignName}$`, '$options': 'i' } },{ 'atsignDetails.$': 1 });  
  return user;
}
module.exports.updateCartReferalCode = async function(userId,atsign){
  const user = await User.findOneAndUpdate({ _id:userId},{cartReferalCode:atsign});  
  return user;
}

module.exports.clearCartReferalCode = async function(userId){
  const user = await User.findOneAndUpdate({ _id:userId},{cartReferalCode:''});  
}
module.exports.deleteUserById = async (id) => {
  const user = await User.deleteOne({ _id: id })
  return user;
}

module.exports.addAtsignToUser = async function (userId, atsignData) {
  try {
    if (userId && atsignData && atsignData.atsignName && atsignData.atsignType) {
      const user = await User.findOneAndUpdate({ _id: userId }, { "$push": { "atsignDetails": atsignData } })
      return { value: user }
    } else {
      return { error: { type: 'info', message: messages.INVALID_REQ_BODY } }
    }
  } catch (error) {
    return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
  }
}

module.exports.removeAtsignFromUser = async function (userId, atsign) {
  try {
    if (userId && atsign) {
      const user = await User.findOneAndUpdate({ _id: userId }, { $pull: { atsignDetails: { atsignName: { '$regex': `^${atsign}`, '$options': 'i' } } } })
      return { value: user }
    } else {
      return { error: { type: 'info', message: messages.INVALID_REQ_BODY } }
    }
  } catch (error) {
    return { error: { type: 'error', message: error.message, data: { stack: error.stack, message: error.message } } }
  }
}
module.exports.randomOTP = async function(length=4, chars='123456789ABCDEFGHJKMNPQRSTUWXYZ') {
    let result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];

    return result;
  }
  
