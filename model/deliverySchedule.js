const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeliverySchedulesSchema = new Schema(
    {
        name: {
            type: String,
            trim: true
        },
        timeSlot: String
    },
    {
        timeStamp : true
    }
)

module.exports = mongoose.model('DeliverySchedules',DeliverySchedulesSchema)
