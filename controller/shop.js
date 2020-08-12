'use strict';
const Shops = require('../model/shop');
const Products = require('../model/product');
const Categories = require('../model/category');

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

/*
*   @desc Get the one shop based on id
*   @route GET /shops/:id/product/:productId
*   @access public
*   @response show the shop, the product and all the information category and all products linked
* */
exports.getShopAndProduct = asyncHandler(async (req, res, next) => {
    if(!req.params){
        throw new ErrorHandler(400, 'no shop id or product id found');
    }

    const {id, productId} = req.params;
    const shopQuery = { _id : id };
    const productQuery = { shopId: id };
    const categoryQuery = {shopId: id}
    let selectedProduct = {};
    let cart = {};

    //  get the shop details
    const shop = await Shops.find(shopQuery).lean();

    //  get all the products of the shop
    const product = await Products.find(productQuery).lean();

    //  get all the categories
    const category = await Categories.find(categoryQuery).lean();


    //  TODO: also include the selected product and the cart also quantity of products
    const data = {
        shop,
        product,
        category,
        selectedProduct,
        cart
    }

    return responseHandler(req,res)(200, true, {},{}, data.length, 'success', data);

})

