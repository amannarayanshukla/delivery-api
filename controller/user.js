'use strict';
const nodemailer = require('nodemailer');
const uuidv4 = require('uuid').v4;

const crypto = require('crypto');
const Users = require('../model/user');
const Tokens = require('../model/token');
const ResetTokens = require('../model/resetToken');
const Deliveries = require('../model/delivery');
const Addresses = require('../model/address');

const { ErrorHandler } = require('../utils/errorHandler');
const { asyncHandler } = require('../utils/asyncHandler');
const {responseHandler} = require('../utils/responseHandler');

const { client } = require('../config/db');

/*
*   @desc forgot a user's password
*   @route POST /api/v1/user/forgot
*   @access public
*   @response send email to the user with the redirect link which is valid for 1 hour
*/
exports.forgot = asyncHandler(async (req, res, next) => {
    // create a unique token
    const resetPasswordToken = crypto.randomBytes(16).toString('hex');
    const user = await Users.findOne({ email: req.body.email });
    let resetToken = await ResetTokens.findOne({userId : user.uuid});

    // token validity will be 1 hour
    const resetPasswordExpire = Date.now() + parseInt(process.env.RESETTOKENVALIDITY);
    resetToken.resetPasswordToken = resetPasswordToken;
    resetToken.resetPasswordExpire = resetPasswordExpire;
    await resetToken.save();

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
          http://${req.headers.host}/api/v1/user/reset/${resetPasswordToken} \n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    return responseHandler(req,res)(200, true, {}, {}, 1, 'success', {})
});

/*
*   @desc check if token is valid or not
*   @route GET /api/v1/user/reset/:token
*   @access public
*   @response show success message and provide user an input box to enter new password
*/
exports.resetPassword = asyncHandler(async (req, res, next) => {
    const token = req.params.token;
    const resetToken = await ResetTokens.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() }
    });

    const user = await Users.findOne({uuid : resetToken.userId});

    if (!user) {
        return next(
            new ErrorHandler(400, 'Invalid password reset token or it has expired.')
        );
    }
    return responseHandler(req,res)(200, true, {}, {}, 1, 'success', {})
});

/*
*   @desc reset user's password
*   @route POST /api/v1/user/reset/:token
*   @access public
*   @response show success message and redirect user to login page
*/
exports.addPassword = asyncHandler(async (req, res, next) => {
    const token = req.params.token;
    const { newPassword } = req.body;

    const resetToken = await ResetTokens.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() }
    });

    const user = await Users.findOne({uuid : resetToken.userId});

    if (!user) {
        next(
            new ErrorHandler(400, 'Invalid password reset token or it has expired.')
        );
    }
    user.password = newPassword;
    resetToken.resetPasswordToken = undefined;
    resetToken.resetPasswordExpire = undefined;

    await user.save();
    await resetToken.save();

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
          The email related to this is ${user.email} and name is ${user.name}`
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    return responseHandler(req,res)(200, true, {}, {}, 1, 'success', {})
});

/*
*   @desc get only important users information
*   @route GET /api/v1/user/me
*   @access private
*   @response
 */
exports.me = asyncHandler(async (req, res, next) => {
    const user = await Users.findOne({ email: req.email });
    if (!user) {
        return next(new ErrorHandler(400, `user not found`));
    }
    const data = {
        user
    }

    return responseHandler(req,res)(200, true, {}, {}, 1, 'success', data)
});

/*
*   @desc get all user information
*   @route GET /api/v1/user/profile
*   @access private
*   @response all user information + delivery address
* */

exports.getProfile = asyncHandler(async (req, res, next) => {
    const user = await Users.findOne({email: req.email})
    const delivery = await Deliveries.find({userId: user.uuid}) || {};

    const address = await Promise.allSettled(delivery.map(item => {
        return Addresses.find({deliveryId: item.uuid}) || {};
    }))

    const data = {
        user,
        delivery,
        address
    }

    return responseHandler(req,res)(200, true, {}, {}, 1, 'success', data)
})

/*
*   @desc update the user information + delivery address
*   @route POST /api/v1/user/update-profile
*   @access private
*   @response the document after updating
* */
exports.updateProfile = asyncHandler(async (req, res, next) => {
    let user = {};
    let delivery = {};
    let address = {};
    let token = {};

    // user document update
    if(req.body.user) {
        user = await Users.findOneAndUpdate({email: req.email}, req.body.user, {new: true})

        if(req.body.user.email){
            token = await Tokens.findOne({userId: user.uuid})
            token.accessToken = await token.createAccessToken();
            token = await token.save();

            //setting the token in Redis
            client.set(user.uuid, token.accessToken);

            res
                .cookie('authentication_accessToken', token.accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production'
                })
                .cookie('authentication_uuid', user.uuid, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production'
                });
        }
    }

    // deliver document update
    if(req.body.delivery){
        // update existing delivery address
        if(req.body.delivery.uuid){
            delivery = await Deliveries.findOneAndUpdate({uuid: req.body.delivery.uuid}, req.body.delivery, {new: true});
            address = await Addresses.findOneAndUpdate({uuid:req.body.address.uuid}, req.body.address, {new: true});
        } else {

            // add new delivery address
            req.body.delivery.uuid = uuidv4();
            delivery = new Deliveries(req.body.delivery);
            delivery = await delivery.save();
            if (!delivery) {
                return next(new ErrorHandler(404, 'error while inserting a new delivery'));
            }

            req.body.address.uuid = uuidv4();
            req.body.address.deliveryId = delivery.uuid;
            address = new Addresses(req.body.address);
            address = await address.save();
            if (!address) {
                return next(new ErrorHandler(404, 'error while inserting a new address'));
            }
        }
    }

    const data = {
        user,
        delivery,
        address,
        token,
    }
    return responseHandler(req,res)(200, true, {}, {}, 1, 'success', data)
})

