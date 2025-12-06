/**
 * Middleware для проверки JWT токена
 * Защищает роуты администратора от неавторизованного доступа
 */

import { verifyAccessToken } from '../utils/jwtUtils.js';

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

