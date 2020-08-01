// db.products.aggregate([{ $lookup: { from: 'users', localField: 'userId', foreignField: '_id',as: 'userInformation'}}])

// db.products.aggregate([ {$match: {'category': 'pulses'}},{ $lookup: { from: 'users', localField: 'userId', foreignField: '_id',as: 'userInformation'}}])

'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    userId: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { strict: false });

module.exports = mongoose.model('Product', ProductSchema);
