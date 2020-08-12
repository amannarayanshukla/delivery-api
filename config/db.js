'use strict';
const mongoose = require('mongoose');
const redis = require('redis');

// configure redis client
const client = redis.createClient(process.env.REDIS_PORT);

const URI = process.env.MONGODBURI;

const db = async () => {
    mongoose.connect(URI, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    mongoose.set('debug', true);

    client.on('connect', function () {
        console.log(`Redis default connection is open`.cyan);
    });

    client.on('error', function (error) {
        console.error(`Redis default error has occurred ${error}`.red);
    });

    mongoose.connection.on('connected', function () {
        console.log(`Mongoose default connection is open to ${URI}`.cyan);
    });

    mongoose.connection.on('error', function (err) {
        console.log(`Mongoose default connection error has occurred ${err}`.red);
    });

    mongoose.connection.on('disconnected', function () {
        console.log('Mongoose default connection is disconnected'.yellow);
    });

    process.on('SIGINT', function () {
        mongoose.connection.close(function () {
            console.log(
                'Mongoose default connection is disconnected due to application termination'
                    .blue
            );
            process.exit(0);
        });
    });
};

// Use connect method to connect to the server
module.exports = {
    db,
    client
};
