/**
 * Middleware для обработки ошибок
 * Ловит все ошибки и отправляет единообразный JSON ответ
 */

import { logError } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
    // Пропускаем если ответ уже отправлен
    if (res.headersSent) {
        return next(err);
    }

    // Определение статус-кода и кода ошибки
    let statusCode = err.statusCode || err.status || 500;
    let errorCode = err.code || 'INTERNAL_ERROR';
    let errorMessage = err.message || 'Internal Server Error';

    // Обработка специфических типов ошибок

    // 1. MySQL ошибки
    if (err.code && err.code.startsWith('ER_')) {
        switch (err.code) {
            case 'ER_DUP_ENTRY':
                statusCode = 409;
                errorCode = 'DUPLICATE_ENTRY';
                errorMessage = 'Resource already exists';
                break;
            case 'ER_BAD_FIELD_ERROR':
                statusCode = 500;
                errorCode = 'DATABASE_ERROR';
                errorMessage = 'Database field error';
                break;
            case 'ER_NO_REFERENCED_ROW':
            case 'ER_NO_REFERENCED_ROW_2':
                statusCode = 400;
                errorCode = 'INVALID_REFERENCE';
                errorMessage = 'Referenced resource does not exist';
                break;
            default:
                statusCode = 500;
                errorCode = 'DATABASE_ERROR';
                errorMessage = 'Database error occurred';
        }
    }

    // 2. JWT ошибки
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        errorCode = 'INVALID_TOKEN';
        errorMessage = 'Invalid authentication token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        errorCode = 'TOKEN_EXPIRED';
        errorMessage = 'Authentication token has expired';
    }

    // 3. Валидация ошибки
    if (err.name === 'ValidationError') {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
    }

    // 4. Multer ошибки (загрузка файлов)
    if (err.name === 'MulterError') {
        statusCode = 400;
        errorCode = 'FILE_UPLOAD_ERROR';
        
        if (err.code === 'LIMIT_FILE_SIZE') {
            errorMessage = 'File too large';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            errorMessage = 'Unexpected file field';
        }
    }

    // Логирование ошибки
    const logLevel = statusCode >= 500 ? '🔴' : '🟡';
    const logContext = {
        code: errorCode,
        message: errorMessage,
        originalError: err.message,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userId: req.admin?.id || null,
        statusCode
    };

    console.error(`${logLevel} Error [${statusCode}]:`, logContext);

    // Логируем в winston только серьёзные ошибки (500+)
    if (statusCode >= 500) {
        logError(err, logContext);
    }

    // Формирование ответа
    const response = {
        success: false,
        error: {
            message: errorMessage,
            code: errorCode
        }
    };

    // Добавляем дополнительные поля из ошибки
    if (err.field) {
        response.error.field = err.field;
    }

    if (err.fields) {
        response.error.fields = err.fields;
    }

    // В режиме разработки добавляем stack trace и SQL запрос (если есть)
    if (process.env.NODE_ENV === 'development') {
        response.error.stack = err.stack;
        
        if (err.sql) {
            response.error.sql = err.sql;
        }
    }

    res.status(statusCode).json(response);
}

