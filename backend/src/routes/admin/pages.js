/**
 * Роуты для администрирования страниц
 * Все роуты защищены JWT авторизацией
 */

import express from 'express';
import AdminPagesController from '../../controllers/AdminPagesController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import {
    requireFields,
    validateSlug,
    validateLength,
    validateLanguageCode,
    validateId,
    sanitizeHtml,
    validate
} from '../../middleware/validationMiddleware.js';

const router = express.Router();

// Все роуты требуют авторизации
router.use(authMiddleware);

// Получение всех страниц
router.get(
    '/',
    AdminPagesController.getPages.bind(AdminPagesController)
);

// CRUD операции со страницами
router.post(
    '/',
    validate(
        requireFields(['slug', 'icon']),
        validateSlug('slug'),
        validateLength('slug', 2, 100),
        validateLength('icon', 1, 50),
        sanitizeHtml('icon')
    ),
    AdminPagesController.createPage.bind(AdminPagesController)
);

router.put(
    '/:id',
    validate(
        validateId('id'),
        validateSlug('slug'),
        validateLength('slug', 2, 100),
        validateLength('icon', 1, 50),
        sanitizeHtml('icon')
    ),
    AdminPagesController.updatePage.bind(AdminPagesController)
);

router.delete(
    '/:id',
    validateId('id'),
    AdminPagesController.deletePage.bind(AdminPagesController)
);

// Управление переводами страниц
router.get(
    '/:id/translations',
    validateId('id'),
    AdminPagesController.getPageTranslations.bind(AdminPagesController)
);

router.post(
    '/:id/translations',
    validate(
        validateId('id'),
        requireFields(['language', 'name']),
        validateLanguageCode('language'),
        validateLength('name', 1, 200),
        sanitizeHtml('name')
    ),
    AdminPagesController.createPageTranslation.bind(AdminPagesController)
);

router.put(
    '/:id/translations/:lang',
    validate(
        validateId('id'),
        validateLanguageCode('lang')
        // Убираем жесткую валидацию name, так как контроллер поддерживает оба поля
    ),
    AdminPagesController.updatePageTranslation.bind(AdminPagesController)
);

router.delete(
    '/:id/translations/:lang',
    validate(
        validateId('id'),
        validateLanguageCode('lang')
    ),
    AdminPagesController.deletePageTranslation.bind(AdminPagesController)
);

export default router;
