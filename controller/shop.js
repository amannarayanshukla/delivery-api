'use strict';
const Shops = require('../model/shop');
const {asyncHandler} = require('../utils/asyncHandler'); // statusCode = 200, success = true, nextPage = {}, previousPage = {}, total = 0,  message = '', data = {}
const {ErrorHandler} = require('../utils/errorHandler');
const {responseHandler} = require('../utils/responseHandler');
const {pagination} = require('../utils/pagination');

/*
*   @desc Get all shops
*   @route GET /shops
*   @access public
*   @response show all the shops with pagination
* */
exports.getAllShops = asyncHandler(async (req, res) => {
    const query = {};
    let data = await pagination(req, res)(Shops)(query);
    let total = data.data[0].totalCount[0].count;
    let result = data.data[0].data;
    return responseHandler(req, res)(200, true, data.next, data.prev, total, 'success', result);
});

/*
*   @desc Get the one shop based on id
*   @route GET /shops/:id
*   @access public
*   @response show the shop with the id
* */
exports.getOneShop = asyncHandler(async (req, res) => {
    if (!req.params) {
        throw new ErrorHandler(400, 'no shop id found');
    }
    const id = req.params.id;
    const query = {_id: id};
    const result = await Shops.find(query).lean();
    return responseHandler(req, res)(200, true, {}, {}, result.length, 'success', result);
});
