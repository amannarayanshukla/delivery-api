'use strict';
const Product = require('../model/product');
require('../model/shop');
const {asyncHandler} = require('../utils/asyncHandler'); // statusCode = 200, success = true, nextPage = {}, previousPage = {}, total = 0,  message = '', data = {}
const {ErrorHandler} = require('../utils/errorHandler');
const {responseHandler} = require('../utils/responseHandler');
const {pagination} = require('../utils/pagination');

/*
*  @desc Get all the products
*  @route GET /search/:product
*  @access Public
*  @response Product name, Category, Price old, New price, Shop name
*/
exports.search = asyncHandler(async (req, res) => {
    if (!req.params) {
        throw new ErrorHandler(400, 'no params found');
    }

    const { text } = req.params;

    const query = {'productName': {$regex: text, $options: 'i'}};
    let data = await pagination(req, res)(Product)(query);
    let total = data && data.data && data.data[0] && data.data[0].totalCount[0] && data.data[0].totalCount[0].count ? data.data[0].totalCount[0].count : 0;
    let result = data.data[0].data;
    return responseHandler(req, res)(200, true, data.next, data.prev, total, 'success', result);
});
