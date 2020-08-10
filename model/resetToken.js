'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ResetTokenSchema = Schema(
    {
        userId: {
            type: String,
            ref: 'Users'
        },
        resetPasswordToken: {
            type: String,
            index: true
        },
        resetPasswordExpire: Date
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('ResetTokens', ResetTokenSchema);
