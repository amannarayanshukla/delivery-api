'use strict';
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const {ErrorHandler} = require('../utils/errorHandler');

const saltRounds = 10;
const Schema = mongoose.Schema;
const UserSchema = new Schema(
    {
        uuid: {
            type: String,
            index: true
        },
        name: {
            type: String,
            trim: true,
            lowercase: true,
            required: [true, 'name is required']
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            required: [true, 'email address is required'],
            validate: [validator.isEmail, 'please fill a valid email address'],
            index: true
        },
        password: {
            type: String,
            trim: true,
            required: [true, 'password is required'],
            minlength: 6,
            select: false
        },
        primaryContact: {
            type: String,
            trim: true,
            required: [true, 'primary contact required']
        },
        secondaryContact: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
    let user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    const salt = await bcrypt.genSalt(saltRounds).catch(err => {
        return ErrorHandler(500, `salt round can't be generated.`)
    });
    // hash the password using our new salt and override the current password with the hashed one
    user.password = await bcrypt.hash(user.password, salt).catch(err => {
        return ErrorHandler(500,`password can't be encrypted`)
    });

    next();
});

// Compare password
UserSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};



module.exports = mongoose.model('Users', UserSchema);
