/**
 * Модель для работы с таблицей blocks
 * Управление блоками контента страниц
 */

import pool from '../config/database.js';

class BlocksModel {
    /**
     * Получить все блоки страницы с переводами
     * @param {number} pageId - ID страницы
     * @param {string} lang - Код языка (ru, en)
     * @returns {Promise<Array>} - Список блоков
     */
    async getBlocksByPageId(pageId, lang = 'ru') {
        const query = `
            SELECT 
                b.id,
                b.page_id,
                b.block_type_id,
                bt.slug as block_type_slug,
                bt.name as block_type_name,
                b.image_url,
                b.thumbnail_url,
                b.sort_order as display_order,
                b.created_at,
                b.updated_at,
                btrans.content,
                btrans.language as lang
            FROM blocks b
            LEFT JOIN block_types bt ON b.block_type_id = bt.id
            LEFT JOIN block_translations btrans ON b.id = btrans.block_id AND btrans.language = ?
            WHERE b.page_id = ? AND b.is_active = TRUE
            ORDER BY b.sort_order ASC, b.id ASC
        `;
        
        const [rows] = await pool.query(query, [lang, pageId]);
        return rows;
    }

    /**
     * Получить все блоки страницы по slug
     * @param {string} pageSlug - Slug страницы
     * @param {string} lang - Код языка
     * @returns {Promise<Array>} - Список блоков
     */
    async getBlocksByPageSlug(pageSlug, lang = 'ru') {
        const query = `
            SELECT 
                b.id,
                b.page_id,
                b.block_type_id,
                bt.slug as block_type_slug,
                bt.name as block_type_name,
                b.image_url,
                b.thumbnail_url,
                b.sort_order as display_order,
                b.created_at,
                b.updated_at,
                btrans.content,
                btrans.language as lang
            FROM blocks b
            INNER JOIN pages p ON b.page_id = p.id
            LEFT JOIN block_types bt ON b.block_type_id = bt.id
            LEFT JOIN block_translations btrans ON b.id = btrans.block_id AND btrans.language = ?
            WHERE p.slug = ? AND b.is_active = TRUE AND p.is_active = TRUE
            ORDER BY b.sort_order ASC, b.id ASC
        `;
        
        const [rows] = await pool.query(query, [lang, pageSlug]);
        return rows;
    }

    /**
     * Получить один блок по ID
     * @param {number} id - ID блока
     * @param {string} lang - Код языка
     * @returns {Promise<Object|null>} - Данные блока или null
     */
    async getBlockById(id, lang = 'ru') {
        const query = `
            SELECT 
                b.id,
                b.page_id,
                b.block_type_id,
                bt.slug as block_type_slug,
                bt.name as block_type_name,
                b.image_url,
                b.thumbnail_url,
                b.sort_order as display_order,
                b.created_at,
                b.updated_at,
                btrans.content,
                btrans.language as lang
            FROM blocks b
            LEFT JOIN block_types bt ON b.block_type_id = bt.id
            LEFT JOIN block_translations btrans ON b.id = btrans.block_id AND btrans.language = ?
            WHERE b.id = ? AND b.is_active = TRUE
        `;
        
        const [rows] = await pool.query(query, [lang, id]);
        return rows[0] || null;
    }

    /**
     * Получить типы блоков
     * @returns {Promise<Array>} - Список типов блоков (text, picture, list)
     */
    async getBlockTypes() {
        const query = `
            SELECT id, name, description
            FROM block_types
            ORDER BY id ASC
        `;
        
        const [rows] = await pool.query(query);
        return rows;
    }

    // ==================== ADMIN CRUD METHODS ====================

    /**
     * Создать новый блок
     * @param {Object} blockData - Данные блока
     * @returns {Promise<Object>} - Созданный блок
     */
    async createBlock(blockData) {
        const { page_id, block_type_id, image_url = null, thumbnail_url = null, sort_order = 0 } = blockData;

        const query = `
            INSERT INTO blocks (page_id, block_type_id, image_url, thumbnail_url, sort_order, is_active)
            VALUES (?, ?, ?, ?, ?, TRUE)
        `;

        const [result] = await pool.query(query, [page_id, block_type_id, image_url, thumbnail_url, sort_order]);
        
        return {
            id: result.insertId,
            page_id,
            block_type_id,
            image_url,
            thumbnail_url,
            sort_order,
            is_active: true
        };
    }

    /**
     * Обновить блок
     * @param {number} id - ID блока
     * @param {Object} blockData - Новые данные
     * @returns {Promise<Object>} - Обновлённый блок
     */
    async updateBlock(id, blockData) {
        const { block_type_id, image_url, thumbnail_url, sort_order, is_active } = blockData;

        const query = `
            UPDATE blocks
            SET 
                block_type_id = COALESCE(?, block_type_id),
                image_url = COALESCE(?, image_url),
                thumbnail_url = COALESCE(?, thumbnail_url),
                sort_order = COALESCE(?, sort_order),
                is_active = COALESCE(?, is_active),
                updated_at = NOW()
            WHERE id = ?
        `;

        await pool.query(query, [block_type_id, image_url, thumbnail_url, sort_order, is_active, id]);

        // Возвращаем обновлённый блок
        const [rows] = await pool.query('SELECT * FROM blocks WHERE id = ?', [id]);
        return rows[0];
    }

    /**
     * Удалить блок (мягкое удаление)
     * @param {number} id - ID блока
     * @returns {Promise<boolean>} - Успешность удаления
     */
    async deleteBlock(id) {
        const query = `
            UPDATE blocks
            SET is_active = FALSE, updated_at = NOW()
            WHERE id = ?
        `;

        const [result] = await pool.query(query, [id]);
        return result.affectedRows > 0;
    }

    /**
     * Изменить порядок блока
     * @param {number} id - ID блока
     * @param {number} newOrder - Новый порядок
     * @returns {Promise<Object>} - Обновлённый блок
     */
    async updateBlockOrder(id, newOrder) {
        const query = `
            UPDATE blocks
            SET sort_order = ?, updated_at = NOW()
            WHERE id = ?
        `;

        await pool.query(query, [newOrder, id]);

        const [rows] = await pool.query('SELECT * FROM blocks WHERE id = ?', [id]);
        return rows[0];
    }

    /**
     * Получить все переводы блока
     * @param {number} blockId - ID блока
     * @returns {Promise<Array>} - Массив переводов
     */
    async getBlockTranslations(blockId) {
        const query = `
            SELECT 
                bt.id,
                bt.block_id,
                bt.language,
                bt.content,
                bt.created_at,
                bt.updated_at
            FROM block_translations bt
            WHERE bt.block_id = ?
            ORDER BY bt.language ASC
        `;

        const [rows] = await pool.query(query, [blockId]);
        return rows;
    }

    /**
     * Создать перевод блока
     * @param {number} blockId - ID блока
     * @param {string} language - Код языка
     * @param {string} content - Контент перевода
     * @returns {Promise<Object>} - Созданный перевод
     */
    async createBlockTranslation(blockId, language, content) {
        const query = `
            INSERT INTO block_translations (block_id, language, content)
            VALUES (?, ?, ?)
        `;

        const [result] = await pool.query(query, [blockId, language, content]);

        return {
            id: result.insertId,
            block_id: blockId,
            language,
            content
        };
    }

    /**
     * Обновить перевод блока
     * @param {number} blockId - ID блока
     * @param {string} language - Код языка
     * @param {string} content - Новый контент
     * @returns {Promise<Object>} - Обновлённый перевод
     */
    async updateBlockTranslation(blockId, language, content) {
        const query = `
            UPDATE block_translations
            SET content = ?, updated_at = NOW()
            WHERE block_id = ? AND language = ?
        `;

        const [result] = await pool.query(query, [content, blockId, language]);

        if (result.affectedRows === 0) {
            throw new Error('Translation not found');
        }

        const [rows] = await pool.query(
            'SELECT * FROM block_translations WHERE block_id = ? AND language = ?',
            [blockId, language]
        );

        return rows[0];
    }

    /**
     * Удалить перевод блока
     * @param {number} blockId - ID блока
     * @param {string} language - Код языка
     * @returns {Promise<boolean>} - Успешность удаления
     */
    async deleteBlockTranslation(blockId, language) {
        const query = `
            DELETE FROM block_translations
            WHERE block_id = ? AND language = ?
        `;

        const [result] = await pool.query(query, [blockId, language]);
        return result.affectedRows > 0;
    }

    /**
     * Получить все блоки (включая неактивные) для админки
     * @param {number} pageId - ID страницы (опционально)
     * @returns {Promise<Array>} - Список блоков
     */
    async getAllBlocksForAdmin(pageId = null) {
        let query = `
            SELECT 
                b.id,
                b.page_id,
                b.block_type_id,
                bt.slug as block_type_slug,
                bt.name as block_type_name,
                b.image_url,
                b.thumbnail_url,
                b.sort_order,
                b.is_active,
                b.created_at,
                b.updated_at
            FROM blocks b
            LEFT JOIN block_types bt ON b.block_type_id = bt.id
        `;

        const params = [];

        if (pageId) {
            query += ' WHERE b.page_id = ?';
            params.push(pageId);
        }

        query += ' ORDER BY b.page_id ASC, b.sort_order ASC, b.id ASC';

        const [rows] = await pool.query(query, params);
        return rows;
    }
}

export default new BlocksModel();
