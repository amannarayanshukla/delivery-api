'use strict';
const express = require('express');

const {getAllShops, getOneShop} = require('../controller/shop');

const router = express.Router();

router
    .route('/')
    .get(getAllShops);

router
    .route('/:id')
    .get(getOneShop);

module.exports = router;
