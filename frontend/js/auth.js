/**
 * Утилиты для работы с аутентификацией
 */

import { isAdminLoggedIn, clearTokens } from './api.js';

/**
 * Проверить, авторизован ли пользователь
 * Если нет - редирект на логин
 */
export function requireAuth() {
    if (!isAdminLoggedIn()) {
        window.location.href = '/admin/login/index.html';
        return false;
    }
    return true;
}

/**
 * Проверить, авторизован ли пользователь
 * Если да - редирект на админку
 */
export function requireNoAuth() {
    if (isAdminLoggedIn()) {
        window.location.href = '/admin/main/index.html';
        return false;
    }
    return true;
}

/**
 * Выход из системы
 */
export function logout() {
    clearTokens();
    window.location.href = '/login/login.html';
}

/**
 * Получить текущий язык (по умолчанию 'ru')
 */
export function getCurrentLanguage() {
    return localStorage.getItem('language') || 'ru';
}

/**
 * Установить текущий язык
 */
export function setCurrentLanguage(lang) {
    localStorage.setItem('language', lang);
}
