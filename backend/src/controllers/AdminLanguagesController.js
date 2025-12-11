/**
 * Контроллер для управления языками (админка)
 */

import LanguagesModel from '../models/LanguagesModel.js';

class AdminLanguagesController {
    /**
     * Получить все языки
     * GET /api/admin/languages
     */
    async getAllLanguages(req, res) {
        try {
            const languages = await LanguagesModel.getAllLanguages();

            res.json({
                success: true,
                data: languages,
                count: languages.length
            });
        } catch (error) {
            console.error('Error fetching languages:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch languages',
                message: error.message
            });
        }
    }

    /**
     * Получить активные языки
     * GET /api/admin/languages/active
     */
    async getActiveLanguages(req, res) {
        try {
            const languages = await LanguagesModel.getActiveLanguages();

            res.json({
                success: true,
                data: languages,
                count: languages.length
            });
        } catch (error) {
            console.error('Error fetching active languages:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch active languages',
                message: error.message
            });
        }
    }

    /**
     * Получить язык по коду
     * GET /api/admin/languages/:code
     */
    async getLanguageByCode(req, res) {
        try {
            const { code } = req.params;
            const language = await LanguagesModel.getLanguageByCode(code);

            if (!language) {
                return res.status(404).json({
                    success: false,
                    error: 'Language not found'
                });
            }

            res.json({
                success: true,
                data: language
            });
        } catch (error) {
            console.error('Error fetching language:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch language',
                message: error.message
            });
        }
    }

    /**
     * Получить статистику по языку
     * GET /api/admin/languages/:code/stats
     */
    async getLanguageStats(req, res) {
        try {
            const { code } = req.params;

            // Проверяем существование языка
            const language = await LanguagesModel.getLanguageByCode(code);
            if (!language) {
                return res.status(404).json({
                    success: false,
                    error: 'Language not found'
                });
            }

            const stats = await LanguagesModel.getLanguageStats(code);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error fetching language stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch language stats',
                message: error.message
            });
        }
    }

    /**
     * Создать новый язык
     * POST /api/admin/languages
     */
    async createLanguage(req, res) {
        try {
            const { code, name_native, name_en, flag_emoji, display_order } = req.body;

            // Валидация
            if (!code || !name_native || !name_en) {
                return res.status(400).json({
                    success: false,
                    error: 'code, name_native, and name_en are required'
                });
            }

            const newLanguage = await LanguagesModel.createLanguage({
                code: code.toLowerCase(),
                name_native,
                name_en,
                flag_emoji,
                display_order
            });

            res.status(201).json({
                success: true,
                message: 'Language created successfully',
                data: newLanguage
            });
        } catch (error) {
            console.error('Error creating language:', error);

            if (error.message.includes('already exists')) {
                return res.status(409).json({
                    success: false,
                    error: error.message
                });
            }

            if (error.message.includes('must be 2 lowercase letters')) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to create language',
                message: error.message
            });
        }
    }

    /**
     * Обновить язык
     * PUT /api/admin/languages/:code
     */
    async updateLanguage(req, res) {
        try {
            const { code } = req.params;
            const { name_native, name_en, flag_emoji, display_order } = req.body;

            const updatedLanguage = await LanguagesModel.updateLanguage(code, {
                name_native,
                name_en,
                flag_emoji,
                display_order
            });

            res.json({
                success: true,
                message: 'Language updated successfully',
                data: updatedLanguage
            });
        } catch (error) {
            console.error('Error updating language:', error);

            if (error.message === 'Language not found') {
                return res.status(404).json({
                    success: false,
                    error: 'Language not found'
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to update language',
                message: error.message
            });
        }
    }

    /**
     * Активировать/деактивировать язык
     * PUT /api/admin/languages/:code/toggle
     */
    async toggleLanguage(req, res) {
        try {
            const { code } = req.params;
            const { is_active } = req.body;

            if (is_active === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'is_active is required'
                });
            }

            const updatedLanguage = await LanguagesModel.toggleLanguage(code, is_active);

            res.json({
                success: true,
                message: `Language ${is_active ? 'activated' : 'deactivated'} successfully`,
                data: updatedLanguage
            });
        } catch (error) {
            console.error('Error toggling language:', error);

            if (error.message === 'Language not found') {
                return res.status(404).json({
                    success: false,
                    error: 'Language not found'
                });
            }

            if (error.message.includes('Cannot deactivate the last active language')) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to toggle language',
                message: error.message
            });
        }
    }

    /**
     * Удалить язык
     * DELETE /api/admin/languages/:code
     */
    async deleteLanguage(req, res) {
        try {
            const { code } = req.params;

            const deleted = await LanguagesModel.deleteLanguage(code);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Language not found'
                });
            }

            res.json({
                success: true,
                message: 'Language deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting language:', error);

            if (error.message.includes('Cannot delete language')) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            if (error.message.includes('Cannot delete the last language')) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to delete language',
                message: error.message
            });
        }
    }
}

export default new AdminLanguagesController();

