require('./services/auth.test')
require('./services/atsign.test')
require('./services/reports.test')
require('./services/user.test')

after(function (done) {
	done();
	process.exit();
})