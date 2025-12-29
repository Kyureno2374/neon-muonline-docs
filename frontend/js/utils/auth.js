/**
 * Утилиты для работы с аутентификацией
 */

class AuthManager {
    constructor() {
        this.ACCESS_TOKEN_KEY = 'neon_access_token';
        this.REFRESH_TOKEN_KEY = 'neon_refresh_token';
        this.ADMIN_DATA_KEY = 'neon_admin_data';
    }

    /**
     * Сохранить токены после успешного логина
     */
    saveTokens(accessToken, refreshToken) {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }

    /**
     * Получить access token
     */
    getAccessToken() {
        return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }

    /**
     * Получить refresh token
     */
    getRefreshToken() {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    /**
     * Сохранить данные админа
     */
    saveAdminData(admin) {
        localStorage.setItem(this.ADMIN_DATA_KEY, JSON.stringify(admin));
    }

    /**
     * Получить данные админа
     */
    getAdminData() {
        const data = localStorage.getItem(this.ADMIN_DATA_KEY);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Проверить авторизован ли пользователь
     */
    isAuthenticated() {
        return !!this.getAccessToken();
    }

    /**
     * Выйти из системы
     */
    async logout() {
        // Backend connection removed - just clear local storage
        this.clearAuth();
    }

    /**
     * Очистить данные авторизации
     */
    clearAuth() {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.ADMIN_DATA_KEY);
    }

    /**
     * Обновить access token через refresh token
     */
    async refreshAccessToken() {
        // Backend connection removed - functionality disabled
        this.clearAuth();
        throw new Error('Backend connection removed');
    }

    /**
     * Проверить и при необходимости перенаправить на логин
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login/index.html';
            return false;
        }
        return true;
    }

    /**
     * Перенаправить на админку если уже авторизован
     */
    redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            window.location.href = '/admin/index.html';
            return true;
        }
        return false;
    }
}

// Экспортируем экземпляр
const auth = new AuthManager();

