/**
 * Модель для работы с таблицей item_categories
 * Управление категориями предметов
 */

import pool from '../config/database.js';

class ItemCategoriesModel {
    /**
     * Получить все категории с переводами
     * @param {string} lang - Код языка (ru, en)
     * @returns {Promise<Array>} - Список категорий
     */
    async getAllCategories(lang = 'ru') {
        const query = `
            SELECT 
                ic.id,
                ic.slug,
                ic.sort_order,
                ict.name,
                ict.language as lang
            FROM item_categories ic
            LEFT JOIN item_category_translations ict ON ic.id = ict.category_id AND ict.language = ?
            WHERE ic.is_active = TRUE
            ORDER BY ic.sort_order ASC, ic.id ASC
        `;
        
        const [rows] = await pool.query(query, [lang]);
        return rows;
    }

    /**
     * Получить категорию по ID
     * @param {number} id - ID категории
     * @param {string} lang - Код языка
     * @returns {Promise<Object|null>} - Данные категории или null
     */
    async getCategoryById(id, lang = 'ru') {
        const query = `
            SELECT 
                ic.id,
                ic.slug,
                ic.sort_order,
                ict.name,
                ict.language as lang
            FROM item_categories ic
            LEFT JOIN item_category_translations ict ON ic.id = ict.category_id AND ict.language = ?
            WHERE ic.id = ? AND ic.is_active = TRUE
        `;
        
        const [rows] = await pool.query(query, [lang, id]);
        return rows[0] || null;
    }

    /**
     * Создать новую категорию
     * @param {Object} data - Данные категории
     * @returns {Promise<number>} - ID новой категории
     */
    async createCategory(data) {
        const { slug, sort_order = 0 } = data;
        
        const query = `
            INSERT INTO item_categories (slug, sort_order)
            VALUES (?, ?)
        `;
        
        const [result] = await pool.query(query, [slug, sort_order]);
        return result.insertId;
    }

    /**
     * Обновить категорию
     * @param {number} id - ID категории
     * @param {Object} data - Новые данные
     * @returns {Promise<boolean>} - Успешность операции
     */
    async updateCategory(id, data) {
        const { slug, sort_order } = data;
        
        const query = `
            UPDATE item_categories
            SET slug = ?, sort_order = ?
            WHERE id = ?
        `;
        
        const [result] = await pool.query(query, [slug, sort_order, id]);
        return result.affectedRows > 0;
    }

    /**
     * Удалить категорию
     * @param {number} id - ID категории
     * @returns {Promise<boolean>} - Успешность операции
     */
    async deleteCategory(id) {
        const query = `
            DELETE FROM item_categories
            WHERE id = ?
        `;
        
        const [result] = await pool.query(query, [id]);
        return result.affectedRows > 0;
    }

    /**
     * Создать перевод категории
     * @param {number} categoryId - ID категории
     * @param {string} lang - Код языка
     * @param {Object} data - Данные перевода
     * @returns {Promise<number>} - ID перевода
     */
    async createCategoryTranslation(categoryId, lang, data) {
        const { name } = data;
        
        const query = `
            INSERT INTO item_category_translations (category_id, language, name)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE name = ?
        `;
        
        const [result] = await pool.query(query, [categoryId, lang, name, name]);
        return result.insertId;
    }

    /**
     * Обновить перевод категории
     * @param {number} categoryId - ID категории
     * @param {string} lang - Код языка
     * @param {Object} data - Новые данные
     * @returns {Promise<boolean>} - Успешность операции
     */
    async updateCategoryTranslation(categoryId, lang, data) {
        const { name } = data;
        
        const query = `
            UPDATE item_category_translations
            SET name = ?
            WHERE category_id = ? AND language = ?
        `;
        
        const [result] = await pool.query(query, [name, categoryId, lang]);
        return result.affectedRows > 0;
    }

    /**
     * Получить все переводы категории
     * @param {number} categoryId - ID категории
     * @returns {Promise<Array>} - Список переводов
     */
    async getCategoryTranslations(categoryId) {
        const query = `
            SELECT 
                id,
                language,
                name
            FROM item_category_translations
            WHERE category_id = ?
        `;
        
        const [rows] = await pool.query(query, [categoryId]);
        return rows;
    }
}

export default new ItemCategoriesModel();
