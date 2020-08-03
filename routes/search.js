'use strict';
const express = require('express');

const {search} = require('../controller/search');
const router = express.Router();

router
    .route('/:text')
    .get(search);
module.exports = router;
