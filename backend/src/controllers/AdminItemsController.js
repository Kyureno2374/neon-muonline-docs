/**
 * Контроллер для управления предметами (админка)
 */

import ItemsModel from '../models/ItemsModel.js';

class AdminItemsController {
    /**
     * Получить все предметы (для админки)
     * GET /api/admin/items?search=X
     */
    async getAllItems(req, res) {
        try {
            const { search } = req.query;
            const items = await ItemsModel.getAllItemsForAdmin({ search });

            res.json({
                success: true,
                data: items,
                count: items.length
            });
        } catch (error) {
            console.error('Error fetching items:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch items',
                message: error.message
            });
        }
    }

    /**
     * Получить предмет по ID
     * GET /api/admin/items/:id
     */
    async getItemById(req, res) {
        try {
            const { id } = req.params;
            const item = await ItemsModel.getItemById(id);

            if (!item) {
                return res.status(404).json({
                    success: false,
                    error: 'Item not found'
                });
            }

            res.json({
                success: true,
                data: item
            });
        } catch (error) {
            console.error('Error fetching item:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch item',
                message: error.message
            });
        }
    }

    /**
     * Создать новый предмет
     * POST /api/admin/items
     */
    async createItem(req, res) {
        try {
            const { slug, image_url, thumbnail_url } = req.body;

            // Валидация
            if (!slug) {
                return res.status(400).json({
                    success: false,
                    error: 'slug is required'
                });
            }

            const newItem = await ItemsModel.createItem({
                slug,
                image_url,
                thumbnail_url
            });

            res.status(201).json({
                success: true,
                message: 'Item created successfully',
                data: newItem
            });
        } catch (error) {
            console.error('Error creating item:', error);

            if (error.message.includes('already exists')) {
                return res.status(409).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to create item',
                message: error.message
            });
        }
    }

    /**
     * Обновить предмет
     * PUT /api/admin/items/:id
     */
    async updateItem(req, res) {
        try {
            const { id } = req.params;
            const { slug, image_url, thumbnail_url, is_active } = req.body;

            const updatedItem = await ItemsModel.updateItem(id, {
                slug,
                image_url,
                thumbnail_url,
                is_active
            });

            if (!updatedItem) {
                return res.status(404).json({
                    success: false,
                    error: 'Item not found'
                });
            }

            res.json({
                success: true,
                message: 'Item updated successfully',
                data: updatedItem
            });
        } catch (error) {
            console.error('Error updating item:', error);

            if (error.message.includes('already exists')) {
                return res.status(409).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to update item',
                message: error.message
            });
        }
    }

    /**
     * Удалить предмет
     * DELETE /api/admin/items/:id
     */
    async deleteItem(req, res) {
        try {
            const { id } = req.params;

            const deleted = await ItemsModel.deleteItem(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Item not found'
                });
            }

            res.json({
                success: true,
                message: 'Item deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting item:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete item',
                message: error.message
            });
        }
    }

    /**
     * Получить все переводы предмета
     * GET /api/admin/items/:id/translations
     */
    async getItemTranslations(req, res) {
        try {
            const { id } = req.params;

            const translations = await ItemsModel.getItemTranslations(id);

            res.json({
                success: true,
                data: translations,
                count: translations.length
            });
        } catch (error) {
            console.error('Error fetching item translations:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch item translations',
                message: error.message
            });
        }
    }

    /**
     * Создать перевод предмета
     * POST /api/admin/items/:id/translations
     */
    async createItemTranslation(req, res) {
        try {
            const { id } = req.params;
            const { language, name, description } = req.body;

            if (!language || !name) {
                return res.status(400).json({
                    success: false,
                    error: 'language and name are required'
                });
            }

            const translation = await ItemsModel.createItemTranslation(
                id,
                language,
                name,
                description || ''
            );

            res.status(201).json({
                success: true,
                message: 'Item translation created successfully',
                data: translation
            });
        } catch (error) {
            console.error('Error creating item translation:', error);
            
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    success: false,
                    error: 'Translation already exists for this language'
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to create item translation',
                message: error.message
            });
        }
    }

    /**
     * Обновить перевод предмета
     * PUT /api/admin/items/:id/translations/:lang
     */
    async updateItemTranslation(req, res) {
        try {
            const { id, lang } = req.params;
            const { name, description } = req.body;

            const translation = await ItemsModel.updateItemTranslation(
                id,
                lang,
                name,
                description
            );

            res.json({
                success: true,
                message: 'Item translation updated successfully',
                data: translation
            });
        } catch (error) {
            console.error('Error updating item translation:', error);

            if (error.message === 'Translation not found') {
                return res.status(404).json({
                    success: false,
                    error: 'Translation not found'
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to update item translation',
                message: error.message
            });
        }
    }

    /**
     * Удалить перевод предмета
     * DELETE /api/admin/items/:id/translations/:lang
     */
    async deleteItemTranslation(req, res) {
        try {
            const { id, lang } = req.params;

            const deleted = await ItemsModel.deleteItemTranslation(id, lang);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Translation not found'
                });
            }

            res.json({
                success: true,
                message: 'Item translation deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting item translation:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete item translation',
                message: error.message
            });
        }
    }
}

export default new AdminItemsController();

