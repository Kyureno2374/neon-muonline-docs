/**
 * Контроллер для загрузки изображений
 */

import { deleteUploadFile, getFilenameFromUrl } from '../middleware/uploadMiddleware.js';
import { createItemThumbnail, createBlockThumbnail, optimizeImage, getImageInfo } from '../utils/imageProcessor.js';

class UploadController {
    /**
     * Загрузить изображение
     * POST /api/admin/upload/image
     */
    async uploadImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded'
                });
            }

            const { type = 'general' } = req.body; // item, block, general
            const filename = req.file.filename;

            // Получаем URL файла
            const imageUrl = `/uploads/${filename}`;
            let thumbnailUrl = null;

            try {
                // Оптимизируем оригинальное изображение
                await optimizeImage(filename);

                // Создаём миниатюру в зависимости от типа
                if (type === 'item') {
                    const thumbnailName = await createItemThumbnail(filename);
                    thumbnailUrl = `/uploads/${thumbnailName}`;
                } else if (type === 'block') {
                    const thumbnailName = await createBlockThumbnail(filename);
                    thumbnailUrl = `/uploads/${thumbnailName}`;
                }

                // Получаем информацию об изображении
                const imageInfo = await getImageInfo(filename);

                res.status(201).json({
                    success: true,
                    message: 'Image uploaded successfully',
                    data: {
                        url: imageUrl,
                        thumbnail_url: thumbnailUrl,
                        filename: filename,
                        type: type,
                        info: imageInfo
                    }
                });
            } catch (processingError) {
                // Если обработка не удалась, всё равно возвращаем URL
                console.error('Image processing error:', processingError);
                
                res.status(201).json({
                    success: true,
                    message: 'Image uploaded but processing failed',
                    data: {
                        url: imageUrl,
                        thumbnail_url: null,
                        filename: filename,
                        type: type,
                        warning: processingError.message
                    }
                });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            
            // Удаляем файл если что-то пошло не так
            if (req.file) {
                deleteUploadFile(req.file.filename);
            }

            res.status(500).json({
                success: false,
                error: 'Failed to upload image',
                message: error.message
            });
        }
    }

    /**
     * Удалить изображение
     * DELETE /api/admin/upload/image
     */
    async deleteImage(req, res) {
        try {
            const { url } = req.body;

            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'Image URL is required'
                });
            }

            const filename = getFilenameFromUrl(url);

            if (!filename) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid image URL'
                });
            }

            // Удаляем основной файл
            const deleted = deleteUploadFile(filename);

            // Пытаемся удалить миниатюру (если есть)
            const ext = filename.substring(filename.lastIndexOf('.'));
            const basename = filename.substring(0, filename.lastIndexOf('.'));
            const thumbnailName = `${basename}_thumb${ext}`;
            deleteUploadFile(thumbnailName);

            if (deleted) {
                res.json({
                    success: true,
                    message: 'Image deleted successfully'
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: 'Image not found'
                });
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete image',
                message: error.message
            });
        }
    }

    /**
     * Получить информацию об изображении
     * GET /api/admin/upload/image/info
     */
    async getImageInfo(req, res) {
        try {
            const { url } = req.query;

            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'Image URL is required'
                });
            }

            const filename = getFilenameFromUrl(url);

            if (!filename) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid image URL'
                });
            }

            const imageInfo = await getImageInfo(filename);

            res.json({
                success: true,
                data: imageInfo
            });
        } catch (error) {
            console.error('Error getting image info:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get image info',
                message: error.message
            });
        }
    }
}

export default new UploadController();

