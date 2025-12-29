/**
 * Контроллер для управления блоками (админка)
 */

import BlocksModel from '../models/BlocksModel.js';

class AdminBlocksController {
    /**
     * Получить все блоки (для админки)
     * GET /api/admin/blocks?page_id=X&lang=ru
     */
    async getAllBlocks(req, res) {
        try {
            const { page_id, lang = 'ru' } = req.query;
            
            if (!page_id) {
                return res.status(400).json({
                    success: false,
                    error: 'page_id is required'
                });
            }

            const blocks = await BlocksModel.getBlocksByPageId(page_id, lang);

            res.json({
                success: true,
                data: blocks,
                count: blocks.length
            });
        } catch (error) {
            console.error('Error fetching blocks:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch blocks',
                message: error.message
            });
        }
    }

    /**
     * Получить блок по ID
     * GET /api/admin/blocks/:id
     */
    async getBlockById(req, res) {
        try {
            const { id } = req.params;
            const block = await BlocksModel.getBlockById(id);

            if (!block) {
                return res.status(404).json({
                    success: false,
                    error: 'Block not found'
                });
            }

            res.json({
                success: true,
                data: block
            });
        } catch (error) {
            console.error('Error fetching block:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch block',
                message: error.message
            });
        }
    }

    /**
     * Создать новый блок
     * POST /api/admin/blocks
     */
    async createBlock(req, res) {
        try {
            const { page_id, block_type_id, image_url, thumbnail_url, sort_order } = req.body;

            // Валидация
            if (!page_id || !block_type_id) {
                return res.status(400).json({
                    success: false,
                    error: 'page_id and block_type_id are required'
                });
            }

            const newBlock = await BlocksModel.createBlock({
                page_id,
                block_type_id,
                image_url,
                thumbnail_url,
                sort_order: sort_order || 0
            });

            res.status(201).json({
                success: true,
                message: 'Block created successfully',
                data: newBlock
            });
        } catch (error) {
            console.error('Error creating block:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create block',
                message: error.message
            });
        }
    }

    /**
     * Обновить блок
     * PUT /api/admin/blocks/:id
     */
    async updateBlock(req, res) {
        try {
            const { id } = req.params;
            const { block_type_id, image_url, thumbnail_url, sort_order, is_active } = req.body;

            const updatedBlock = await BlocksModel.updateBlock(id, {
                block_type_id,
                image_url,
                thumbnail_url,
                sort_order,
                is_active
            });

            if (!updatedBlock) {
                return res.status(404).json({
                    success: false,
                    error: 'Block not found'
                });
            }

            res.json({
                success: true,
                message: 'Block updated successfully',
                data: updatedBlock
            });
        } catch (error) {
            console.error('Error updating block:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update block',
                message: error.message
            });
        }
    }

    /**
     * Удалить блок
     * DELETE /api/admin/blocks/:id
     */
    async deleteBlock(req, res) {
        try {
            const { id } = req.params;

            const deleted = await BlocksModel.deleteBlock(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Block not found'
                });
            }

            res.json({
                success: true,
                message: 'Block deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting block:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete block',
                message: error.message
            });
        }
    }

    /**
     * Изменить порядок блока
     * PUT /api/admin/blocks/:id/order
     */
    async updateBlockOrder(req, res) {
        try {
            const { id } = req.params;
            const { sort_order } = req.body;

            if (sort_order === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'sort_order is required'
                });
            }

            const updatedBlock = await BlocksModel.updateBlockOrder(id, sort_order);

            if (!updatedBlock) {
                return res.status(404).json({
                    success: false,
                    error: 'Block not found'
                });
            }

            res.json({
                success: true,
                message: 'Block order updated successfully',
                data: updatedBlock
            });
        } catch (error) {
            console.error('Error updating block order:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update block order',
                message: error.message
            });
        }
    }

    /**
     * Получить все переводы блока
     * GET /api/admin/blocks/:id/translations
     */
    async getBlockTranslations(req, res) {
        try {
            const { id } = req.params;

            const translations = await BlocksModel.getBlockTranslations(id);

            res.json({
                success: true,
                data: translations,
                count: translations.length
            });
        } catch (error) {
            console.error('Error fetching block translations:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch block translations',
                message: error.message
            });
        }
    }

    /**
     * Создать перевод блока
     * POST /api/admin/blocks/:id/translations
     */
    async createBlockTranslation(req, res) {
        try {
            const { id } = req.params;
            const { language, content } = req.body;

            if (!language || !content) {
                return res.status(400).json({
                    success: false,
                    error: 'language and content are required'
                });
            }

            const translation = await BlocksModel.createBlockTranslation(id, language, content);

            res.status(201).json({
                success: true,
                message: 'Block translation created successfully',
                data: translation
            });
        } catch (error) {
            console.error('Error creating block translation:', error);
            
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    success: false,
                    error: 'Translation already exists for this language'
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to create block translation',
                message: error.message
            });
        }
    }

    /**
     * Обновить перевод блока
     * PUT /api/admin/blocks/:id/translations/:lang
     */
    async updateBlockTranslation(req, res) {
        try {
            const { id, lang } = req.params;
            const { content } = req.body;

            // Проверяем наличие поля content (может быть пустой строкой)
            if (content === undefined || content === null) {
                return res.status(400).json({
                    success: false,
                    error: 'content field is required (can be empty string)'
                });
            }

            const translation = await BlocksModel.updateBlockTranslation(id, lang, content);

            res.json({
                success: true,
                message: 'Block translation updated successfully',
                data: translation
            });
        } catch (error) {
            console.error('Error updating block translation:', error);

            if (error.message === 'Translation not found') {
                return res.status(404).json({
                    success: false,
                    error: 'Translation not found'
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to update block translation',
                message: error.message
            });
        }
    }

    /**
     * Удалить перевод блока
     * DELETE /api/admin/blocks/:id/translations/:lang
     */
    async deleteBlockTranslation(req, res) {
        try {
            const { id, lang } = req.params;

            const deleted = await BlocksModel.deleteBlockTranslation(id, lang);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Translation not found'
                });
            }

            res.json({
                success: true,
                message: 'Block translation deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting block translation:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete block translation',
                message: error.message
            });
        }
    }
}

export default new AdminBlocksController();

