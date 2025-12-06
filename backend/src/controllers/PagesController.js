/**
 * Контроллер для работы со страницами
 */

import PagesModel from '../models/PagesModel.js';
import BlocksModel from '../models/BlocksModel.js';

class PagesController {
    /**
     * GET /api/pages
     * Получить список всех страниц
     */
    async getAllPages(req, res, next) {
        try {
            const lang = req.query.lang || 'ru';
            
            const pages = await PagesModel.getAllPages(lang);
            
            res.json({
                success: true,
                data: pages,
                count: pages.length
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/pages/:slug
     * Получить страницу по slug со всеми блоками
     */
    async getPageBySlug(req, res, next) {
        try {
            const { slug } = req.params;
            const lang = req.query.lang || 'ru';
            
            // Получение страницы
            const page = await PagesModel.getPageBySlug(slug, lang);
            
            if (!page) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: `Page with slug "${slug}" not found`,
                        code: 'PAGE_NOT_FOUND'
                    }
                });
            }

            // Получение блоков страницы
            const blocks = await BlocksModel.getBlocksByPageId(page.id, lang);
            
            res.json({
                success: true,
                data: {
                    ...page,
                    blocks
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/pages/:slug/blocks
     * Получить только блоки страницы (без данных самой страницы)
     */
    async getPageBlocks(req, res, next) {
        try {
            const { slug } = req.params;
            const lang = req.query.lang || 'ru';
            
            // Проверка существования страницы
            const pageExists = await PagesModel.existsBySlug(slug);
            
            if (!pageExists) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: `Page with slug "${slug}" not found`,
                        code: 'PAGE_NOT_FOUND'
                    }
                });
            }

            // Получение блоков
            const blocks = await BlocksModel.getBlocksByPageSlug(slug, lang);
            
            res.json({
                success: true,
                data: blocks,
                count: blocks.length
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new PagesController();

