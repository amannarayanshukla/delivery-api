'use strict';
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const uuidv4 = require('uuid').v4;

const crypto = require('crypto');
const Users = require('../model/user');
const Tokens = require('../model/token');
const ResetTokens = require('../model/resetToken');

const { ErrorHandler } = require('../utils/errorHandler');
const { asyncHandler } = require('../utils/asyncHandler');
const {responseHandler} = require('../utils/responseHandler');

const { client } = require('../config/db');

/*  @desc register a user
*   @route POST /api/v1/auth/register
*   @access Public
*   @response accessToken resetToken uuid along with user information
*/
exports.register = asyncHandler(async (req, res, next) => {
    const uuid = uuidv4();
    const { email, name, password, primaryContact } = req.body;
    let user = new Users({
        uuid,
        email,
        name,
        password,
        primaryContact
    });


    user = await user.save();

    if (!user) {
        return next(new ErrorHandler(404, 'error while registering a new user'));
    }

    // create a new document in TokenSchema and link it to the user
    let token = new Tokens({
        userId: user.uuid
    });

    let resetToken = new ResetTokens({
        userId: user.uuid
    })

    token = await token.save();
    resetToken = await resetToken.save();

    let data = {
        user,
        token,
        resetToken
    }

    //setting the token in Redis
    client.set(data.user.uuid, data.token.accessToken);

    res
        .cookie('authentication_accessToken', data.token.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        })
        .cookie('authentication_uuid', data.user.uuid, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

    return responseHandler(req, res)(200, true, {}, {}, 1, 'success', data);
});


/*
*   @desc login a user
*   @route POST /api/v1/auth/login
*   @access Public
*   @response accessToken resetToken uuid along with user information
*/
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    let uuid, accessToken;
    if (!email || !password) {
        return next(new ErrorHandler(400, 'please provide email and password'));
    }

    let user = await Users.findOne({
        email
    }).select('+password');

    if (!user) {
        return next(new ErrorHandler(401, 'invalid credentials'));
    }

    const result = await user.comparePassword(password);
    if (!result) {
        return next(new ErrorHandler(401, 'invalid credentials'));
    }

    let token = await Tokens.findOne({userId: user.uuid})
    let resetToken = await ResetTokens.findOne({userId: user.uuid})

    token.accessToken = await token.createAccessToken();

    token = await token.save();

    let data = {
        user,
        token,
        resetToken
    }

    //setting the token in Redis
    client.set(data.user.uuid, data.token.accessToken);

    res
        .cookie('authentication_accessToken', data.token.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        })
        .cookie('authentication_uuid', data.user.uuid, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

    return responseHandler(req, res)(200, true, {}, {}, 1, 'success', data);
});


/*
*   @desc logout a user
*   @route POST /api/v1/auth/logout
*   @access private
*   @response no data
 */
exports.logout = asyncHandler(async (req, res, next) => {
    const user = await Users.findOne({ email: req.body.email });
    let token = await Tokens.findOne({userId: user.uuid});
    let resetToken = await ResetTokens.findOne({userId: user.uuid});

    token.accessToken = undefined;
    token = await token.save();

    resetToken.resetPasswordToken = undefined;
    resetToken.resetPasswordExpire = undefined;
    resetToken = await resetToken.save();

    let data = {
        user,
        token,
        resetToken
    }

    // deleting a key from Redis
    const reply = await client.del(data.user.uuid);

    // reply is null when the key is missing
    if (!reply) {
        return next(new ErrorHandler(400, `Invalid access token`));
    }
    return responseHandler(req, res)(200, true, {}, {}, 0, 'success', {});
});


