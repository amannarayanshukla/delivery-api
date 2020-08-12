"use strict";

const express = require('express');

const {addToCart} = require('../controller/cart');

const router = express.Router();

router
    .route('/')
    .post(addToCart)

module.exports = router;
