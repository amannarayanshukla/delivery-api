'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ItemSchema = new Schema(
    {
        orderId: {
            type: String,
            ref: 'Orders'
        },
        cartId: {
            type: String,
            ref: 'Carts'
        },
        uuid: {
            type: String,
            index: true
        },
        name: {
            type: String,
            require: true
        },
        quantity: {
            type: Number,
            require: true
        },
        price : {
            type: Number,
            require:true
        }
    }
);

module.exports = mongoose.model('Items', ItemSchema);
