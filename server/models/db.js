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
require('./user.model');
require('./atsigns.model');
require('./atsignHistory.model');
require('./reserveatsigns.model');
require('./transactions.model');
require('./dictionary.model');
require('./firstNames.model');
require('./lastNames.model');
require('./brands.model');
require('./countries.model');
require('./states.model');
require('./cities.model');
require('./atsignWaitlist.model');
require('./userlog.model');
require('./atsignconfigs.model');
require('./notifications.model');