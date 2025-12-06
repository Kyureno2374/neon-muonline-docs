/**
 * Модель для работы с таблицей pages
 * Управление страницами сайта
 */

import pool from '../config/database.js';

class PagesModel {
    /**
     * Получить список всех страниц с переводами
     * @param {string} lang - Код языка (ru, en)
     * @returns {Promise<Array>} - Список страниц
     */
    async getAllPages(lang = 'ru') {
        const query = `
            SELECT 
                p.id,
                p.slug,
                p.icon,
                p.sort_order as display_order,
                pt.name as title,
                pt.language as lang
            FROM pages p
            LEFT JOIN page_translations pt ON p.id = pt.page_id AND pt.language = $1
            WHERE p.is_active = TRUE
            ORDER BY p.sort_order ASC, p.id ASC
        `;
        
        const result = await pool.query(query, [lang]);
        return result.rows;
    }

    /**
     * Получить страницу по slug с переводами
     * @param {string} slug - Уникальный идентификатор страницы
     * @param {string} lang - Код языка
     * @returns {Promise<Object|null>} - Данные страницы или null
     */
    async getPageBySlug(slug, lang = 'ru') {
        const query = `
            SELECT 
                p.id,
                p.slug,
                p.icon,
                p.sort_order as display_order,
                p.created_at,
                p.updated_at,
                pt.name as title,
                pt.language as lang
            FROM pages p
            LEFT JOIN page_translations pt ON p.id = pt.page_id AND pt.language = $1
            WHERE p.slug = $2 AND p.is_active = TRUE
        `;
        
        const result = await pool.query(query, [lang, slug]);
        return result.rows[0] || null;
    }

    /**
     * Получить страницу по ID
     * @param {number} id - ID страницы
     * @param {string} lang - Код языка
     * @returns {Promise<Object|null>} - Данные страницы или null
     */
    async getPageById(id, lang = 'ru') {
        const query = `
            SELECT 
                p.id,
                p.slug,
                p.icon,
                p.sort_order as display_order,
                p.created_at,
                p.updated_at,
                pt.name as title,
                pt.language as lang
            FROM pages p
            LEFT JOIN page_translations pt ON p.id = pt.page_id AND pt.language = $1
            WHERE p.id = $2 AND p.is_active = TRUE
        `;
        
        const result = await pool.query(query, [lang, id]);
        return result.rows[0] || null;
    }

    /**
     * Проверить существование страницы по slug
     * @param {string} slug - Уникальный идентификатор страницы
     * @returns {Promise<boolean>} - true если страница существует
     */
    async existsBySlug(slug) {
        const query = 'SELECT EXISTS(SELECT 1 FROM pages WHERE slug = $1) as exists';
        const result = await pool.query(query, [slug]);
        return result.rows[0].exists;
    }
}

export default new PagesModel();

