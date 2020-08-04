const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AmountSchema = Schema(
    {
        orderId: [{
            type: Schema.Types.ObjectId,
            ref: 'Orders'
        }],
        itemSubtotal: {
            type: Number
        },
        deliveryAmount: {
            type: Number
        },
        discountAmount: {
            type: Number
        },
        totalAmount: {
            type: Number
        }
    }
);

module.exports = mongoose.model('Amounts', AmountSchema);
