'use strict';
require('dotenv').config({ path: './config/.env' });

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const colors = require('colors');

const {db} = require('./config/db');
const {ErrorHandler, handleError} = require('./utils/errorHandler');

const search = require('./routes/search');
const shops = require('./routes/shop');
const auth = require('./routes/auth');
const user = require('./routes/user');

const app = express();

// connect the database
db();

const port = process.env.PORT;


// create application/json parser
app.use(bodyParser.json());


app.use( cookieParser() );
app.use( logger('dev') );

app.use('/health-check', (req, res) => {
    res.send('Working');
});

app.use('/api/v1/search', search);
app.use('/api/v1/shops', shops);
app.use('/api/v1/auth', auth);
app.use('/api/v1/user', user);

app.all('*', (req, res, next) => {
    next(new ErrorHandler(404, `Can't find ${req.originalUrl} on this server!`));
});

app.use((err, req, res, next) => {
    handleError(err, res);
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`.cyan);
});
