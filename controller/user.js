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

/*
*   @desc login a user
*   @route POST /api/v1/auth/login
*   @access Public
*   @response accessToken resetToken uuid along with user information
*/

exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    let uuid, accessToken, refreshToken;
    if (!email || !password) {
        return next(new ErrorHandler(400, 'Please provide email and password'));
    }

    let user = await Users.findOne({
        email
    }).select('+password');

    if (!user) {
        return next(new ErrorHandler(401, 'Invalid credentials'));
    }

    const result = await user.comparePassword(password);
    if (!result) {
        return next(new ErrorHandler(401, 'Invalid credentials'));
    }

    accessToken = await user.createAccessToken();
    refreshToken = await user.createRefreshToken();

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;

    user = await user.save();
    uuid = user.uuid;

    client.set(uuid, accessToken);

    res
        .cookie('authentication_accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        })
        .cookie('authentication_refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        })
        .cookie('authentication_uuid', uuid, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

    return responseHandler(req, res)(200, true, {}, {}, user.length, 'success', user);
});

/*
*   @desc logout a user
*   @route POST /api/v1/auth/logout
*   @access private
*   @response no data
 */
exports.logout = asyncHandler(async (req, res, next) => {
    const user = await Users.findOne({ email: req.email });
    user.accessToken = undefined;
    user.refreshToken = undefined;
    user.save();

    // deleting a key
    client.del(user.uuid, function (err, reply) {
        // reply is null when the key is missing
        if (err && !reply) {
            return next(new ErrorHandler(400, `Invalid access token`));
        }
        return responseHandler(req, res)(200, true, {}, {}, 0, 'success', {});
    });
});

/*
*   @desc forgot a user's password
*   @route POST /api/v1/auth/forgot
*   @access public
*/
exports.forgot = asyncHandler(async (req, res, next) => {
    // create a unique token
    const resetPasswordToken = crypto.randomBytes(16).toString('hex');
    const user = await Users.findOne({ email: req.body.email });
    // token validity will be 1 hour
    const resetPasswordExpire = Date.now() + 360000;
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass // generated ethereal password
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'noreply@imaman.in', // sender address
        to: user.email, // list of receivers
        subject: 'Password reset', // Subject line
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/api/v1/reset/${resetPasswordToken} \n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    return res.status(200).json({
        success: true,
        data: {}
    });
});

//  @desc check if token is valid or not
//  @route GET /api/v1/auth/reset
//  @access public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    const token = req.params.token;
    const user = await Users.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(
            new ErrorHandler(400, 'Invalid password reset token or it has expired.')
        );
    }
    return res.status(200).json({
        success: true,
        data: {}
    });
});

//  @desc reset user's password
//  @route POST /api/v1/auth/reset
//  @access public
exports.addPassword = asyncHandler(async (req, res, next) => {
    const token = req.params.token;
    const { newPassword } = req.body;

    const user = await Users.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        next(
            new ErrorHandler(400, 'Invalid password reset token or it has expired.')
        );
    }
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass // generated ethereal password
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'noreply@imaman.in', // sender address
        to: user.email, // list of receivers
        subject: 'Password has been updated', // Subject line
        text: `You are receiving this because you (or someone else) has reset the password for your account.\n\n
          The email related to this is ${user.email} and username is ${user.username}`
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    return res.status(200).json({
        success: true,
        data: {}
    });
});

//  @desc refresh the user's access token
//  @route POST /api/v1/auth/token
//  @access public
exports.token = asyncHandler(async (req, res, next) => {
    // refresh token is something that changes frequently should be index it??
    const { refreshToken } = req.body;
    let uuid;
    const user = await Users.findOne({ refreshToken });
    if (!user) {
        return next(new ErrorHandler(400, `Invalid refresh token`));
    }
    const decode = user.verifyJWTToken(
        refreshToken,
        process.env.JWT_REFRESH_SECRET_KEY
    );
    if (!decode) {
        return next(new ErrorHandler(400, 'Invalid refresh token'));
    }
    const accessToken = user.createAccessToken();
    user.accessToken = accessToken;
    uuid = user.uuid;
    client.set(user.uuid, accessToken);
    await user.save();
    return res
        .status(200)
        .cookie('authentication_accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        })
        .cookie('authentication_refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        })
        .cookie('authentication_uuid', uuid, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        })
        .json({
            success: true,
            data: {
                accessToken: user.accessToken,
                refreshToken: user.refreshToken,
                uuid
            }
        });
});

//  @desc get users information
//  @route GET /api/v1/me
//  @access private
exports.me = asyncHandler(async (req, res, next) => {
    const user = Users.find({ email: req.email });
    if (!user) {
        return next(new ErrorHandler(400, `user not found`));
    }
    return res.status(200).json({
        success: true,
        data: user
    });
});
