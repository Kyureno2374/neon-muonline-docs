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
                p.sort_order as display_order,
                pt.name as title,
                pt.language as lang
            FROM pages p
            LEFT JOIN page_translations pt ON p.id = pt.page_id AND pt.language = ?
            WHERE p.is_active = TRUE
            ORDER BY p.sort_order ASC, p.id ASC
        `;
        
        const [rows] = await pool.query(query, [lang]);
        return rows;
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
                p.sort_order as display_order,
                p.created_at,
                p.updated_at,
                pt.name as title,
                pt.language as lang
            FROM pages p
            LEFT JOIN page_translations pt ON p.id = pt.page_id AND pt.language = ?
            WHERE p.slug = ? AND p.is_active = TRUE
        `;
        
        const [rows] = await pool.query(query, [lang, slug]);
        return rows[0] || null;
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
                p.sort_order as display_order,
                p.created_at,
                p.updated_at,
                pt.name as title,
                pt.language as lang
            FROM pages p
            LEFT JOIN page_translations pt ON p.id = pt.page_id AND pt.language = ?
            WHERE p.id = ? AND p.is_active = TRUE
        `;
        
        const [rows] = await pool.query(query, [lang, id]);
        return rows[0] || null;
    }

    /**
     * Проверить существование страницы по slug
     * @param {string} slug - Уникальный идентификатор страницы
     * @returns {Promise<boolean>} - true если страница существует
     */
    async existsBySlug(slug) {
        const query = 'SELECT EXISTS(SELECT 1 FROM pages WHERE slug = ?) as `exists`';
        const [rows] = await pool.query(query, [slug]);
        return !!rows[0].exists;
    }

    /**
     * Создать новую страницу
     * @param {Object} pageData - Данные страницы
     * @param {string} pageData.slug - Уникальный идентификатор
     * @param {number} pageData.sort_order - Порядок сортировки
     * @returns {Promise<Object>} - Созданная страница
     */
    async createPage({ slug, sort_order = 999 }) {
        const query = `
            INSERT INTO pages (slug, sort_order, is_active)
            VALUES (?, ?, TRUE)
        `;
        
        const [result] = await pool.query(query, [slug, sort_order]);
        
        // Получаем созданную страницу
        const [rows] = await pool.query(
            'SELECT * FROM pages WHERE id = ?',
            [result.insertId]
        );
        return rows[0];
    }

    /**
     * Обновить страницу
     * @param {number} id - ID страницы
     * @param {Object} pageData - Данные для обновления
     * @returns {Promise<Object|null>} - Обновленная страница или null
     */
    async updatePage(id, { slug, sort_order, is_active }) {
        const fields = [];
        const values = [];

        if (slug !== undefined) {
            fields.push('slug = ?');
            values.push(slug);
        }
        if (sort_order !== undefined) {
            fields.push('sort_order = ?');
            values.push(sort_order);
        }
        if (is_active !== undefined) {
            fields.push('is_active = ?');
            values.push(is_active);
        }

        if (fields.length === 0) {
            return null;
        }

        values.push(id);

        const query = `
            UPDATE pages
            SET ${fields.join(', ')}
            WHERE id = ?
        `;

        await pool.query(query, values);
        
        // Получаем обновленную страницу
        const [rows] = await pool.query('SELECT * FROM pages WHERE id = ?', [id]);
        return rows[0] || null;
    }

    /**
     * Удалить страницу (мягкое удаление)
     * @param {number} id - ID страницы
     * @returns {Promise<boolean>} - true если удалено успешно
     */
    async deletePage(id) {
        const query = `
            UPDATE pages 
            SET is_active = FALSE
            WHERE id = ?
        `;
        
        const [result] = await pool.query(query, [id]);
        return result.affectedRows > 0;
    }

    /**
     * Получить все переводы страницы
     * @param {number} pageId - ID страницы
     * @returns {Promise<Array>} - Список переводов
     */
    async getPageTranslations(pageId) {
        const query = `
            SELECT page_id, language, name, created_at, updated_at
            FROM page_translations
            WHERE page_id = ?
            ORDER BY language ASC
        `;
        
        const [rows] = await pool.query(query, [pageId]);
        return rows;
    }

    /**
     * Создать перевод страницы
     * @param {number} pageId - ID страницы
     * @param {string} language - Код языка
     * @param {string} name - Название на языке
     * @returns {Promise<Object>} - Созданный перевод
     */
    async createPageTranslation(pageId, language, name) {
        const query = `
            INSERT INTO page_translations (page_id, language, name)
            VALUES (?, ?, ?)
        `;
        
        await pool.query(query, [pageId, language, name]);
        
        // Получаем созданный перевод
        const [rows] = await pool.query(
            'SELECT * FROM page_translations WHERE page_id = ? AND language = ?',
            [pageId, language]
        );
        return rows[0];
    }

    /**
     * Обновить перевод страницы
     * @param {number} pageId - ID страницы
     * @param {string} language - Код языка
     * @param {string} name - Новое название
     * @returns {Promise<Object|null>} - Обновленный перевод или null
     */
    async updatePageTranslation(pageId, language, name) {
        const query = `
            UPDATE page_translations
            SET name = ?
            WHERE page_id = ? AND language = ?
        `;
        
        const [result] = await pool.query(query, [name, pageId, language]);
        
        if (result.affectedRows === 0) {
            return null;
        }
        
        // Получаем обновленный перевод
        const [rows] = await pool.query(
            'SELECT * FROM page_translations WHERE page_id = ? AND language = ?',
            [pageId, language]
        );
        return rows[0];
    }

    /**
     * Удалить перевод страницы
     * @param {number} pageId - ID страницы
     * @param {string} language - Код языка
     * @returns {Promise<boolean>} - true если удалено успешно
     */
    async deletePageTranslation(pageId, language) {
        const query = `
            DELETE FROM page_translations
            WHERE page_id = ? AND language = ?
        `;
        
        const [result] = await pool.query(query, [pageId, language]);
        return result.affectedRows > 0;
    }
}

export default new PagesModel();
