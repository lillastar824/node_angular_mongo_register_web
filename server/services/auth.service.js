const User = require('./../models/user.model')
const objectId = require('mongodb').ObjectID;


exports.getToken = async (user) => {
    let token = user.generateJwt();
    await User.findByIdAndUpdate({ _id: user._id}, { $set: { token: [token] }});
    return token;
}

exports.checkTokenExistInDb = async (id, token) => {
    let user = await User.findOne({ _id: objectId(id), token: token });
    return user;
}

exports.logout = async (id) => {
    await User.findByIdAndUpdate({ _id: objectId(id)}, { $set: { token: [] }});
}

