'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// from owner's app
const CategorySchema = new Schema({
    shopId: {
        type: Schema.Types.ObjectId,
        ref: 'Shops'
    }
}, { strict: false });

module.exports = mongoose.model('Categories', CategorySchema);
