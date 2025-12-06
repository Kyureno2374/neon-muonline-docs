/**
 * Middleware для обработки ошибок
 * Ловит все ошибки и отправляет единообразный JSON ответ
 */

export function errorHandler(err, req, res, next) {
    // Логирование ошибки
    console.error('❌ Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.originalUrl,
        method: req.method
    });

    // Определение статус-кода
    const statusCode = err.statusCode || err.status || 500;
    
    // Формирование ответа
    const response = {
        success: false,
        error: {
            message: err.message || 'Internal Server Error',
            code: err.code || 'INTERNAL_ERROR'
        }
    };

    // В режиме разработки добавляем stack trace
    if (process.env.NODE_ENV === 'development') {
        response.error.stack = err.stack;
    }

    res.status(statusCode).json(response);
}

