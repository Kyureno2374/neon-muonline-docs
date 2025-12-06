/**
 * Утилиты для работы с JWT токенами
 */

import jwt from 'jsonwebtoken';

// Секретные ключи (должны быть в .env)
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'your-secret-access-key-change-this';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'your-secret-refresh-key-change-this';

// Время жизни токенов
const ACCESS_TOKEN_EXPIRES_IN = '1d';  // 1 день
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // 7 дней

/**
 * Генерация access токена
 * @param {Object} payload - Данные для токена (id, email)
 * @returns {string} - JWT токен
 */
export function generateAccessToken(payload) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN
    });
}

/**
 * Генерация refresh токена
 * @param {Object} payload - Данные для токена (id)
 * @returns {string} - JWT токен
 */
export function generateRefreshToken(payload) {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN
    });
}

/**
 * Верификация access токена
 * @param {string} token - JWT токен
 * @returns {Object} - Декодированные данные токена
 * @throws {Error} - Если токен невалидный или истек
 */
export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired access token');
    }
}

/**
 * Верификация refresh токена
 * @param {string} token - JWT токен
 * @returns {Object} - Декодированные данные токена
 * @throws {Error} - Если токен невалидный или истек
 */
export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
}

/**
 * Декодирование токена без проверки подписи
 * @param {string} token - JWT токен
 * @returns {Object|null} - Декодированные данные или null
 */
export function decodeToken(token) {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
}

