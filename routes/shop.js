'use strict';
const express = require('express');

const {getAllShops, getOneShop, getShopAndProduct} = require('../controller/shop');

const router = express.Router();

router
    .route('/')
    .get(getAllShops);

router
    .route('/:id')
    .get(getOneShop);

router
    .route('/:id/product/:productId')
    .get(getShopAndProduct);

module.exports = router;
