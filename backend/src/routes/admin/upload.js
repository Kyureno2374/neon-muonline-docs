/**
 * Роуты для загрузки изображений (админка)
 * Все роуты защищены JWT авторизацией
 */

import express from 'express';
import UploadController from '../../controllers/UploadController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { uploadSingleImage, handleUploadError } from '../../middleware/uploadMiddleware.js';
import { validateEnum, requireFields, validate } from '../../middleware/validationMiddleware.js';

const router = express.Router();

// Все роуты требуют авторизации
router.use(authMiddleware);

// Загрузка изображения
router.post(
    '/image',
    uploadSingleImage,
    handleUploadError,
    validateEnum('type', ['item', 'block', 'general']),
    UploadController.uploadImage.bind(UploadController)
);

// Удаление изображения
router.delete(
    '/image',
    validate(
        requireFields(['url'])
    ),
    UploadController.deleteImage.bind(UploadController)
);

// Получить информацию об изображении
router.get(
    '/image/info',
    requireFields(['url']),
    UploadController.getImageInfo.bind(UploadController)
);

export default router;

