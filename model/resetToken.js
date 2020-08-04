'use strict';
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ResetTokenSchema = Schema(
    {
        userId: {
            type: String,
            ref: 'User'
        },
        resetPasswordToken: {
            type: String,
            index: true
        },
        resetPasswordExpire: Date
    }
);

module.exports = mongoose.model('ResetTokens', ResetTokenSchema);
