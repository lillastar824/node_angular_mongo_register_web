
const User = require('./../models/user.model');
const Commission = require('./../models/commission.model');
const ObjectsToCsv = require('objects-to-csv');
const path = require('path');
const { CONSTANTS } = require('./../config/const');
const csvFolderPath = CONSTANTS.CSV_PATH
const mail = require('./../config/mailer');
const utility = require('./../config/UtilityFunctions')
module.exports.getUsersForReport = async (paginationData) => {
    let atsignData = ['all', 'all-free', 'free', 'all-paid', 'paid', 'all-reserved', 'all-custom', 'all-single', 'all-three', 'all-100', 'all-5000', 'all-10', 'all-1000','commercial-atsign'];
    let Users;
    let users;
    let dateFilter = {};
    dateFilter["_id.atsignCreatedOn"] =
    {
        $gte: paginationData['startdate'],
        $lte: paginationData['lastdate']
    };
    let dateBetween = {
        $gte: paginationData['startdate'],
        $lte: paginationData['lastdate']
    };
    if (atsignData.indexOf(paginationData['atsignType']) > -1) {
        let filter = {}
        filter['_id.userStatus'] = { $ne: 'Deleted' }
        switch (paginationData['atsignType']) {
            case 'all':
                users = await getReportsForFilter(filter, dateFilter, paginationData);
                break;
            case 'all-free':
                filter['_id.atsignType'] = 'free';
                users = await getReportsForFilter(filter, dateFilter, paginationData);
                break;
            case 'all-paid':
                filter['_id.atsignType'] = 'paid';
                users = await getReportsForFilter(filter, dateFilter, paginationData);
                break;
            case 'all-reserved':
                filter['_id.premiumAtsignType'] = 'Reserved';
                users = await getReportsForFilter(filter, dateFilter, paginationData);
                break;
            case 'all-custom':
                filter['_id.premiumAtsignType'] = 'Custom';
                users = await getReportsForFilter(filter, dateFilter, paginationData);
                break;
            case 'all-100':
                filter['_id.payAmount'] = 100;                
                users = await getReportsForFilter(filter, dateFilter, paginationData);
                break;
            case 'all-10':
                filter['_id.payAmount'] = 10;                
                users = await getReportsForFilter(filter, dateFilter, paginationData);
                break;
            case 'all-1000':
                filter['_id.payAmount'] = 1000;                
                users = await getReportsForFilter(filter, dateFilter, paginationData);
                break;
            case 'all-5000':
                filter['_id.payAmount'] = 5000;                
                users = await getReportsForFilter(filter, dateFilter, paginationData);
                break;
            case 'all-single':
                filter['_id.premiumAtsignType'] = 'Single Word';
                users = await getReportsForFilter(filter, dateFilter, paginationData);
                break;
            case 'all-three':
                filter['_id.premiumAtsignType'] = 'Three Character';
                users = await getReportsForFilter(filter, dateFilter, paginationData);
                break;
            case 'commercial-atsign':
                users = await getReportsForCommercialAtsign(filter, dateFilter, paginationData);
                break;
            default:
                break;
        }
        if (!users)
            return false;
        else {
            let header = {
                atsignName: "@sign Name",
                email: "Email",
                contact: "Mobile No.",
                payAmount: "Paid Amount",
                atsignCreatedOn: "Date",
                premiumAtsignType: "@sign Type",
            };
            if (paginationData['atsignType'] === 'all-free') {
                delete header['payAmount'];
            }
            let output = null
            if (paginationData['atsignType'] === 'commercial-atsign') {
                header = {
                    commercialAtsign:'Commercial @sign',
                    email: "Email",
                    contact: "Mobile No.",
                    orderId:"Order Id",
                    atsignName: "@sign Name",
                    atsignDetails: "@sign Details",
                    atsignCreatedOn: "Date",
                };
                 output = formatDataForCommercialCSV(header, users['users']);
            }else{
                 output = formatDataForCSV(header, users['users']);
            }

            if (paginationData['csv'] === 'all') {
                let fileName = utility.makeFileName(paginationData),totalPaidAmount=0;
                let csvData = output.map(item => {
                    let obj = {};
                    for (let key in header) {
                        if (header.hasOwnProperty(key)) {
                            const element = header[key];
                            obj[element] = item[key];
                            if(key=='payAmount') totalPaidAmount = totalPaidAmount + Number(item[key])
                        }
                    }
                    return obj;
                });
                csvData.push({})
                csvData.push({ 'Paid Amount': 'Total:'+totalPaidAmount })
                const csv = new ObjectsToCsv(csvData);
                await csv.toDisk(path.join(csvFolderPath, fileName));
                return { filePath: path.join(__dirname,'..',csvFolderPath, fileName),fileName:fileName }
            }
            return  { csvData: { header,rows: output }, pageNo: users['pageNo'], totalPage: users['totalPage'], totalData: users['totalData'] };
        }
    }
    else {
        let header = {
            email: "Email",
            contact: "Mobile No.",
            atsignCreatedOn: "Date",
            userStatus: "Status",
           // atsignDetails: "@sign Count",
            freeAtsignCount: "Free @signs",
            paidAtsignCount: "Paid @signs",
            totalAtsignCount: "Total @signs",
        };

        let free = 0;
        let paid = 0;
        switch (paginationData['atsignType']) {
            case 'all-users': {
                Users = await getAllUsersReport(dateBetween, paginationData);
                Users = await countUserSignTypes(Users,paginationData);
                paid = Users['paid'];
                free = Users['free'];
                break;
            }
            case 'all-paid-users':
                Users = await getAllPaidUser(dateBetween, paginationData);
                Users = await countUserSignTypes(Users,paginationData);
                break;
            case 'all-free-users':
                Users = await getAllFreeUsers(dateBetween, paginationData);
                Users = await countUserSignTypes(Users,paginationData);
                break;
            case 'all-invite':
                Users = await getAllInvited(dateBetween, paginationData);
                header = {
                    email: "Email",
                    contact: "Mobile No.",
                    atsignCreatedOn: "Date",
                    userStatus: "Status",
                    atsignType: "Type"
                };
                break;
            case 'friend-invite':
                Users = await getAllFriendInvites(dateBetween, paginationData);
                Users['users'] = await getinvitedFriendsDetails(Users['users']);
                header = {
                    email: "Email",
                    contact: "Mobile No.",
                    freeAtsignCount: "Free @signs",
                    paidAtsignCount: "Paid @signs",
                    totalAtsignCount: "Total @signs",
                    activeCount: "Total Active Invites",
                    inactiveCount : "Total Pending Invites",
                    invitedCount: "Total Invites",
                };
                break;
            case 'referred-by':
                Users = await getreferredFriendsDetails(dateBetween, paginationData);
                Users['users'] = await getRefferedByDetails(Users['users']);
                header = {
                    email: "Email",
                    contact: "Mobile No.",
                    atsignName:"@sign Name",
                    freeAtsignCount: "Free @signs",
                    paidAtsignCount: "Paid @signs",
                    totalAtsignCount: "Total @signs",
                    activeCount: "Total Active Invites",
                    inactiveCount : "Total Pending Invites",
                    invitedCount: "Total Invites",
                };
                break; 
            case 'all-user-email-noti-enabled':
                Users = await getAllUsersWithEmailNotificationReport(dateBetween, paginationData);
                Users = await countUserSignTypes(Users,paginationData);   
            default:
                break;
        }
        if(!Users) return false
        let output = formatDataForUserCSV(header, Users['users'], free, paid, paginationData['startdate'], paginationData['lastdate']);

        if (paginationData['csv'] === 'all') {
            let fileName = utility.makeFileName(paginationData);
            let csvData = output['output'].map(item => {
                let obj = {};
                for (let key in header) {
                    if (header.hasOwnProperty(key)) {
                        const element = header[key];
                        obj[element] = item[key];
                    }
                }
                return obj;
            });
            const csv = new ObjectsToCsv(csvData);
            await csv.toDisk(path.join(csvFolderPath, fileName));
            return { filePath: path.join(__dirname,'..',csvFolderPath, fileName),fileName:fileName }
        }

        return { csvData: {header,rows: output['output'] }, pieData: { invited: output['invited'], active: output['active'], free, paid },pageNo : Users['pageNo'],totalPage: Users['totalPage'],totalData:Users['totalData']};
    }
}

async function getReportsForFilter(filter, dateFilter, paginationData) {
   let sortOrder = paginationData['sortOrder'] === "asc" ? 1 : -1;
    let sortBy =  "_id." + paginationData['sortBy'];
    let totalData;
    let limit = paginationData['pageSize'];
    let skip = paginationData['pageSize'] * (paginationData["pageNo"] - 1);
    let totalCount = await User.aggregate([
        {
            $unwind: "$atsignDetails"
        },
        {
            $group: {
                _id: {
                    _id: "$_id",
                    email: "$email",
                    contact: "$contact",
                    atsignType: "$atsignDetails.atsignType",
                    atsignName: "$atsignDetails.atsignName",
                    atsignCreatedOn: "$atsignDetails.atsignCreatedOn",
                    payAmount: "$atsignDetails.payAmount",
                    premiumAtsignType: "$atsignDetails.premiumAtsignType",
                    userStatus: "$userStatus",
                    invitedOn: "$invitedOn"
                }
            }
        },
        {
            $match:
            {
                $and: [dateFilter, filter]
            }
        },
        {
            $count: 'count'
        }
    ]);

    if (totalCount.length === 0) {
        return false;
    }

    totalData = totalCount[0].count;
    if (paginationData['csv'] === 'all') {
        skip = 0;
        limit = totalData + 1;
    }
    let users = await User.aggregate([
        {
            $unwind: "$atsignDetails"
        },
        {
            $group: {
                _id: {
                    _id: "$_id",
                    email: "$email",
                    contact: "$contact",
                    atsignType: "$atsignDetails.atsignType",
                    atsignName: "$atsignDetails.atsignName",
                    atsignCreatedOn: "$atsignDetails.atsignCreatedOn",
                    payAmount: "$atsignDetails.payAmount",
                    premiumAtsignType: "$atsignDetails.premiumAtsignType",
                    userStatus: "$userStatus",
                    invitedOn: "$invitedOn"
                }
            }
        },
        {
            $match:
            {
                $and: [dateFilter, filter]
            }
        },
        { $sort: { [sortBy]: sortOrder } },
        { $skip: skip },
        { $limit: limit }
    ]).collation({locale: "en" }).exec();

    let responseData = {};
    responseData['users'] = users;
    responseData['pageNo'] = paginationData['pageNo'];
    responseData['totalPage'] = Math.ceil(totalData / paginationData['pageSize']);
    responseData['totalData'] = totalData;
    return responseData;
}
async function getReportsForCommercialAtsign(filter, dateFilter, paginationData) {
    let sortOrder = paginationData['sortOrder'] === "asc" ? 1 : -1;
    let sortBy = paginationData['sortBy'];
    let totalData;
    let limit = paginationData['pageSize'];
    let skip = paginationData['pageSize'] * (paginationData["pageNo"] - 1);
    let totalCount = await Commission.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: paginationData['startdate'],
                    $lte: paginationData['lastdate']
                }
            },
        },
        { "$addFields": { "userObjectId": { "$toObjectId": "$metadata.commsionForUserId" }, atsignPurchased: '$metadata.orderData' } },
        {
            $lookup:
            {
                from: 'users',
                localField: 'userObjectId',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        // { $unwind: { path: '$atsignPurchased' } },
        { $count: 'count' }
    ]);

    if (totalCount.length === 0) {
        return false;
    }
    totalData = totalCount[0].count;
    if (paginationData['csv'] === 'all') {
        skip = 0;
        limit = totalData + 1;
    }
    let users = await Commission.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: paginationData['startdate'],
                    $lte: paginationData['lastdate']
                }
            },
        },
        { "$addFields": { "userObjectId": { "$toObjectId": "$metadata.commsionForUserId" }, atsignPurchased: '$metadata.orderData' } },
        {
            $lookup:
            {
                from: 'users',
                localField: 'userObjectId',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        // { $unwind: { path: '$atsignPurchased' } },
        {
            $project: {
                email: { $arrayElemAt: ["$userDetails.email", 0] },
                contact: { $arrayElemAt: ["$userDetails.contact", 0] },
                atsignDetails: "$atsignPurchased",
                commercialAtsign: '$atsign',
                atsignCreatedOn: "$createdAt",
                orderId: "$metadata.orderId",
                premiumAtsignType: "$atsignPurchased.premiumHandleType",
                userStatus: { $arrayElemAt: ["$userDetails.userStatus", 0] },
                createdAt: "$createdAt"
            }
        },
        { $sort: { [sortBy]: sortOrder } },
        { $skip: skip },
        { $limit: limit }
    ]).collation({ locale: "en" }).exec();
    let responseData = {};
    responseData['users'] = users;
    responseData['pageNo'] = paginationData['pageNo'];
    responseData['totalPage'] = Math.ceil(totalData / paginationData['pageSize']);
    responseData['totalData'] = totalData;
    return responseData;
}

async function getAllUsersReport(dateBetween, paginationData) {
    let paid, free;
    let pageNo = Number(paginationData['pageNo']);
    let pageSize = Number(paginationData['pageSize']);
    let sortOrder = paginationData['sortOrder'] === "asc" ? 1 : -1;
    let sortBy = paginationData['sortBy'] === 'atsignCreatedOn' ? 'invitedOn':paginationData['sortBy'];

    let skip = (pageNo - 1) * pageSize;
    let limit = pageSize;

    free = await User.find({
        atsignDetails: {
            $all: [
                {
                    $elemMatch: {
                        atsignType: "free",
                    }
                },
                {
                    $elemMatch: {
                        atsignCreatedOn: dateBetween
                    }
                }
            ]
        }, userStatus: "Active",
    }).countDocuments();

    paid = await User.find({
        atsignDetails: {
            $elemMatch: {
                payAmount: { $exists: true, $gt: 0 },
                atsignCreatedOn: dateBetween
            }
        }, userStatus: "Active"
    }).countDocuments();


    let totalData = await User.find({
        atsignDetails: {
            $elemMatch: {
                atsignCreatedOn: dateBetween
            }
        }, userStatus: "Active"
    }).countDocuments();


    if (paginationData['csv'] === 'all') {
        skip = 0;
        limit = totalData + 1;
    }
    
    let Users = await User.find({
        atsignDetails: {
            $elemMatch: {
                atsignCreatedOn: dateBetween
            }
        }, userStatus: "Active",
    }, {
        _id: true, email: true, contact: true, invitedOn: true, userStatus: true,
        atsignDetails: true
    }).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).collation({locale: "en" });

    let responseData = {};
    responseData['users'] = Users;
    responseData['pageNo'] = paginationData['pageNo'];
    responseData['totalPage'] = Math.ceil(totalData / paginationData['pageSize']);
    responseData['totalData'] = totalData;
    responseData['free'] = free;
    responseData['paid'] = paid;
    return responseData;
}

async function getAllUsersWithEmailNotificationReport(dateBetween, paginationData) {
    let paid, free;
    let pageNo = Number(paginationData['pageNo']);
    let pageSize = Number(paginationData['pageSize']);
    let sortOrder = paginationData['sortOrder'] === "asc" ? 1 : -1;
    let sortBy = paginationData['sortBy'] === 'atsignCreatedOn' ? 'invitedOn':paginationData['sortBy'];

    let skip = (pageNo - 1) * pageSize;
    let limit = pageSize;

    free = await User.find({
        productNotificationEmail: true,
        atsignDetails: {
            $all: [
                {
                    $elemMatch: {
                        atsignType: "free",
                    }
                },
                {
                    $elemMatch: {
                        atsignCreatedOn: dateBetween
                    }
                }
            ]
        }, userStatus: "Active",
    }).countDocuments();

    paid = await User.find({
        productNotificationEmail: true,
        atsignDetails: {
            $elemMatch: {
                payAmount: { $exists: true, $gt: 0 },
                atsignCreatedOn: dateBetween
            }
        }, userStatus: "Active"
    }).countDocuments();


    let totalData = await User.find({
        productNotificationEmail: true,
        atsignDetails: {
            $elemMatch: {
                atsignCreatedOn: dateBetween
            }
        }, userStatus: "Active"
    }).countDocuments();


    if (paginationData['csv'] === 'all') {
        skip = 0;
        limit = totalData + 1;
    }
    
    let Users = await User.find({
        productNotificationEmail: true,
        atsignDetails: {
            $elemMatch: {
                atsignCreatedOn: dateBetween
            }
        }, userStatus: "Active",
    }, {
        _id: true, email: true, contact: true, invitedOn: true, userStatus: true,
        atsignDetails: true
    }).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).collation({locale: "en" });

    let responseData = {};
    responseData['users'] = Users;
    responseData['pageNo'] = paginationData['pageNo'];
    responseData['totalPage'] = Math.ceil(totalData / paginationData['pageSize']);
    responseData['totalData'] = totalData;
    responseData['free'] = free;
    responseData['paid'] = paid;
    return responseData;
}

async function getAllPaidUser(dateBetween, paginationData) {
    let pageNo = Number(paginationData['pageNo']);
    let pageSize = Number(paginationData['pageSize']);
    let sortOrder = paginationData['sortOrder'] === "asc" ? 1 : -1;
    let sortBy = paginationData['sortBy'] === 'atsignCreatedOn' ? 'invitedOn':paginationData['sortBy'];


    let freeUsers = await User.find({
        atsignDetails: {
            $all: [
                {
                    $elemMatch: {
                        atsignType: "free",
                    }
                },
                {
                    $elemMatch: {
                        atsignCreatedOn: dateBetween
                    }
                }
            ]
        }, userStatus: "Active"
    }, { _id: true });


    let totalData = await User.find({
        atsignDetails: {
            $elemMatch: {
                payAmount: { $exists: true, $gt: 0 },
                atsignCreatedOn: dateBetween
            }
        }, userStatus: "Active",_id:{$nin : freeUsers }
    }).countDocuments();

    let skip = (pageNo - 1) * pageSize;
    let limit = pageSize;
    if (paginationData['csv'] === 'all') {
        skip = 0;
        limit = totalData + 1;
    }

    let Users = await User.find({
        atsignDetails: {
            $elemMatch: {
                payAmount: { $exists: true, $gt: 0 },
                atsignCreatedOn: dateBetween
            }
        }, userStatus: "Active",_id:{$nin : freeUsers }
    }, {
        _id: true, email: true, contact: true, invitedOn: true, atsignDetails: true, userStatus: true
    }).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).collation({locale: "en" });
    let responseData = {};
    responseData['users'] = Users;
    responseData['pageNo'] = paginationData['pageNo'];
    responseData['totalPage'] = Math.ceil(totalData / paginationData['pageSize']);
    responseData['totalData'] = totalData;
    return responseData;
}

async function getAllFreeUsers(dateBetween, paginationData) {
    let pageNo = Number(paginationData['pageNo']);
    let pageSize = Number(paginationData['pageSize']);
    let sortOrder = paginationData['sortOrder'] === "asc" ? 1 : -1;
    let sortBy = paginationData['sortBy'] === 'atsignCreatedOn' ? 'invitedOn':paginationData['sortBy'];

    let paidUser = await User.find({
        atsignDetails: {
            $elemMatch: {
                payAmount: { $exists: true, $gt: 0 },
                atsignCreatedOn: dateBetween
            }
        }, userStatus: "Active",
    }, {_id: true});

    let totalData = await User.find({
        atsignDetails: {
            $all: [
                {
                    $elemMatch: {
                        atsignType: "free",
                    }
                },
                {
                    $elemMatch: {
                        atsignCreatedOn: dateBetween
                    }
                }
            ]
        }, userStatus: "Active",_id:{$nin : paidUser}
    }).countDocuments();

    let skip = (pageNo - 1) * pageSize;
    let limit = pageSize;
    if (paginationData['csv'] === 'all') {
        skip = 0;
        limit = totalData + 1;
    }

    let Users = await User.find({
        atsignDetails: {
            $all: [
                {
                    $elemMatch: {
                        atsignType: "free",
                    }
                },
                {
                    $elemMatch: {
                        atsignCreatedOn: dateBetween
                    }
                }
            ]
        }, userStatus: "Active",_id:{$nin : paidUser}
    }, {
        _id: true, email: true, contact: true, invitedOn: true, atsignDetails: true, userStatus: true
    })
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit).collation({locale: "en" });

    let responseData = {};
    responseData['users'] = Users;
    responseData['pageNo'] = paginationData['pageNo'];
    responseData['totalPage'] = Math.ceil(totalData / paginationData['pageSize']);
    responseData['totalData'] = totalData;
    return responseData;

}

async function getAllInvited(dateBetween, paginationData) {
    let pageNo = Number(paginationData['pageNo']);
    let pageSize = Number(paginationData['pageSize']);
    let sortOrder = paginationData['sortOrder'] === "asc" ? 1 : -1;
    let sortBy = paginationData['sortBy'] === "atsignCreatedOn" ? 'invitedOn' : paginationData['sortBy'];


    let totalData = await User.find({
        invitedOn: dateBetween, userStatus: "Invited"
    }, { _id: true, email: true, contact: true, invitedOn: true, atsignDetails: true, userStatus: true }).countDocuments();

    let skip = (pageNo - 1) * pageSize;
    let limit = pageSize;
    if (paginationData['csv'] === 'all') {
        skip = 0;
        limit = totalData + 1;
    }

    let Users = await User.find({
        invitedOn: dateBetween, userStatus: "Invited"
    }, { _id: true, email: true, contact: true, invitedOn: true, atsignDetails: true, userStatus: true })
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit).collation({locale: "en" });

    let responseData = {};
    responseData['users'] = Users;
    responseData['pageNo'] = paginationData['pageNo'];
    responseData['totalPage'] = Math.ceil(totalData / paginationData['pageSize']);
    responseData['totalData'] = totalData;
    return responseData;
}

var formatDataForCSV = (header, data) => {
    let output = [], _user;

    data.forEach((user) => {
        _user = {};
        for (let row in header) {
            switch (row) {
                case "atsignName":
                    _user[row] = user['_id'][row] ? user['_id'][row] : '';
                    if(_user[row].substring(0,1) == '0'){
                        _user[row] = '"'+_user[row]+'"' 
                    }
                    break;
                case "email":
                    _user[row] = user['_id'][row] ? user['_id'][row] : '';
                    break;
                case "contact":
                    _user[row] = user['_id'][row] ? user['_id'][row] : '';
                    break;
                case "payAmount":
                    _user[row] = user['_id'][row] ? user['_id'][row] : '';
                    break
                case "premiumAtsignType": {
                    let pat;
                    if (user['_id'][row]) {
                        pat = user['_id'][row];
                    } else if (user['_id']['payAmount']) {
                        pat = "Reserved";
                    } else {
                        pat = "Free";
                    }
                    _user[row] = pat;
                    break;
                }
                case "atsignCreatedOn": {
                    let date = user['_id'][row] ? user['_id'][row] : user['_id']['invitedOn'];
                    _user[row] = getFormattedDate(date);
                    break;
                }
                default:
                    _user[row] = user[row] ? (typeof user[row] === "string" ? `"${user[row].replace(/"/g, '""')}"` : user[row]) : '""';
                    break;
            }
        }
        output.push(_user);
    });
    return output;
};
var formatDataForCommercialCSV = (header, data) => {
    let output = [], _user;

    // atsignName: "@sign Name",
    // payAmount: "Paid Amount",
    // orderId:"Order Id",
    // email: "Email",
    // contact: "Mobile No.",
    // atsignCreatedOn: "Date",
    // atsignDetails: "Date",

    data.forEach((user) => {
        _user = {};
        for (let row in header) {
            switch (row) {
                case "email":
                    _user[row] = user.email;
                    break;
                case "contact":
                    _user[row] = user.contact;
                    break;
                case "atsignCreatedOn": {
                    let date = user['createdAt']
                    _user[row] = getFormattedDate(date);
                    break;
                }
                case "atsignDetails": {
                    _user[row] = user['atsignDetails'].map(atsignDetail => {return { atsignName : atsignDetail.atsignName,payAmount:atsignDetail.payAmount}})
                        break;
                }
                case "atsignName": {
                    _user[row] = user['atsignDetails'].map(atsignDetail=>atsignDetail.atsignName).join("\n")
                        break;
                }
                case "orderId": {
                    _user[row] = ""+ user['orderId'].toString() + "\n"
                        break;
                }
                case "commercialAtsign": {
                    _user[row] = user['commercialAtsign']
                        break;
                }
                
            }
        }
        output.push(_user);
    });
    return output;
};

var formatDataForUserCSV = (header, data, free, paid, startdate, lastdate) => {
    let output = [], _user;
    let invited = 0;
    let active = 0;

    data.forEach((user) => {
        _user = {};

        let type = "";
        for (let row in header) {
            switch (row) {
                case "email":
                    _user[row] = user[row] ? user[row] : '';
                    break;
                case "contact":
                    _user[row] = user[row] ? user[row] : '';
                    break;
                case "atsignCreatedOn": {
                    let date;
                    if (user['atsignDetails'] && user['atsignDetails'][user['atsignDetails'].length - 1] && user['atsignDetails'][user['atsignDetails'].length - 1][row]) {
                        date = user['atsignDetails'][user['atsignDetails'].length - 1][row];
                    } else if (user['atsignDetails'] && user['atsignDetails'][0] && user['atsignDetails'][0]['payAmount'] && user['atsignDetails'][0]['payAmount'] > 0) {
                        date = user['invitedOn'];
                        type = "Reserved";
                    } else{
                        date =  user['invitedOn'];
                        type = "Free";
                    }
                    _user[row] = getFormattedDate(date);
                    break;
                }
                case "userStatus":
                    _user[row] = user[row] ? user[row] : '';
                    if (user[row] == "Active") {
                        active++;
                    } else {
                        invited++;
                    }
                    break;
                case "atsignType":
                    _user[row] = type;
                    break;
                case "atsignDetails":{
                    let newArray = [];
                    for (let i = 0; i < user[row].length; i++) {
                        if (!(!user[row][i]['atsignName'] 
                        || new Date(user[row][i]['atsignCreatedOn']) < new Date(startdate) 
                        || new Date(user[row][i]['atsignCreatedOn']) > new Date(lastdate)
                        )){
                            newArray.push(user[row][i]);
                        }
                    }
                    // _user['atsignCount'] = newArray.length;
                    break;}
                    case "activeCount":
                        _user[row] = user[row] ? user[row] : 0;
                        break;
                    case "inactiveCount":
                        _user[row] = user[row] ? user[row] : 0;
                        break;
                    case "freeAtsignCount":
                        _user[row] = user[row] ? user[row] : 0;
                        break;
                    case "paidAtsignCount":
                        _user[row] = user[row] ? user[row] : 0;
                        break;
                    case "totalAtsignCount":
                        _user[row] = user[row] ? user[row] : 0;
                        break;
                    case "invitedCount":
                        _user[row] = user[row] ? user[row] : 0;
                        break;
                    case "atsignName":
                        _user[row] = user[row] ? user[row] : "-";
                        break;    
                default:
                    _user[row] = user[row] ? (typeof user[row] === "string" ? `"${user[row].replace(/"/g, '""')}"` : user[row]) : '""';
                    break;
            }
        }
        output.push(_user);
    });
    let returnData = {};
    returnData['header'] = header;
    returnData['output'] = output;
    returnData['active'] = active;
    returnData['invited'] = invited;
    returnData['free'] = free;
    returnData['paid'] = paid;
    return returnData;
};

var getFormattedDate = (date) => {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var now = new Date(date);
    var thisMonth = months[now.getMonth()]; // getMonth method returns the month of the date (0-January :: 11-December)
    return thisMonth + ' ' + now.getDate() + ' ' + now.getFullYear();

}


var getAllFriendInvites = async (dateBetween, paginationData) => {
    let pageNo = Number(paginationData['pageNo']);
    let pageSize = Number(paginationData['pageSize']);
    let sortOrder = paginationData['sortOrder'] === "asc" ? 1 : -1;
    let sortBy = paginationData['sortBy'];

    let totalData = await User.find({
        atsignDetails: {
            $elemMatch: {
                atsignCreatedOn: dateBetween
            }
        },
        userStatus: "Active",
        inviteFriendDetails: {
            $elemMatch: {
                inviteCodefriends: { $exists: true }
            }
        }
    }, {
        _id: true, email: true, contact: true, invitedOn: true,
        inviteFriendDetails: true
    }).countDocuments();

    let skip = (pageNo - 1) * pageSize;
    let limit = pageSize;
    if (paginationData['csv'] === 'all') {
        skip = 0;
        limit = totalData + 1;
    }

    let Users = await User.find({
        atsignDetails: {
            $elemMatch: {
                atsignCreatedOn: dateBetween
            }
        },
        userStatus: "Active",
        inviteFriendDetails: {
            $elemMatch: {
                inviteCodefriends: { $exists: true }
            }
        }
    }, {
        _id: true, email: true, contact: true, invitedOn: true,
        inviteFriendDetails: true
    }).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit).collation({locale: "en" }).lean();

    let responseData = {};
    responseData['users'] = Users;
    responseData['pageNo'] = paginationData['pageNo'];
    responseData['totalPage'] = Math.ceil(totalData / paginationData['pageSize']);
    responseData['totalData'] = totalData;
    return responseData;
}

var getinvitedFriendsDetails = async (Users)=>{
 
    for (let i = 0; i < Users.length; i++) {
        let inviteDetails = Users[i].inviteFriendDetails;
        let invitedCount = inviteDetails.length;
        let activeCount = 0;
        let inactiveCount = 0;
        let activeInviteCodes = [];

        for (let j = 0; j < invitedCount; j++) {
            if (inviteDetails[j].used === true) {
                activeCount++;
                activeInviteCodes.push(inviteDetails[j].inviteCodefriends);
            } else {
                inactiveCount++;
            }
        }
        let paidAtsignCount = 0;
        let freeAtsignCount = 0;
        let friends = await User.find({
            userStatus: { $ne: 'Deleted' },
            "atsignDetails.inviteCode": { $in: activeInviteCodes }, atsignDetails: {
                $elemMatch: {
                    atsignCreatedOn: { $exists: true }
                }
            }
        }, { _id: true,atsignDetails:true }).lean();
        for (let x = 0; x < friends.length; x++) {
            for (let j = 0; j < friends[x]['atsignDetails'].length; j++) {
                if (friends[x]['atsignDetails'][j]['atsignCreatedOn'] && friends[x]['atsignDetails'][j]['payAmount'] > 0) {
                    paidAtsignCount++;
                } else if (friends[x]['atsignDetails'][j]['atsignCreatedOn']) {
                    freeAtsignCount++;
                }
            }
        }

       Users[i]["freeAtsignCount"] = freeAtsignCount;
       Users[i]["paidAtsignCount"] = paidAtsignCount;
       Users[i]["totalAtsignCount"] = freeAtsignCount+paidAtsignCount;
       Users[i]["invitedCount"] = invitedCount;
       Users[i]["activeCount"] = activeCount;
       Users[i]["inactiveCount"] = inactiveCount;
    }
    return Users;
}

var getreferredFriendsDetails = async (dateBetween, paginationData) => {
    let pageNo = Number(paginationData['pageNo']);
    let pageSize = Number(paginationData['pageSize']);
    let sortOrder = paginationData['sortOrder'] === "asc" ? 1 : -1;
    let sortBy = paginationData['sortBy'];

    let totalDataObj = await User.aggregate([
        {
            "$match": {
                "referredBy": {
                    "$exists": true,
                    "$ne": null
                },
                "invitedOn": dateBetween 
            }
        },
        {
            "$group": {
                _id: { "referredBy": "$referredBy" }
            }
        },
        {
            $count: "count"
        }
    ]);
    let totalData = totalDataObj.length>0 && totalDataObj.pop()['count'];

    let skip = (pageNo - 1) * pageSize;
    let limit = pageSize;
    if (paginationData['csv'] === 'all') {
        skip = 0;
        limit = totalData + 1;
    }

    let Users = await User.aggregate([
        {
            "$match": {
                "referredBy": {
                    "$exists": true,
                    "$ne": null
                },
                "invitedOn": dateBetween
            }
        },
        {
            "$group": {
                _id: { "referredBy": "$referredBy" },
                ids: {
                    $push: { _id: "$_id" }
                },
                activeUsers: {
                    "$sum": {
                        "$cond": [
                            { "$eq": ["$userStatus", "Active"] },
                            1,
                            0
                        ]
                    }
                },
                inactiveUsers: {
                    "$sum": {
                        "$cond": [
                            { "$eq": ["$userStatus", "Invited"] },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        { $sort: { [sortBy]: sortOrder } },
        { $skip: skip },
        { $limit: limit }]).collation({locale: "en" });
    let responseData = {};
    responseData['users'] = Users;
    responseData['pageNo'] = paginationData['pageNo'];
    responseData['totalPage'] = Math.ceil(totalData / paginationData['pageSize']);
    responseData['totalData'] = totalData;
    return responseData;
}

var getRefferedByDetails = async (Users) => {
    let data = [];
    for (let x = 0; x < Users.length; x++) {
        let ids = [];
        for (let j = 0; j < Users[x]['ids'].length; j++) {
            ids.push(Users[x]['ids'][j]['_id']);
        }
        let referrerUser = await User.findOne({ "atsignDetails.atsignName": Users[x]['_id']['referredBy'] }
            , { email: true, contact: true });

        let paidAtsignCount = 0;
        let freeAtsignCount = 0;
        let friends = await User.find({
            userStatus: { $ne: 'Deleted' },
            "_id": { $in: ids }, atsignDetails: {
                $elemMatch: {
                    atsignCreatedOn: { $exists: true }
                }
            }
        }, { _id: true, atsignDetails: true }).lean();

        for (let i = 0; i < friends.length; i++) {
            for (let j = 0; j < friends[i]['atsignDetails'].length; j++) {
                if (friends[i]['atsignDetails'][j]['atsignCreatedOn'] && friends[i]['atsignDetails'][j]['payAmount'] > 0) {
                    paidAtsignCount++;
                } else if (friends[i]['atsignDetails'][j]['atsignCreatedOn']) {
                    freeAtsignCount++;
                }
            }
        }

        if(referrerUser)
        {
            let details = {};
            details['email'] = referrerUser['email'];
            details['contact'] = referrerUser['contact'];
            details['atsignName'] = Users[x]['_id']['referredBy'];
            details['invitedCount'] = Users[x]['ids'].length;
            details['activeCount'] = Users[x]['activeUsers'];
            details['inactiveCount'] = Users[x]['inactiveUsers'];
            details['paidAtsignCount'] = paidAtsignCount;
            details['freeAtsignCount'] = freeAtsignCount;
            details['totalAtsignCount'] = freeAtsignCount + paidAtsignCount;
            data.push(details);
        }
        else
        {
            //@todo remove
            var errorData = {'referredBy':  Users[x]['_id']['referredBy'] , 'Users':Users[x]};
            var data1 = {
                //name of the email template that we will be using
                templateName: "error_email",
                receiver: 'athandle123@gmail.com',
                dynamicdata: { error_string: JSON.stringify(errorData), environment: 'dev' }
            };
        
            mail.sendEmailSendGrid(data1);
        }
    }
    return data;
}

var countUserSignTypes = (Users,paginationData) => {
let startdate = paginationData['startdate'];
let lastdate = paginationData['lastdate'];
    
for (const user of Users['users']) {
        let freeAtsignCount = 0;
        let paidAtsignCount = 0;
   
        for (let i = 0; i < user.atsignDetails.length; i++) {
            let dateCondition = user.atsignDetails[i].atsignCreatedOn > startdate 
                                && user.atsignDetails[i].atsignCreatedOn < lastdate;  
   
            if (user.atsignDetails[i].atsignType && user.atsignDetails[i].atsignType === 'free' && dateCondition) 
            {
                freeAtsignCount++;
            }
            else if (user.atsignDetails[i].atsignType && user.atsignDetails[i].atsignType !== 'free' && dateCondition) {
                paidAtsignCount++;
            }
        }
        user['freeAtsignCount'] = freeAtsignCount;
        user['paidAtsignCount'] = paidAtsignCount;
        user['totalAtsignCount'] = paidAtsignCount + freeAtsignCount;
    }
    return Users;
}