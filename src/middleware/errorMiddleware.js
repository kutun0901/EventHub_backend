// "_" indicated as not used variables. in middleware need next variable to show what to process next after

const errorMiddlewareHandler = (err, _req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;

    res.status(statusCode).json({
        message: err.message,
        statusCode,
        stack: err.stack,
    })
}

module.exports = errorMiddlewareHandler;
