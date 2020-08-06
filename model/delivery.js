'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DeliverySchema = new Schema(
    {
        userId: {
            type: String,
            ref: 'Users'
        },
        uuid: {
            type: String,
            index: true
        },
        contactNumber: {
            type: String,
            trim: true,
            required: true
        },
        nickname: {
            type: String,
            trim: true
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Deliveries', DeliverySchema);
