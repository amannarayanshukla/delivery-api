'use strict';
const express = require('express');

const {forgot, resetPassword, addPassword, me} = require('../controller/user');
const jwtVerification = require('../middleware/jwt')

const router = express.Router();

router
    .route('/forgot')
    .post(forgot);

router
    .route('/reset/:token')
    .get(resetPassword)
    .post(addPassword)

router
    .route('/me')
    .get(jwtVerification, me)

module.exports = router;
