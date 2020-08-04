const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CartSchema = new Schema(
    {
        orderUuid: [{
            type: Schema.Types.ObjectId,
            ref: 'Orders'
        }],
        uuid: {
            type: String,
            index: true
        },
        totalPrice: {
            type: Number,
            required: true
        }
    }
);

module.exports = mongoose.model('Carts', CartSchema);
