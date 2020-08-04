'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ItemSchema = new Schema(
    {
        orderId: [{
            type: Schema.Types.ObjectId,
            ref: 'Orders'
        }],
        cartId: [{
            type: Schema.Types.ObjectId,
            ref: 'Carts'
        }],
        name: {
            type: String,
            require: true
        },
        quantity: {
            type: Number,
            require: true
        }
    }
);

module.exports = mongoose.model('Items', ItemSchema);
