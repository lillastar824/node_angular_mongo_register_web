const CommercialAtsign = require('../models/commercial-atsign.model')
const { messages } = require('../config/const');

const isCommercialAtsign = async function (atsign) {
  try {
    if (atsign) {
      const commercialAtsign = await CommercialAtsign.findOne({ atsign: { '$regex': `^${atsign}$`, '$options': 'i' } })
      return { value: commercialAtsign && commercialAtsign.atsign ? true : false }
    } else {
      return { error: { type: 'info', message: messages.INVALID_ATSIGN } }
    }
  } catch (error) {
    return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
  }
}

const getAtsignCommercialDetails = async function (atsign) {
  try {
    if (atsign) {
      const commercialAtsign = await CommercialAtsign.findOne({ atsign: { '$regex': `^${atsign}$`, '$options': 'i' } }).lean()
      return { value: commercialAtsign }
    } else {
      return { error: { type: 'info', message: messages.INVALID_ATSIGN } }
    }
  } catch (error) {
    return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
  }
}


// curd operation
const getCommercialAtsign = async function (filter, sortBy, pageNo = 1, limit = 10) {
  try {
    filter = filter && typeof filter == 'object' ? filter : {}
    sortBy = sortBy && typeof sortBy == 'object' && Object.keys(sortBy).length > 0 ? sortBy : { _id: -1 }
    const commercialAtsigns = await CommercialAtsign.find(filter).sort(sortBy).skip((pageNo - 1) * limit).limit(limit)
    return { value: commercialAtsigns }
  } catch (error) {
    return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
  }
}

const countCommercialAtsign = async function (filter) {
  try {
    filter = filter && typeof filter == 'object' ? filter : {}
    const commercialAtsignCount = await CommercialAtsign.countDocuments(filter)
    return { value: commercialAtsignCount }
  } catch (error) {
    return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
  }
}

//// save Commercial Atsign
const postCommercialAtsign = async function (atsign, commissionPercentage, discountOfferedPercentage, maxDiscountAmount, ownerId) {
  try {
    const commercialAtsigns = await CommercialAtsign.create({ atsign, commissionPercentage, discountOfferedPercentage, maxDiscountAmount, ownerId });
    return { value: commercialAtsigns }
  } catch (error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return { error: { type: 'info', message: '@sign already exist in list' } }
    }
    return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
  }
}

// delete Commercia lAtsign
const deleteCommercialAtsign = async function (id) {
  try {
    const commercialAtsigns = await CommercialAtsign.findOneAndDelete({ _id: id });
    return { value: commercialAtsigns }
  } catch (error) {
    return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
  }
}

// delete Commercia lAtsign
const getCommercialAtsignDetals = async function (id) {
  try {
    const commercialAtsigns = await CommercialAtsign.findOne({ _id: id });
    return { value: commercialAtsigns }
  } catch (error) {
    return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
  }
}

//// update Commercial Atsign
const updateCommercialAtsign = async function (id, details) {
  try {
    const commercialAtsigns = await CommercialAtsign.findOneAndUpdate({ _id: id }, { $set: {discountOfferedPercentage:details.discountOfferedPercentage,commissionPercentage:details.commissionPercentage, maxDiscountAmount: details.maxDiscountAmount} });
    return { value: commercialAtsigns }
  } catch (error) {
    return { error: { type: 'error', message: error.message, data: { message: error.message, stack: error.stack } } }
  }
}

module.exports = {
  isCommercialAtsign,
  getAtsignCommercialDetails,
  getCommercialAtsign,
  postCommercialAtsign,
  deleteCommercialAtsign,
  getCommercialAtsignDetals,
  updateCommercialAtsign,
  countCommercialAtsign
}