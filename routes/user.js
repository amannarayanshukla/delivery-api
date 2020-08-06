'use strict';
const express = require('express');

const {forgot, resetPassword, addPassword, me, getProfile, updateProfile} = require('../controller/user');
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

router
    .route('/profile')
    .get(jwtVerification, getProfile)

router
    .route('/update-profile')
    .post(jwtVerification, updateProfile);

module.exports = router;
