const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OrderSchema = new Schema(
    {
        userId: [{
            type: Schema.Types.ObjectId,
            ref: 'Users'
        }],
        uuid: {
            type: String,
            index: true
        },
        deliveryId: [{
            type: Schema.Types.ObjectId,
            ref: 'Deliveries'
        }],
        amount: {
            type: Number,
            trim: true,
            required: true
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
