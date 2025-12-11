/**
 * Модель для работы с таблицей languages
 * Управление языками системы
 */

import pool from '../config/database.js';

class LanguagesModel {
    /**
     * Получить все языки
     * @returns {Promise<Array>} - Список всех языков
     */
    async getAllLanguages() {
        const query = `
            SELECT 
                code,
                name_native,
                name_en,
                flag_emoji,
                is_active,
                display_order,
                created_at,
                updated_at
            FROM languages
            ORDER BY display_order ASC, name_en ASC
        `;

        const [rows] = await pool.query(query);
        return rows;
    }

    /**
     * Получить только активные языки
     * @returns {Promise<Array>} - Список активных языков
     */
    async getActiveLanguages() {
        const query = `
            SELECT 
                code,
                name_native,
                name_en,
                flag_emoji,
                is_active,
                display_order,
                created_at,
                updated_at
            FROM languages
            WHERE is_active = TRUE
            ORDER BY display_order ASC, name_en ASC
        `;

        const [rows] = await pool.query(query);
        return rows;
    }

    /**
     * Получить язык по коду
     * @param {string} code - Код языка (ru, en)
     * @returns {Promise<Object|null>} - Данные языка или null
     */
    async getLanguageByCode(code) {
        const query = `
            SELECT 
                code,
                name_native,
                name_en,
                flag_emoji,
                is_active,
                display_order,
                created_at,
                updated_at
            FROM languages
            WHERE code = ?
        `;

        const [rows] = await pool.query(query, [code]);
        return rows[0] || null;
    }

    /**
     * Проверить существование языка
     * @param {string} code - Код языка
     * @returns {Promise<boolean>} - true если язык существует
     */
    async existsByCode(code) {
        const query = 'SELECT EXISTS(SELECT 1 FROM languages WHERE code = ?) as `exists`';
        const [rows] = await pool.query(query, [code]);
        return !!rows[0].exists;
    }

    /**
     * Создать новый язык
     * @param {Object} languageData - Данные языка
     * @returns {Promise<Object>} - Созданный язык
     */
    async createLanguage(languageData) {
        const { code, name_native, name_en, flag_emoji = '🌐', display_order = 0 } = languageData;

        // Проверка уникальности кода
        const exists = await this.existsByCode(code);
        if (exists) {
            throw new Error(`Language with code "${code}" already exists`);
        }

        // Валидация кода языка (ISO 639-1: 2 буквы)
        if (!/^[a-z]{2}$/.test(code)) {
            throw new Error('Language code must be 2 lowercase letters (ISO 639-1)');
        }

        const query = `
            INSERT INTO languages (code, name_native, name_en, flag_emoji, is_active, display_order)
            VALUES (?, ?, ?, ?, TRUE, ?)
        `;

        await pool.query(query, [code, name_native, name_en, flag_emoji, display_order]);

        return {
            code,
            name_native,
            name_en,
            flag_emoji,
            is_active: true,
            display_order
        };
    }

    /**
     * Обновить язык
     * @param {string} code - Код языка
     * @param {Object} languageData - Новые данные
     * @returns {Promise<Object>} - Обновлённый язык
     */
    async updateLanguage(code, languageData) {
        const { name_native, name_en, flag_emoji, display_order } = languageData;

        const query = `
            UPDATE languages
            SET 
                name_native = COALESCE(?, name_native),
                name_en = COALESCE(?, name_en),
                flag_emoji = COALESCE(?, flag_emoji),
                display_order = COALESCE(?, display_order),
                updated_at = NOW()
            WHERE code = ?
        `;

        const [result] = await pool.query(query, [name_native, name_en, flag_emoji, display_order, code]);

        if (result.affectedRows === 0) {
            throw new Error('Language not found');
        }

        return await this.getLanguageByCode(code);
    }

    /**
     * Активировать/деактивировать язык
     * @param {string} code - Код языка
     * @param {boolean} isActive - Новое состояние
     * @returns {Promise<Object>} - Обновлённый язык
     */
    async toggleLanguage(code, isActive) {
        // Проверяем, что это не последний активный язык
        if (!isActive) {
            const [activeCount] = await pool.query(
                'SELECT COUNT(*) as count FROM languages WHERE is_active = TRUE'
            );

            if (activeCount[0].count <= 1) {
                throw new Error('Cannot deactivate the last active language');
            }
        }

        const query = `
            UPDATE languages
            SET is_active = ?, updated_at = NOW()
            WHERE code = ?
        `;

        const [result] = await pool.query(query, [isActive, code]);

        if (result.affectedRows === 0) {
            throw new Error('Language not found');
        }

        return await this.getLanguageByCode(code);
    }

    /**
     * Удалить язык
     * @param {string} code - Код языка
     * @returns {Promise<boolean>} - Успешность удаления
     */
    async deleteLanguage(code) {
        // Проверяем наличие переводов
        const [pageTranslations] = await pool.query(
            'SELECT COUNT(*) as count FROM page_translations WHERE language = ?',
            [code]
        );

        const [blockTranslations] = await pool.query(
            'SELECT COUNT(*) as count FROM block_translations WHERE language = ?',
            [code]
        );

        const [itemTranslations] = await pool.query(
            'SELECT COUNT(*) as count FROM item_translations WHERE language = ?',
            [code]
        );

        const totalTranslations = 
            pageTranslations[0].count + 
            blockTranslations[0].count + 
            itemTranslations[0].count;

        if (totalTranslations > 0) {
            throw new Error(
                `Cannot delete language "${code}": it has ${totalTranslations} translations. ` +
                `Delete translations first or deactivate the language instead.`
            );
        }

        // Проверяем, что это не последний язык
        const [languageCount] = await pool.query('SELECT COUNT(*) as count FROM languages');
        if (languageCount[0].count <= 1) {
            throw new Error('Cannot delete the last language');
        }

        const query = 'DELETE FROM languages WHERE code = ?';
        const [result] = await pool.query(query, [code]);

        return result.affectedRows > 0;
    }

    /**
     * Получить статистику по языку
     * @param {string} code - Код языка
     * @returns {Promise<Object>} - Статистика переводов
     */
    async getLanguageStats(code) {
        const [pageTranslations] = await pool.query(
            'SELECT COUNT(*) as count FROM page_translations WHERE language = ?',
            [code]
        );

        const [blockTranslations] = await pool.query(
            'SELECT COUNT(*) as count FROM block_translations WHERE language = ?',
            [code]
        );

        const [itemTranslations] = await pool.query(
            'SELECT COUNT(*) as count FROM item_translations WHERE language = ?',
            [code]
        );

        return {
            code,
            page_translations: pageTranslations[0].count,
            block_translations: blockTranslations[0].count,
            item_translations: itemTranslations[0].count,
            total_translations: 
                pageTranslations[0].count + 
                blockTranslations[0].count + 
                itemTranslations[0].count
        };
    }
}

export default new LanguagesModel();

