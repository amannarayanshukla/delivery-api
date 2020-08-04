'use strict';
const express = require('express');

const { register, login, logout } = require('../controller/auth');
const router = express.Router();

router
    .route('/register')
    .post(register);

router
    .route('/login')
    .post(login)

//TODO: JWT verification needs to be added
router
    .route('/logout')
    .post(logout)

module.exports = router;
