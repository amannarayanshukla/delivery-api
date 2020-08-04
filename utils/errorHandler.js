class ErrorHandler extends Error {
    constructor (statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;

        Error.captureStackTrace(this, this.constructor);
    }
}

const handleError = (err, res) => {
    console.log(err,"ERROR in error handler")
    let {statusCode, message} = err;

    if(/is shorter than the minimum allowed length/gi.test(err.stack) || /please fill a valid email address/gi.test(err.stack)){
        statusCode = 400;
    }

    if(err.name === "MongoError" && err.code === 11000){
        statusCode = 400;
        message = 'email is already registered.'
    }

    if(!statusCode){
        statusCode = 500;
    }
    if(!message){
        message = `error encountered please try again.`
    }

    return res
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
