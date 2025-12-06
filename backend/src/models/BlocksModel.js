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
            LEFT JOIN block_translations btrans ON b.id = btrans.block_id AND btrans.language = $1
            WHERE b.page_id = $2 AND b.is_active = TRUE
            ORDER BY b.sort_order ASC, b.id ASC
        `;
        
        const result = await pool.query(query, [lang, pageId]);
        return result.rows;
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
            LEFT JOIN block_translations btrans ON b.id = btrans.block_id AND btrans.language = $1
            WHERE p.slug = $2 AND b.is_active = TRUE AND p.is_active = TRUE
            ORDER BY b.sort_order ASC, b.id ASC
        `;
        
        const result = await pool.query(query, [lang, pageSlug]);
        return result.rows;
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
            LEFT JOIN block_translations btrans ON b.id = btrans.block_id AND btrans.language = $1
            WHERE b.id = $2 AND b.is_active = TRUE
        `;
        
        const result = await pool.query(query, [lang, id]);
        return result.rows[0] || null;
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
        
        const result = await pool.query(query);
        return result.rows;
    }
}

export default new BlocksModel();

