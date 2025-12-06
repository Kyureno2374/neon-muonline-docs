/**
 * Middleware для обработки 404 ошибок
 * Вызывается когда не найден ни один роут
 */

export function notFoundHandler(req, res, next) {
    res.status(404).json({
        success: false,
        error: {
            message: `Route ${req.originalUrl} not found`,
            code: 'ROUTE_NOT_FOUND'
        }
    });
}

