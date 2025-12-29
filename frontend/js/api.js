/**
 * API Client для работы с бекенд API
 * Базовый URL: http://localhost:3000/api
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Получить JWT токен из localStorage
 */
function getToken() {
    return localStorage.getItem('accessToken');
}

/**
 * Сохранить JWT токены
 */
function saveTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
}

/**
 * Очистить токены (logout)
 */
export function clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
}

/**
 * Базовая функция для API запросов
 */
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Добавляем JWT токен если есть
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        // Если 401 - токен истек, пытаемся обновить
        if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                // Повторяем запрос с новым токеном
                return apiCall(endpoint, options);
            } else {
                // Не удалось обновить - редирект на логин
                window.location.href = '/login/login.html';
                throw new Error('Unauthorized');
            }
        }

        const data = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                message: data.message || 'API Error',
                data: data,
            };
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Обновить access token используя refresh token
 */
async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) return false;

        const data = await response.json();
        // Сервер возвращает { success: true, data: { accessToken } }
        if (data.data && data.data.accessToken) {
            saveTokens(data.data.accessToken, refreshToken);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
}

// =====================================
// PUBLIC API (для пользователей)
// =====================================

/**
 * Получить список всех страниц
 */
export async function getPages(lang = 'ru') {
    return apiCall(`/pages?lang=${lang}`);
}

/**
 * Получить одну страницу со всеми блоками
 */
export async function getPageBySlug(slug, lang = 'ru') {
    return apiCall(`/pages/${slug}?lang=${lang}`);
}

/**
 * Получить блоки страницы
 */
export async function getPageBlocks(slug, lang = 'ru') {
    return apiCall(`/pages/${slug}/blocks?lang=${lang}`);
}

/**
 * Получить список предметов (с пагинацией)
 */
export async function getItems(page = 1, limit = 12, lang = 'ru') {
    return apiCall(`/items?page=${page}&limit=${limit}&lang=${lang}`);
}

/**
 * Получить один предмет
 */
export async function getItemBySlug(slug, lang = 'ru') {
    return apiCall(`/items/${slug}?lang=${lang}`);
}

/**
 * Поиск предметов
 */
export async function searchItems(query, lang = 'ru') {
    return apiCall(`/items/search?q=${encodeURIComponent(query)}&lang=${lang}`);
}

// =====================================
// ADMIN AUTH API
// =====================================

/**
 * Вход в админку
 */
export async function adminLogin(email, password) {
    const data = await apiCall('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    
    // Сервер возвращает { success: true, data: { admin: {...}, tokens: { accessToken, refreshToken } } }
    if (data.data && data.data.tokens) {
        const { accessToken, refreshToken } = data.data.tokens;
        saveTokens(accessToken, refreshToken);
    }
    
    return data;
}

/**
 * Выход из админки
 */
export async function adminLogout() {
    clearTokens();
    return apiCall('/admin/auth/logout', { method: 'POST' });
}

/**
 * Получить данные текущего админа
 */
export async function getAdminMe() {
    return apiCall('/admin/auth/me');
}

/**
 * Проверить, авторизован ли админ
 */
export function isAdminLoggedIn() {
    return !!getToken();
}

// =====================================
// ADMIN PAGES API
// =====================================

/**
 * Получить все страницы (для админки)
 */
export async function adminGetPages(lang = 'ru') {
    return apiCall(`/admin/pages?lang=${lang}`);
}

/**
 * Создать новую страницу
 */
export async function adminCreatePage(pageData) {
    return apiCall('/admin/pages', {
        method: 'POST',
        body: JSON.stringify(pageData),
    });
}

/**
 * Обновить страницу
 */
export async function adminUpdatePage(pageId, pageData) {
    return apiCall(`/admin/pages/${pageId}`, {
        method: 'PUT',
        body: JSON.stringify(pageData),
    });
}

/**
 * Удалить страницу
 */
export async function adminDeletePage(pageId) {
    return apiCall(`/admin/pages/${pageId}`, {
        method: 'DELETE',
    });
}

/**
 * Получить переводы страницы
 */
export async function adminGetPageTranslations(pageId) {
    return apiCall(`/admin/pages/${pageId}/translations`);
}

/**
 * Создать перевод страницы
 */
export async function adminCreatePageTranslation(pageId, lang, translationData) {
    return apiCall(`/admin/pages/${pageId}/translations`, {
        method: 'POST',
        body: JSON.stringify({ lang, ...translationData }),
    });
}

/**
 * Обновить перевод страницы
 */
export async function adminUpdatePageTranslation(pageId, lang, translationData) {
    return apiCall(`/admin/pages/${pageId}/translations/${lang}`, {
        method: 'PUT',
        body: JSON.stringify(translationData),
    });
}

// =====================================
// ADMIN BLOCKS API
// =====================================

/**
 * Получить все блоки (для админки)
 */
export async function adminGetBlocks(pageId = null, lang = 'ru') {
    let endpoint = '/admin/blocks';
    const params = new URLSearchParams();
    if (pageId) params.append('page_id', pageId);
    params.append('lang', lang);
    if (params.toString()) endpoint += `?${params.toString()}`;
    return apiCall(endpoint);
}

/**
 * Создать новый блок
 */
export async function adminCreateBlock(blockData) {
    return apiCall('/admin/blocks', {
        method: 'POST',
        body: JSON.stringify(blockData),
    });
}

/**
 * Обновить блок
 */
export async function adminUpdateBlock(blockId, blockData) {
    return apiCall(`/admin/blocks/${blockId}`, {
        method: 'PUT',
        body: JSON.stringify(blockData),
    });
}

/**
 * Удалить блок
 */
export async function adminDeleteBlock(blockId) {
    return apiCall(`/admin/blocks/${blockId}`, {
        method: 'DELETE',
    });
}

/**
 * Получить переводы блока
 */
export async function adminGetBlockTranslations(blockId) {
    return apiCall(`/admin/blocks/${blockId}/translations`);
}

/**
 * Создать перевод блока
 */
export async function adminCreateBlockTranslation(blockId, lang, translationData) {
    return apiCall(`/admin/blocks/${blockId}/translations`, {
        method: 'POST',
        body: JSON.stringify({ lang, ...translationData }),
    });
}

/**
 * Обновить перевод блока
 */
export async function adminUpdateBlockTranslation(blockId, lang, translationData) {
    return apiCall(`/admin/blocks/${blockId}/translations/${lang}`, {
        method: 'PUT',
        body: JSON.stringify(translationData),
    });
}

// =====================================
// ADMIN ITEMS API
// =====================================

/**
 * Получить все предметы (для админки)
 */
export async function adminGetItems(page = 1, limit = 50) {
    return apiCall(`/admin/items?page=${page}&limit=${limit}`);
}

/**
 * Создать новый предмет
 */
export async function adminCreateItem(itemData) {
    return apiCall('/admin/items', {
        method: 'POST',
        body: JSON.stringify(itemData),
    });
}

/**
 * Обновить предмет
 */
export async function adminUpdateItem(itemId, itemData) {
    return apiCall(`/admin/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(itemData),
    });
}

/**
 * Получить все категории предметов (для админки)
 */
export async function adminGetItemCategories(lang = 'ru') {
    return apiCall(`/admin/item-categories?lang=${lang}`);
}

/**
 * Создать новую категорию
 */
export async function adminCreateItemCategory(categoryData) {
    return apiCall('/admin/item-categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
    });
}

/**
 * Обновить категорию
 */
export async function adminUpdateItemCategory(categoryId, categoryData) {
    return apiCall(`/admin/item-categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData),
    });
}

/**
 * Удалить категорию
 */
export async function adminDeleteItemCategory(categoryId) {
    return apiCall(`/admin/item-categories/${categoryId}`, {
        method: 'DELETE',
    });
}

/**
 * Получить переводы категории
 */
export async function adminGetItemCategoryTranslations(categoryId) {
    return apiCall(`/admin/item-categories/${categoryId}/translations`);
}

/**
 * Создать перевод категории
 */
export async function adminCreateItemCategoryTranslation(categoryId, lang, translationData) {
    return apiCall(`/admin/item-categories/${categoryId}/translations`, {
        method: 'POST',
        body: JSON.stringify({ lang, ...translationData }),
    });
}

/**
 * Обновить перевод категории
 */
export async function adminUpdateItemCategoryTranslation(categoryId, lang, translationData) {
    return apiCall(`/admin/item-categories/${categoryId}/translations/${lang}`, {
        method: 'PUT',
        body: JSON.stringify(translationData),
    });
}

/**
 * Получить переводы предмета
 */
export async function adminGetItemTranslations(itemId) {
    return apiCall(`/admin/items/${itemId}/translations`);
}

/**
 * Создать перевод предмета
 */
export async function adminCreateItemTranslation(itemId, lang, translationData) {
    return apiCall(`/admin/items/${itemId}/translations`, {
        method: 'POST',
        body: JSON.stringify({ lang, ...translationData }),
    });
}

/**
 * Обновить перевод предмета
 */
export async function adminUpdateItemTranslation(itemId, lang, translationData) {
    return apiCall(`/admin/items/${itemId}/translations/${lang}`, {
        method: 'PUT',
        body: JSON.stringify(translationData),
    });
}

// =====================================
// ADMIN LANGUAGES API
// =====================================

/**
 * Получить все языки
 */
export async function adminGetLanguages() {
    return apiCall('/admin/languages');
}

/**
 * Получить активные языки
 */
export async function adminGetActiveLanguages() {
    return apiCall('/admin/languages/active');
}

/**
 * Создать новый язык
 */
export async function adminCreateLanguage(languageData) {
    return apiCall('/admin/languages', {
        method: 'POST',
        body: JSON.stringify(languageData),
    });
}

/**
 * Обновить язык
 */
export async function adminUpdateLanguage(langCode, languageData) {
    return apiCall(`/admin/languages/${langCode}`, {
        method: 'PUT',
        body: JSON.stringify(languageData),
    });
}

/**
 * Переключить статус языка (активный/неактивный)
 */
export async function adminToggleLanguage(langCode) {
    return apiCall(`/admin/languages/${langCode}/toggle`, {
        method: 'PUT',
    });
}

/**
 * Удалить язык
 */
export async function adminDeleteLanguage(langCode) {
    return apiCall(`/admin/languages/${langCode}`, {
        method: 'DELETE',
    });
}

// =====================================
// ADMIN UPLOAD API
// =====================================

/**
 * Загрузить изображение
 */
export async function adminUploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const token = getToken();
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/upload/image`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw error;
        }

        return await response.json();
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

/**
 * Удалить изображение
 */
export async function adminDeleteImage(imageUrl) {
    return apiCall('/admin/upload/image', {
        method: 'DELETE',
        body: JSON.stringify({ imageUrl }),
    });
}

// =====================================
// UTILITY FUNCTIONS
// =====================================

/**
 * Показать уведомление об ошибке
 */
export function showError(message) {
    console.error(message);
    // TODO: Реализовать красивое уведомление
    alert(`❌ Ошибка: ${message}`);
}

/**
 * Показать уведомление об успехе
 */
export function showSuccess(message) {
    console.log(message);
    // TODO: Реализовать красивое уведомление
    alert(`✅ ${message}`);
}
