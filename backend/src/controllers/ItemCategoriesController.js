/**
 * Контроллер для работы с категориями предметов
 */

import ItemCategoriesModel from '../models/ItemCategoriesModel.js';

class ItemCategoriesController {
    /**
     * GET /api/admin/item-categories
     * Получить все категории
     */
    async getAllCategories(req, res, next) {
        try {
            const lang = req.query.lang || 'ru';
            
            const categories = await ItemCategoriesModel.getAllCategories(lang);
            
            res.json({
                success: true,
                data: categories,
                count: categories.length
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/admin/item-categories/:id
     * Получить категорию по ID
     */
    async getCategoryById(req, res, next) {
        try {
            const { id } = req.params;
            const lang = req.query.lang || 'ru';
            
            const category = await ItemCategoriesModel.getCategoryById(id, lang);
            
            if (!category) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Category not found',
                        code: 'NOT_FOUND'
                    }
                });
            }
            
            res.json({
                success: true,
                data: category
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/admin/item-categories
     * Создать новую категорию
     */
    async createCategory(req, res, next) {
        try {
            const { slug, sort_order = 0 } = req.body;
            
            if (!slug) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Slug is required',
                        code: 'VALIDATION_ERROR'
                    }
                });
            }
            
            const categoryId = await ItemCategoriesModel.createCategory({
                slug,
                sort_order
            });
            
            const category = await ItemCategoriesModel.getCategoryById(categoryId);
            
            res.status(201).json({
                success: true,
                data: category,
                message: 'Category created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/admin/item-categories/:id
     * Обновить категорию
     */
    async updateCategory(req, res, next) {
        try {
            const { id } = req.params;
            const { slug, sort_order } = req.body;
            
            const updated = await ItemCategoriesModel.updateCategory(id, {
                slug,
                sort_order
            });
            
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Category not found',
                        code: 'NOT_FOUND'
                    }
                });
            }
            
            const category = await ItemCategoriesModel.getCategoryById(id);
            
            res.json({
                success: true,
                data: category,
                message: 'Category updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/admin/item-categories/:id
     * Удалить категорию
     */
    async deleteCategory(req, res, next) {
        try {
            const { id } = req.params;
            
            const deleted = await ItemCategoriesModel.deleteCategory(id);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Category not found',
                        code: 'NOT_FOUND'
                    }
                });
            }
            
            res.json({
                success: true,
                message: 'Category deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/admin/item-categories/:id/translations
     * Получить все переводы категории
     */
    async getCategoryTranslations(req, res, next) {
        try {
            const { id } = req.params;
            
            const translations = await ItemCategoriesModel.getCategoryTranslations(id);
            
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
     * POST /api/admin/item-categories/:id/translations
     * Создать перевод категории
     */
    async createCategoryTranslation(req, res, next) {
        try {
            const { id } = req.params;
            const { language, name } = req.body;
            
            if (!language || !name) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Language and name are required',
                        code: 'VALIDATION_ERROR'
                    }
                });
            }
            
            await ItemCategoriesModel.createCategoryTranslation(id, language, { name });
            
            const category = await ItemCategoriesModel.getCategoryById(id, language);
            
            res.status(201).json({
                success: true,
                data: category,
                message: 'Translation created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/admin/item-categories/:id/translations/:lang
     * Обновить перевод категории
     */
    async updateCategoryTranslation(req, res, next) {
        try {
            const { id, lang } = req.params;
            const { name } = req.body;
            
            if (!name) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Name is required',
                        code: 'VALIDATION_ERROR'
                    }
                });
            }
            
            const updated = await ItemCategoriesModel.updateCategoryTranslation(id, lang, { name });
            
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Translation not found',
                        code: 'NOT_FOUND'
                    }
                });
            }
            
            const category = await ItemCategoriesModel.getCategoryById(id, lang);
            
            res.json({
                success: true,
                data: category,
                message: 'Translation updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ItemCategoriesController();
