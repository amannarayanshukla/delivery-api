const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AddressSchema = new Schema(
    {
        deliveryId: {
            type: String,
            ref: 'Deliveries'
        },
        uuid: {
            type: String,
            index: true
        },
        flatNo: {
            type: String,
            trim: true
        },
        houseNo: {
            type: String,
            trim: true,
            required: true
        },
        apartmentName: {
            type: String,
            trim: true
        },
        street: {
            type: String,
            trim: true
        },
        area: {
            type: String,
            trim: true,
            required: true
        },
        landmark: {
            type: String,
            trim: true
        },
        pinCode: {
            type: String,
            trim: true,
            required: true
        },
        city: {
            type: String,
            trim: true,
            required: true
        },
        state: {
            type: String,
            trim: true,
            required: true
        }
    }
);

module.exports = mongoose.model('Addresses', AddressSchema);
