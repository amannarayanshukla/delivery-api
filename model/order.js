const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OrderSchema = new Schema(
    {
        userId: {
            type: String,
            ref: 'Users'
        },
        uuid: {
            type: String,
            index: true
        },
        deliveryId: {
            type: String,
            ref: 'Deliveries'
        },
        amount: {
            type: Number,
            trim: true,
            required: true
        },
        status: {
            type: String,
            index: true
        },
        transactionId : {
            type: String,
            index: true
        },
        orderDate: Date,
        deliveryDate: Date,
        paymentMethod: {
            type: String,
            required: true
        }

    }
);

module.exports = mongoose.model('Orders', OrderSchema);
