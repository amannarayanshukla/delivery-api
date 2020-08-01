class ErrorHandler extends Error {
    constructor (statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;

        Error.captureStackTrace(this, this.constructor);
    }
}

const handleError = (err, res) => {
    const {statusCode, message} = err;
    res
        .status(statusCode)
        .json({
            total: 0,
            success: false,
            message,
            data: {}
        });
};

module.exports = {
    ErrorHandler,
    handleError
};
