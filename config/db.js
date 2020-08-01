const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODBURI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('debug', true);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.info(`Connected to mongoDB`);
});

module.exports = db;
