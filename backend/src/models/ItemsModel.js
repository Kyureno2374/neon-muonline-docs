/**
 * Модель для работы с таблицей items
 * Управление базой предметов
 */

import pool from '../config/database.js';

class ItemsModel {
    /**
     * Получить список предметов с пагинацией и фильтрацией
     * @param {Object} options - Опции запроса
     * @param {string} options.lang - Код языка (ru, en)
     * @param {number} options.page - Номер страницы (начиная с 1)
     * @param {number} options.limit - Количество элементов на странице
     * @param {string} options.search - Поисковый запрос
     * @returns {Promise<Object>} - Объект с данными и мета-информацией
     */
    async getAllItems(options = {}) {
        const {
            lang = 'ru',
            page = 1,
            limit = 12,
            search = ''
        } = options;

        const offset = (page - 1) * limit;
        
        // Базовый запрос
        let query = `
            SELECT 
                i.id,
                i.slug,
                i.image_url,
                i.thumbnail_url,
                i.created_at,
                i.updated_at,
                it.name,
                it.description,
                it.language as lang
            FROM items i
            LEFT JOIN item_translations it ON i.id = it.item_id AND it.language = $1
            WHERE i.is_active = TRUE
        `;

        const params = [lang];
        let paramIndex = 2;

        // Добавление поиска
        if (search) {
            query += ` AND (it.name ILIKE $${paramIndex} OR it.description ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Сортировка и пагинация
        query += ` ORDER BY i.id ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        // Запрос данных
        const result = await pool.query(query, params);

        // Подсчет общего количества
        let countQuery = `
            SELECT COUNT(DISTINCT i.id) as total
            FROM items i
            LEFT JOIN item_translations it ON i.id = it.item_id AND it.language = $1
            WHERE i.is_active = TRUE
        `;
        const countParams = [lang];

        if (search) {
            countQuery += ` AND (it.name ILIKE $2 OR it.description ILIKE $2)`;
            countParams.push(`%${search}%`);
        }

        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        return {
            items: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    }

    /**
     * Получить предмет по slug
     * @param {string} slug - Уникальный идентификатор предмета
     * @param {string} lang - Код языка
     * @returns {Promise<Object|null>} - Данные предмета или null
     */
    async getItemBySlug(slug, lang = 'ru') {
        const query = `
            SELECT 
                i.id,
                i.slug,
                i.image_url,
                i.thumbnail_url,
                i.created_at,
                i.updated_at,
                it.name,
                it.description,
                it.language as lang
            FROM items i
            LEFT JOIN item_translations it ON i.id = it.item_id AND it.language = $1
            WHERE i.slug = $2 AND i.is_active = TRUE
        `;
        
        const result = await pool.query(query, [lang, slug]);
        return result.rows[0] || null;
    }

    /**
     * Получить предмет по ID
     * @param {number} id - ID предмета
     * @param {string} lang - Код языка
     * @returns {Promise<Object|null>} - Данные предмета или null
     */
    async getItemById(id, lang = 'ru') {
        const query = `
            SELECT 
                i.id,
                i.slug,
                i.image_url,
                i.thumbnail_url,
                i.created_at,
                i.updated_at,
                it.name,
                it.description,
                it.language as lang
            FROM items i
            LEFT JOIN item_translations it ON i.id = it.item_id AND it.language = $1
            WHERE i.id = $2 AND i.is_active = TRUE
        `;
        
        const result = await pool.query(query, [lang, id]);
        return result.rows[0] || null;
    }

    /**
     * Проверить существование предмета по slug
     * @param {string} slug - Уникальный идентификатор предмета
     * @returns {Promise<boolean>} - true если предмет существует
     */
    async existsBySlug(slug) {
        const query = 'SELECT EXISTS(SELECT 1 FROM items WHERE slug = $1) as exists';
        const result = await pool.query(query, [slug]);
        return result.rows[0].exists;
    }
}

export default new ItemsModel();

