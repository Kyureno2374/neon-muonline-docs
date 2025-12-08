/**
 * Контроллер для администрирования страниц
 * Управление страницами через админ-панель
 */

import PagesModel from '../models/PagesModel.js';

class AdminPagesController {
    /**
     * POST /api/admin/pages
     * Создать новую страницу
     */
    async createPage(req, res, next) {
        try {
            const { slug, icon, sort_order } = req.body;

            // Валидация обязательных полей
            if (!slug || !icon) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Missing required fields: slug, icon',
                        code: 'VALIDATION_ERROR'
                    }
                });
            }

            // Проверка уникальности slug
            const exists = await PagesModel.existsBySlug(slug);
            if (exists) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: `Page with slug "${slug}" already exists`,
                        code: 'DUPLICATE_SLUG'
                    }
                });
            }

            // Создание страницы
            const page = await PagesModel.createPage({ slug, icon, sort_order });

            res.status(201).json({
                success: true,
                data: page,
                message: 'Page created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/admin/pages/:id
     * Обновить страницу
     */
    async updatePage(req, res, next) {
        try {
            const { id } = req.params;
            const { slug, icon, sort_order, is_active } = req.body;

            // Проверка существования страницы
            const existingPage = await PagesModel.getPageById(parseInt(id));
            if (!existingPage) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: `Page with ID ${id} not found`,
                        code: 'PAGE_NOT_FOUND'
                    }
                });
            }

            // Проверка уникальности slug при изменении
            if (slug && slug !== existingPage.slug) {
                const exists = await PagesModel.existsBySlug(slug);
                if (exists) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            message: `Page with slug "${slug}" already exists`,
                            code: 'DUPLICATE_SLUG'
                        }
                    });
                }
            }

            // Обновление страницы
            const updatedPage = await PagesModel.updatePage(parseInt(id), {
                slug,
                icon,
                sort_order,
                is_active
            });

            res.json({
                success: true,
                data: updatedPage,
                message: 'Page updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/admin/pages/:id
     * Удалить страницу (мягкое удаление)
     */
    async deletePage(req, res, next) {
        try {
            const { id } = req.params;

            // Проверка существования страницы
            const existingPage = await PagesModel.getPageById(parseInt(id));
            if (!existingPage) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: `Page with ID ${id} not found`,
                        code: 'PAGE_NOT_FOUND'
                    }
                });
            }

            // Удаление страницы
            const deleted = await PagesModel.deletePage(parseInt(id));

            if (deleted) {
                res.json({
                    success: true,
                    message: 'Page deleted successfully'
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: {
                        message: 'Failed to delete page',
                        code: 'DELETE_FAILED'
                    }
                });
            }
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/admin/pages/:id/translations
     * Получить все переводы страницы
     */
    async getPageTranslations(req, res, next) {
        try {
            const { id } = req.params;

            // Проверка существования страницы
            const existingPage = await PagesModel.getPageById(parseInt(id));
            if (!existingPage) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: `Page with ID ${id} not found`,
                        code: 'PAGE_NOT_FOUND'
                    }
                });
            }

            const translations = await PagesModel.getPageTranslations(parseInt(id));

            res.json({
                success: true,
                data: translations,
                count: translations.length
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/admin/pages/:id/translations
     * Создать перевод страницы
     */
    async createPageTranslation(req, res, next) {
        try {
            const { id } = req.params;
            const { language, name } = req.body;

            // Валидация обязательных полей
            if (!language || !name) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Missing required fields: language, name',
                        code: 'VALIDATION_ERROR'
                    }
                });
            }

            // Проверка существования страницы
            const existingPage = await PagesModel.getPageById(parseInt(id));
            if (!existingPage) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: `Page with ID ${id} not found`,
                        code: 'PAGE_NOT_FOUND'
                    }
                });
            }

            // Создание перевода
            const translation = await PagesModel.createPageTranslation(
                parseInt(id),
                language,
                name
            );

            res.status(201).json({
                success: true,
                data: translation,
                message: 'Translation created successfully'
            });
        } catch (error) {
            // Обработка конфликта (перевод уже существует)
            if (error.code === '23505') {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: `Translation for language "${req.body.language}" already exists`,
                        code: 'DUPLICATE_TRANSLATION'
                    }
                });
            }
            next(error);
        }
    }

    /**
     * PUT /api/admin/pages/:id/translations/:lang
     * Обновить перевод страницы
     */
    async updatePageTranslation(req, res, next) {
        try {
            const { id, lang } = req.params;
            const { name } = req.body;

            // Валидация обязательных полей
            if (!name) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Missing required field: name',
                        code: 'VALIDATION_ERROR'
                    }
                });
            }

            // Проверка существования страницы
            const existingPage = await PagesModel.getPageById(parseInt(id));
            if (!existingPage) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: `Page with ID ${id} not found`,
                        code: 'PAGE_NOT_FOUND'
                    }
                });
            }

            // Обновление перевода
            const translation = await PagesModel.updatePageTranslation(
                parseInt(id),
                lang,
                name
            );

            if (!translation) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: `Translation for language "${lang}" not found`,
                        code: 'TRANSLATION_NOT_FOUND'
                    }
                });
            }

            res.json({
                success: true,
                data: translation,
                message: 'Translation updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/admin/pages/:id/translations/:lang
     * Удалить перевод страницы
     */
    async deletePageTranslation(req, res, next) {
        try {
            const { id, lang } = req.params;

            // Проверка существования страницы
            const existingPage = await PagesModel.getPageById(parseInt(id));
            if (!existingPage) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: `Page with ID ${id} not found`,
                        code: 'PAGE_NOT_FOUND'
                    }
                });
            }

            // Удаление перевода
            const deleted = await PagesModel.deletePageTranslation(parseInt(id), lang);

            if (deleted) {
                res.json({
                    success: true,
                    message: 'Translation deleted successfully'
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: {
                        message: `Translation for language "${lang}" not found`,
                        code: 'TRANSLATION_NOT_FOUND'
                    }
                });
            }
        } catch (error) {
            next(error);
        }
    }
}

export default new AdminPagesController();

