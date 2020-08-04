'use strict';
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const {ErrorHandler} = require('../utils/errorHandler');

const Schema = mongoose.Schema;

const TokenSchema = Schema(
    {
        userId: {
            type: String,
            ref: 'User'
        },
        accessToken: String
    },
    {
        timestamps: true
    }
);

//create access token and refresh token before saving
TokenSchema.pre('save',async function (next){
    let token = this;
    token.accessToken = await token.createAccessToken()
    next();
})

// Create access token
TokenSchema.methods.createAccessToken = async function () {
    const user = await mongoose.model('Users').find({uuid: this.userId}).catch(err => {
        new ErrorHandler(500, `can't find user based on uuid`)
    });

    return jwt.sign(
        { email: user[0].email },
        process.env.JWT_ACCESS_SECRET_KEY,
        { expiresIn: '1h' }
    );
};

// Verify JWT token
TokenSchema.methods.verifyJWTToken = function (token, secret) {
    return jwt.verify(token, secret);
};

module.exports = mongoose.model('Tokens', TokenSchema);
