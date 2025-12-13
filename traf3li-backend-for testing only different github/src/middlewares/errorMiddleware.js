const errorMiddleware = (error, request, response, next) => {
    console.log('========== BACKEND ERROR MIDDLEWARE DEBUG ==========');
    console.log('[ErrorMiddleware] Error caught!');
    console.log('[ErrorMiddleware] Timestamp:', new Date().toISOString());
    console.log('[ErrorMiddleware] Request URL:', request.originalUrl);
    console.log('[ErrorMiddleware] Request method:', request.method);
    console.log('[ErrorMiddleware] Error type:', error.constructor.name);
    console.log('[ErrorMiddleware] Error message:', error.message);
    console.log('[ErrorMiddleware] Error status:', error.status);
    console.log('[ErrorMiddleware] Error stack:', error.stack);
    console.log('[ErrorMiddleware] Error name:', error.name);
    if (error.code) console.log('[ErrorMiddleware] Error code:', error.code);
    if (error.errors) console.log('[ErrorMiddleware] Validation errors:', JSON.stringify(error.errors, null, 2));
    console.log('[ErrorMiddleware] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

    const status = error.status || 500;
    const message = error.message || 'Something went wrong!'

    console.log('[ErrorMiddleware] Sending response with status:', status);
    console.log('[ErrorMiddleware] Sending response with message:', message);

    return response.status(status).send({
        error: true,
        message
    });
}

module.exports = errorMiddleware;