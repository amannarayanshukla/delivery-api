'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// from owner's app
const ProductSchema = new Schema({
    shopId: {
        type: Schema.Types.ObjectId,
        ref: 'Shops'
    }
}, { strict: false });

module.exports = mongoose.model('Products', ProductSchema);
