/**
 * ПРИМЕР использования валидации в роутах
 * Это демонстрация того, как можно применить валидацию к существующим роутам
 */

import express from 'express';
import AdminPagesController from '../../controllers/AdminPagesController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import {
    requireFields,
    validateSlug,
    validateLength,
    validateLanguageCode,
    sanitizeHtml,
    validate
} from '../../middleware/validationMiddleware.js';

const router = express.Router();

// Все роуты требуют авторизации
router.use(authMiddleware);

// Создание страницы с валидацией
router.post(
    '/pages',
    validate(
        requireFields(['slug', 'icon']),
        validateSlug('slug'),
        validateLength('slug', 2, 100),
        validateLength('icon', 1, 50),
        sanitizeHtml('icon')
    ),
    AdminPagesController.createPage.bind(AdminPagesController)
);

// Обновление страницы с валидацией
router.put(
    '/pages/:id',
    validate(
        validateSlug('slug'),
        validateLength('slug', 2, 100),
        validateLength('icon', 1, 50),
        sanitizeHtml('icon')
    ),
    AdminPagesController.updatePage.bind(AdminPagesController)
);

// Создание перевода страницы с валидацией
router.post(
    '/pages/:id/translations',
    validate(
        requireFields(['language', 'title']),
        validateLanguageCode('language'),
        validateLength('title', 1, 200),
        validateLength('description', 0, 500),
        sanitizeHtml('title', 'description')
    ),
    AdminPagesController.createPageTranslation.bind(AdminPagesController)
);

// Обновление перевода страницы с валидацией
router.put(
    '/pages/:id/translations/:lang',
    validate(
        validateLanguageCode('lang'),
        validateLength('title', 1, 200),
        validateLength('description', 0, 500),
        sanitizeHtml('title', 'description')
    ),
    AdminPagesController.updatePageTranslation.bind(AdminPagesController)
);

// Удаление страницы (без дополнительной валидации)
router.delete(
    '/pages/:id',
    AdminPagesController.deletePage.bind(AdminPagesController)
);

// Получение переводов страницы (без валидации body)
router.get(
    '/pages/:id/translations',
    AdminPagesController.getPageTranslations.bind(AdminPagesController)
);

// Удаление перевода страницы
router.delete(
    '/pages/:id/translations/:lang',
    validateLanguageCode('lang'),
    AdminPagesController.deletePageTranslation.bind(AdminPagesController)
);

export default router;

