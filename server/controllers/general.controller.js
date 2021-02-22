const path = require('path');
const fs = require('fs');

const { messages } = require('../config/const');
const UtilityFunctions = require('../config/UtilityFunctions');

const downlaodFileStructure = function (req, res) {
    const directoryPath = path.join(__dirname, '../csv');
    fs.readdir(directoryPath, function (err, files) {
        if (err) return res.send({ message: 'Unable to scan directory: ' + err });
        return res.send({ file: files });
    });
}

const calculateUTF7Length = async function (req, res) {
    try {
        let utf7Length = await UtilityFunctions.calculateUTF7Length(req.params.atsign)
        res.status(200).json({ data: utf7Length })
    } catch (error) {
        res.status(500).json({ message: messages.error.message })
    }
}

const serverStatus = function (req, res) {
    res.send({ status: "success", message: "success", data: {} });
}

module.exports = {
    downlaodFileStructure,
    calculateUTF7Length,
    serverStatus
}