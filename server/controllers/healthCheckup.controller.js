const mongoose = require('mongoose');

exports.checkMongoConnectionStatus = function(req, res) {
        if (mongoose.connection.readyState === 1) {
            res.status(200).send({ status: 'success', message: 'MongoDB is connected' });
        }
        else if (mongoose.connection.readyState === 2) {
            res.status(200).send({ status: 'success', message: 'MongoDB is connecting' });
        }
        else if (mongoose.connection.readyState === 3) {
            res.status(200).send({ status: 'error', message: 'MongoDB is disconnecting' });
        }
        else { 
            res.status(500).send({ status: 'error', message: "MongoDB is disconnected"});
        }
}

