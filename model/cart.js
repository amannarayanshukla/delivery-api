const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CartSchema = new Schema(
    {
        orderUuid: {
            type: String,
            ref: 'Orders'
        },
        uuid: {
            type: String,
            index: true
        },
        totalPrice: {
            type: Number,
            required: true
        },
        offer: String
    }
);

module.exports = mongoose.model('Carts', CartSchema);
