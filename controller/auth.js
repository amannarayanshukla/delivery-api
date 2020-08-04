'use strict';
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


    await user.save();
    return res.json(user)
    // if (!user) {
    //     return next(
    //         new ErrorHandler(404, 'Enter while inserting a registering a new user')
    //     );
    // }
    //
    // // create a new document in TokenSchema and link it to the user
    // let token = new Tokens({
    //     userId: uuid
    // });
    // token.accessToken = token.createAccessToken();
    // token.refreshToken = token.createRefreshToken();
    //
    // token = await token.save();
    //
    // user.token = token;
    //
    // client.set(uuid, user.token.accessToken);
    //
    // res
    //     .cookie('authentication_accessToken', user.accessToken, {
    //         httpOnly: true,
    //         secure: process.env.NODE_ENV === 'production'
    //     })
    //     .cookie('authentication_refreshToken', user.refreshToken, {
    //         httpOnly: true,
    //         secure: process.env.NODE_ENV === 'production'
    //     })
    //     .cookie('authentication_uuid', uuid, {
    //         httpOnly: true,
    //         secure: process.env.NODE_ENV === 'production'
    //     });
    //
    // return responseHandler(req, res)(200, true, {}, {}, user.length, 'success', user);
});
