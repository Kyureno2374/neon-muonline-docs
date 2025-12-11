/**
 * Middleware для загрузки изображений
 * Использует multer для загрузки файлов и sharp для обработки
 */

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к папке uploads
const UPLOADS_DIR = path.join(__dirname, '../../../uploads');

// Создаём папку uploads если её нет
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Настройка хранилища multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        // Генерируем уникальное имя файла
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'img-' + uniqueSuffix + ext);
    }
});

// Фильтр для проверки типа файла
const fileFilter = (req, file, cb) => {
    // Разрешённые типы изображений
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG and WebP are allowed.'), false);
    }
};

// Настройка multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB максимум
    }
});

/**
 * Middleware для загрузки одного изображения
 */
export const uploadSingleImage = upload.single('image');

/**
 * Middleware для загрузки нескольких изображений
 */
export const uploadMultipleImages = upload.array('images', 10); // максимум 10 файлов

/**
 * Обработчик ошибок multer
 */
export function handleUploadError(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large. Maximum size is 5MB.'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                error: 'Too many files. Maximum is 10 files.'
            });
        }
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    
    if (err) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    
    next();
}

/**
 * Получить полный путь к файлу в папке uploads
 */
export function getUploadPath(filename) {
    return path.join(UPLOADS_DIR, filename);
}

/**
 * Удалить файл из папки uploads
 */
export function deleteUploadFile(filename) {
    try {
        const filePath = getUploadPath(filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
}

/**
 * Получить имя файла из URL
 */
export function getFilenameFromUrl(url) {
    if (!url) return null;
    return path.basename(url);
}

