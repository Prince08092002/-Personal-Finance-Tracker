const errorHandler = (err, req, res, next) => {
    const requestId = req?.requestId || 'unknown';
    console.error(`[REQ ${requestId}] ERROR ${err.message}`);
    console.error(err.stack);

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        success: false,
        requestId,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = errorHandler;
