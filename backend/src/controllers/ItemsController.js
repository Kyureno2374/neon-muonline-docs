/**
 * Контроллер для работы с предметами
 */

import ItemsModel from '../models/ItemsModel.js';

class ItemsController {
    /**
     * GET /api/items
     * Получить список предметов с пагинацией и фильтрацией
     */
    async getAllItems(req, res, next) {
        try {
            const lang = req.query.lang || 'ru';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            const search = req.query.search || '';

            // Валидация параметров
            if (page < 1) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Page number must be greater than 0',
                        code: 'INVALID_PAGE'
                    }
                });
            }

            if (limit < 1 || limit > 100) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Limit must be between 1 and 100',
                        code: 'INVALID_LIMIT'
                    }
                });
            }

            const result = await ItemsModel.getAllItems({
                lang,
                page,
                limit,
                search
            });
            
            res.json({
                success: true,
                data: result.items,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/items/search
     * Поиск предметов (алиас для getAllItems с параметром search)
     */
    async searchItems(req, res, next) {
        try {
            const lang = req.query.lang || 'ru';
            const search = req.query.q || req.query.search || '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;

            if (!search) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Search query is required (use ?q=... or ?search=...)',
                        code: 'SEARCH_QUERY_REQUIRED'
                    }
                });
            }

            const result = await ItemsModel.getAllItems({
                lang,
                page,
                limit,
                search
            });
            
            res.json({
                success: true,
                query: search,
                data: result.items,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/items/:slug
     * Получить один предмет по slug
     */
    async getItemBySlug(req, res, next) {
        try {
            const { slug } = req.params;
            const lang = req.query.lang || 'ru';
            
            const item = await ItemsModel.getItemBySlug(slug, lang);
            
            if (!item) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: `Item with slug "${slug}" not found`,
                        code: 'ITEM_NOT_FOUND'
                    }
                });
            }
            
            res.json({
                success: true,
                data: item
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ItemsController();

