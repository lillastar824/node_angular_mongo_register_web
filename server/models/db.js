const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.connect(process.env.MONGODB_URI, (err) => {
    if (!err) {
        console.log('MongoDB connection succeeded.');
    } else { console.log('Error in MongoDB connection : ' + JSON.stringify(err, undefined, 2)); }
});

require('./atsign-detail.model');
require('./atsignconfigs.model');
require('./atsignHistory.model');
require('./atsigns.model');
require('./atsignWaitlist.model');
require('./awaited-transaction');
require('./brands.model');
require('./cities.model');
require('./commercial-atsign.model');
require('./commission-transaction.model');
require('./commission.model');
require('./countries.model');
require('./cron.model');
require('./dictionary.model');
require('./firstNames.model');
require('./lastNames.model');
require('./notifications.model');
require('./reserveatsigns.model');
require('./states.model');
require('./transactions.model');
require('./transfer-atsign.model');
require('./user.model');
require('./userlog.model');