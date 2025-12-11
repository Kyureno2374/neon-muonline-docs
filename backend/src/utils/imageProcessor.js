/**
 * Утилиты для обработки изображений
 * Использует sharp для создания миниатюр
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { getUploadPath } from '../middleware/uploadMiddleware.js';

/**
 * Создать миниатюру изображения
 * @param {string} filename - Имя файла
 * @param {number} width - Ширина миниатюры
 * @param {number} height - Высота миниатюры
 * @returns {Promise<string>} - Имя файла миниатюры
 */
export async function createThumbnail(filename, width, height) {
    try {
        const inputPath = getUploadPath(filename);
        
        if (!fs.existsSync(inputPath)) {
            throw new Error('Source image not found');
        }

        // Генерируем имя для миниатюры
        const ext = path.extname(filename);
        const basename = path.basename(filename, ext);
        const thumbnailName = `${basename}_thumb${ext}`;
        const outputPath = getUploadPath(thumbnailName);

        // Создаём миниатюру
        await sharp(inputPath)
            .resize(width, height, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 85 })
            .toFile(outputPath);

        return thumbnailName;
    } catch (error) {
        console.error('Error creating thumbnail:', error);
        throw new Error(`Failed to create thumbnail: ${error.message}`);
    }
}

/**
 * Создать миниатюру для предмета (200x200px)
 * @param {string} filename - Имя файла
 * @returns {Promise<string>} - Имя файла миниатюры
 */
export async function createItemThumbnail(filename) {
    return await createThumbnail(filename, 200, 200);
}

/**
 * Создать миниатюру для блока picture (800x600px)
 * @param {string} filename - Имя файла
 * @returns {Promise<string>} - Имя файла миниатюры
 */
export async function createBlockThumbnail(filename) {
    return await createThumbnail(filename, 800, 600);
}

/**
 * Оптимизировать изображение
 * @param {string} filename - Имя файла
 * @returns {Promise<void>}
 */
export async function optimizeImage(filename) {
    try {
        const inputPath = getUploadPath(filename);
        
        if (!fs.existsSync(inputPath)) {
            throw new Error('Image not found');
        }

        const ext = path.extname(filename).toLowerCase();
        const tempPath = inputPath + '.tmp';

        // Оптимизируем в зависимости от типа
        if (ext === '.jpg' || ext === '.jpeg') {
            await sharp(inputPath)
                .jpeg({ quality: 85, progressive: true })
                .toFile(tempPath);
        } else if (ext === '.png') {
            await sharp(inputPath)
                .png({ compressionLevel: 9 })
                .toFile(tempPath);
        } else if (ext === '.webp') {
            await sharp(inputPath)
                .webp({ quality: 85 })
                .toFile(tempPath);
        } else {
            return; // Не поддерживаемый формат
        }

        // Заменяем оригинальный файл оптимизированным
        fs.unlinkSync(inputPath);
        fs.renameSync(tempPath, inputPath);
    } catch (error) {
        console.error('Error optimizing image:', error);
        throw new Error(`Failed to optimize image: ${error.message}`);
    }
}

/**
 * Получить информацию об изображении
 * @param {string} filename - Имя файла
 * @returns {Promise<Object>} - Метаданные изображения
 */
export async function getImageInfo(filename) {
    try {
        const inputPath = getUploadPath(filename);
        
        if (!fs.existsSync(inputPath)) {
            throw new Error('Image not found');
        }

        const metadata = await sharp(inputPath).metadata();
        const stats = fs.statSync(inputPath);

        return {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: stats.size,
            sizeFormatted: formatBytes(stats.size)
        };
    } catch (error) {
        console.error('Error getting image info:', error);
        throw new Error(`Failed to get image info: ${error.message}`);
    }
}

/**
 * Форматировать размер файла
 * @param {number} bytes - Размер в байтах
 * @returns {string} - Форматированная строка
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

