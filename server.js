'use strict';
require('dotenv').config({ path: './config/.env' });

const express = require('express');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const logger = require('morgan')

const db = require('./config/db');
const search = require('./routes/search');
const shops = require('./routes/shop');
const {handleError} = require('./utils/errorHandler');
const app = express();
const port = process.env.PORT;
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(logger('dev'));



app.get('/', (req, res) => res.send('Hello World!'));
app.use('/api/v1/search', search);
app.use('/api/v1/shops', shops);

app.use((err, req, res, next) => {
    handleError(err, res);
});

