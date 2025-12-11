/**
 * Middleware для автоматического логирования действий админа
 * Логирует все CRUD операции
 */

import { logAdminAction } from '../utils/logger.js';

/**
 * Определить тип действия по методу HTTP
 */
function getActionType(method) {
    switch (method) {
        case 'POST': return 'CREATE';
        case 'PUT': return 'UPDATE';
        case 'PATCH': return 'UPDATE';
        case 'DELETE': return 'DELETE';
        case 'GET': return 'READ';
        default: return 'ACTION';
    }
}

/**
 * Определить ресурс по URL
 */
function getResourceFromUrl(url) {
    // Примеры: /api/admin/pages, /api/admin/blocks/123, etc.
    const match = url.match(/\/api\/admin\/([^\/]+)/);
    if (match) {
        return match[1].toUpperCase();
    }
    return 'UNKNOWN';
}

/**
 * Извлечь ID ресурса из URL или body
 */
function getResourceId(req) {
    // Приоритет: params.id > body.id > создан в response
    return req.params.id || req.body.id || null;
}

/**
 * Middleware для логирования действий админа
 */
export function adminActionLogger(req, res, next) {
    // Только для админских роутов
    if (!req.originalUrl.startsWith('/api/admin') || req.originalUrl.includes('/auth')) {
        return next();
    }

    // Только если админ авторизован
    if (!req.admin || !req.admin.id) {
        return next();
    }

    // Сохраняем оригинальный метод res.json
    const originalJson = res.json.bind(res);

    // Перехватываем res.json для логирования после успешного ответа
    res.json = function (data) {
        // Логируем только успешные операции
        if (data && data.success) {
            const action = getActionType(req.method);
            const resource = getResourceFromUrl(req.originalUrl);
            let resourceId = getResourceId(req);

            // Если это CREATE, ID может быть в ответе
            if (action === 'CREATE' && data.data && data.data.id) {
                resourceId = data.data.id;
            }

            // Детали действия
            const details = {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode
            };

            // Добавляем данные body (без паролей)
            if (req.body && Object.keys(req.body).length > 0) {
                const bodyData = { ...req.body };
                delete bodyData.password;
                delete bodyData.password_hash;
                details.body = bodyData;
            }

            // Логируем действие
            logAdminAction(req.admin.id, action, resource, resourceId, details);
        }

        // Вызываем оригинальный res.json
        return originalJson(data);
    };

    next();
}

export default adminActionLogger;

