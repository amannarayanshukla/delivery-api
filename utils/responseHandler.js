'use strict';

const responseHandler = (req, res) => {
    return (statusCode = 200, success = true, nextPage = {}, previousPage = {}, total = 0, message = '', data = {}) => {
        console.log(data,"DATA response");
        return res
            .status(statusCode)
            .json({
                success,
                nextPage,
                previousPage,
                total,
                message,
                data
            });
    };
};

module.exports = {
    responseHandler
};
