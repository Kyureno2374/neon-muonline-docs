/**
 * Middleware для проверки JWT токена
 * Защищает роуты администратора от неавторизованного доступа
 */

import { verifyAccessToken } from '../utils/jwtUtils.js';
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
 * Middleware для аутентификации
 * Проверяет наличие и валидность JWT токена в заголовке Authorization
 */
export function authMiddleware(req, res, next) {
    try {
        // Получаем токен из заголовка Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Authorization header is missing',
                    code: 'UNAUTHORIZED'
                }
            });
        }

        // Формат: "Bearer <token>"
        const parts = authHeader.split(' ');
        
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                error: {
                    message: 'Invalid authorization header format. Expected: Bearer <token>',
                    code: 'INVALID_AUTH_FORMAT'
                }
            });
        }

        const token = parts[1];

        // Верификация токена
        const decoded = verifyAccessToken(token);
        
        // Добавляем данные админа в объект запроса
        req.admin = {
            id: decoded.id,
            email: decoded.email
        };

        // Логирование CRUD действий (для роутов кроме /auth)
        if (!req.originalUrl.includes('/auth')) {
            // Сохраняем оригинальный метод res.json
            const originalJson = res.json.bind(res);

            // Перехватываем res.json для логирования после успешного ответа
            res.json = function (data) {
                // Логируем только успешные операции
                if (data && data.success) {
                    const action = getActionType(req.method);
                    const resource = getResourceFromUrl(req.originalUrl);
                    let resourceId = req.params?.id || req.body?.id || null;

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
        }
        
        next();
    } catch (error) {
        // Токен невалидный или истек
        return res.status(401).json({
            success: false,
            error: {
                message: error.message || 'Invalid or expired token',
                code: 'TOKEN_INVALID'
            }
        });
    }
}

/**
 * Опциональная аутентификация
 * Если токен есть - проверяет его, если нет - пропускает дальше
 */
export function optionalAuthMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            // Токена нет - просто продолжаем
            return next();
        }

        const parts = authHeader.split(' ');
        
        if (parts.length === 2 && parts[0] === 'Bearer') {
            const token = parts[1];
            
            try {
                const decoded = verifyAccessToken(token);
                req.admin = {
                    id: decoded.id,
                    email: decoded.email
                };
            } catch (error) {
                // Токен невалидный - игнорируем
            }
        }
        
        next();
    } catch (error) {
        next();
    }
}

