
const { MongoClient } = require('mongodb');
const moment = require('moment');

const startedAt = moment();
const databaseName = "atsignTest";

process.env.NODE_ENV = "test";
process.env.PORT = "8080";
process.env.MONGODB_URI = `mongodb://localhost:27017/${databaseName}`;

before(function (done) {
	new Promise((resolve, reject) => {
		MongoClient.connect(process.env.MONGODB_URI, function (err, client) {
			if (err) reject(err);
			db = client.db(databaseName);
			db.dropDatabase(function (err, result) {
				if (err) {
					console.log("[ERROR] " + err);
					reject(err);
				}
				console.log(`Dropped database '${databaseName}' ? ${result}`);
				resolve();
			});
		});
	}).then(() => {
		done();
	}).catch((err) => {
		console.log(err);
	})
});

after(function(done) {
	new Promise(function(resolve, reject) {
		try {
		  MongoClient.connect(process.env.MONGODB_URI, function (err, client) {
			if (err) reject(err);
			  var db = client.db(databaseName);
			  db.dropDatabase(function (err, result) {
				if (err) reject(err);
				console.log(`Dropped database '${databaseName}'`);
				resolve();
			  });
		  });
		} catch(e) {
		  console.error(e);
		  resolve();
		};
	  }).then( function() {
		const tookTime = moment.duration(moment().diff(startedAt));
		console.log(`TEST TIME ELAPSED: ${tookTime.get('minutes')}:${tookTime.get('seconds')} mins:secs`);
		done();
	  }).finally( () => {
		process.exit();
	  });
})

// sequential test cases to run

require('./lib/main');
require('./lib/utility');
require('./model/mongooseModel');
require('./controller/user.test');
require('./controller/reservedatsign.test');
require('./services/auth.test')
require('./services/atsign.test')
require('./services/reports.test')
require('./services/user.test')
