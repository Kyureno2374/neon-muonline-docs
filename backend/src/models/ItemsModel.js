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
            LEFT JOIN item_translations it ON i.id = it.item_id AND it.language = ?
            WHERE i.is_active = TRUE
        `;

        const params = [lang];

        // Добавление поиска (используем LIKE вместо ILIKE)
        if (search) {
            query += ` AND (LOWER(it.name) LIKE LOWER(?) OR LOWER(it.description) LIKE LOWER(?))`;
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam);
        }

        // Сортировка и пагинация
        query += ` ORDER BY i.id ASC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        // Запрос данных
        const [rows] = await pool.query(query, params);

        // Подсчет общего количества
        let countQuery = `
            SELECT COUNT(DISTINCT i.id) as total
            FROM items i
            LEFT JOIN item_translations it ON i.id = it.item_id AND it.language = ?
            WHERE i.is_active = TRUE
        `;
        const countParams = [lang];

        if (search) {
            countQuery += ` AND (LOWER(it.name) LIKE LOWER(?) OR LOWER(it.description) LIKE LOWER(?))`;
            const searchParam = `%${search}%`;
            countParams.push(searchParam, searchParam);
        }

        const [countRows] = await pool.query(countQuery, countParams);
        const total = parseInt(countRows[0].total);
        const totalPages = Math.ceil(total / limit);

        return {
            items: rows,
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
            LEFT JOIN item_translations it ON i.id = it.item_id AND it.language = ?
            WHERE i.slug = ? AND i.is_active = TRUE
        `;
        
        const [rows] = await pool.query(query, [lang, slug]);
        return rows[0] || null;
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
            LEFT JOIN item_translations it ON i.id = it.item_id AND it.language = ?
            WHERE i.id = ? AND i.is_active = TRUE
        `;
        
        const [rows] = await pool.query(query, [lang, id]);
        return rows[0] || null;
    }

    /**
     * Проверить существование предмета по slug
     * @param {string} slug - Уникальный идентификатор предмета
     * @returns {Promise<boolean>} - true если предмет существует
     */
    async existsBySlug(slug) {
        const query = 'SELECT EXISTS(SELECT 1 FROM items WHERE slug = ?) as `exists`';
        const [rows] = await pool.query(query, [slug]);
        return !!rows[0].exists;
    }

    // ==================== ADMIN CRUD METHODS ====================

    /**
     * Создать новый предмет
     * @param {Object} itemData - Данные предмета
     * @returns {Promise<Object>} - Созданный предмет
     */
    async createItem(itemData) {
        const { slug, image_url = null, thumbnail_url = null } = itemData;

        // Проверка уникальности slug
        const exists = await this.existsBySlug(slug);
        if (exists) {
            throw new Error(`Item with slug "${slug}" already exists`);
        }

        const query = `
            INSERT INTO items (slug, image_url, thumbnail_url, is_active)
            VALUES (?, ?, ?, TRUE)
        `;

        const [result] = await pool.query(query, [slug, image_url, thumbnail_url]);
        
        return {
            id: result.insertId,
            slug,
            image_url,
            thumbnail_url,
            is_active: true
        };
    }

    /**
     * Обновить предмет
     * @param {number} id - ID предмета
     * @param {Object} itemData - Новые данные
     * @returns {Promise<Object>} - Обновлённый предмет
     */
    async updateItem(id, itemData) {
        const { slug, image_url, thumbnail_url, is_active } = itemData;

        // Проверка уникальности slug (если он меняется)
        if (slug) {
            const [existing] = await pool.query(
                'SELECT id FROM items WHERE slug = ? AND id != ?',
                [slug, id]
            );
            if (existing.length > 0) {
                throw new Error(`Item with slug "${slug}" already exists`);
            }
        }

        const query = `
            UPDATE items
            SET 
                slug = COALESCE(?, slug),
                image_url = COALESCE(?, image_url),
                thumbnail_url = COALESCE(?, thumbnail_url),
                is_active = COALESCE(?, is_active),
                updated_at = NOW()
            WHERE id = ?
        `;

        await pool.query(query, [slug, image_url, thumbnail_url, is_active, id]);

        // Возвращаем обновлённый предмет
        const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
        return rows[0];
    }

    /**
     * Удалить предмет (мягкое удаление)
     * @param {number} id - ID предмета
     * @returns {Promise<boolean>} - Успешность удаления
     */
    async deleteItem(id) {
        const query = `
            UPDATE items
            SET is_active = FALSE, updated_at = NOW()
            WHERE id = ?
        `;

        const [result] = await pool.query(query, [id]);
        return result.affectedRows > 0;
    }

    /**
     * Получить все переводы предмета
     * @param {number} itemId - ID предмета
     * @returns {Promise<Array>} - Массив переводов
     */
    async getItemTranslations(itemId) {
        const query = `
            SELECT 
                it.id,
                it.item_id,
                it.language,
                it.name,
                it.description,
                it.created_at,
                it.updated_at
            FROM item_translations it
            WHERE it.item_id = ?
            ORDER BY it.language ASC
        `;

        const [rows] = await pool.query(query, [itemId]);
        return rows;
    }

    /**
     * Создать перевод предмета
     * @param {number} itemId - ID предмета
     * @param {string} language - Код языка
     * @param {string} name - Название предмета
     * @param {string} description - Описание предмета
     * @returns {Promise<Object>} - Созданный перевод
     */
    async createItemTranslation(itemId, language, name, description) {
        const query = `
            INSERT INTO item_translations (item_id, language, name, description)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await pool.query(query, [itemId, language, name, description]);

        return {
            id: result.insertId,
            item_id: itemId,
            language,
            name,
            description
        };
    }

    /**
     * Обновить перевод предмета
     * @param {number} itemId - ID предмета
     * @param {string} language - Код языка
     * @param {string} name - Новое название
     * @param {string} description - Новое описание
     * @returns {Promise<Object>} - Обновлённый перевод
     */
    async updateItemTranslation(itemId, language, name, description) {
        const query = `
            UPDATE item_translations
            SET 
                name = COALESCE(?, name),
                description = COALESCE(?, description),
                updated_at = NOW()
            WHERE item_id = ? AND language = ?
        `;

        const [result] = await pool.query(query, [name, description, itemId, language]);

        if (result.affectedRows === 0) {
            throw new Error('Translation not found');
        }

        const [rows] = await pool.query(
            'SELECT * FROM item_translations WHERE item_id = ? AND language = ?',
            [itemId, language]
        );

        return rows[0];
    }

    /**
     * Удалить перевод предмета
     * @param {number} itemId - ID предмета
     * @param {string} language - Код языка
     * @returns {Promise<boolean>} - Успешность удаления
     */
    async deleteItemTranslation(itemId, language) {
        const query = `
            DELETE FROM item_translations
            WHERE item_id = ? AND language = ?
        `;

        const [result] = await pool.query(query, [itemId, language]);
        return result.affectedRows > 0;
    }

    /**
     * Получить все предметы (включая неактивные) для админки
     * @param {Object} options - Опции запроса
     * @returns {Promise<Array>} - Список предметов
     */
    async getAllItemsForAdmin(options = {}) {
        const { search = '' } = options;

        let query = `
            SELECT 
                i.id,
                i.slug,
                i.image_url,
                i.thumbnail_url,
                i.is_active,
                i.created_at,
                i.updated_at
            FROM items i
        `;

        const params = [];

        if (search) {
            query += ` WHERE LOWER(i.slug) LIKE LOWER(?)`;
            params.push(`%${search}%`);
        }

        query += ' ORDER BY i.id ASC';

        const [rows] = await pool.query(query, params);
        return rows;
    }
}

export default new ItemsModel();
