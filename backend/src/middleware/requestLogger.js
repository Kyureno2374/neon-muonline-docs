/**
 * Middleware для логирования HTTP запросов
 */

export function requestLogger(req, res, next) {
    const start = Date.now();
    
    // Логирование после завершения ответа
    res.on('finish', function logResponse() {
        const duration = Date.now() - start;
        const logMessage = `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`;
        
        // Цвет в зависимости от статус-кода
        if (res.statusCode >= 500) {
            console.error(`🔴 ${logMessage}`);
        } else if (res.statusCode >= 400) {
            console.warn(`🟡 ${logMessage}`);
        } else {
            console.log(`🟢 ${logMessage}`);
        }
    });
    
    next();
}

