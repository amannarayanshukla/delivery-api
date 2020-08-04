'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DeliverySchema = new Schema(
    {
        userId: [{
            type: Schema.Types.ObjectId,
            ref: 'Users'
        }],
        uuid: {
            type: String,
            index: true
        },
        contactNumber: {
            type: String,
            trim: true,
            required: true
        },
        addressId: [{
            type: Schema.Types.ObjectId,
            ref: 'Addresses'
        }],
        nickname: {
            type: String,
            trim: true
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    }
);

module.exports = mongoose.model('Deliveries', DeliverySchema);
