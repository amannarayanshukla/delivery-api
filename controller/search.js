'use strict';
const Product = require('../model/product');
const User = require('../model/user');

//  @desc Get all the products
//  @route GET /search/:product
//  @access Public
//  @response Product name, Category, Price old, New price, Shop name
exports.search = async (req, res) => {
    const { text } = req.params;
    // db.products.aggregate([ {$match: {'category': 'pulses'}},
    // { $lookup: { from: 'users', localField: 'userId', foreignField: '_id',as: 'userInformation'}}])

    Product.find({'productName': { $regex: text, $options: 'i' }}).populate('userId').exec((err, data) => {
        if (err) {
            return res.json(err);
        }
        return res.json(data);
    });
};
