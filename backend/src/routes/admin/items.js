/**
 * Роуты для управления предметами (админка)
 * Все роуты защищены JWT авторизацией
 */

import express from 'express';
import AdminItemsController from '../../controllers/AdminItemsController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import {
    requireFields,
    validateSlug,
    validateLength,
    validateId,
    validateLanguageCode,
    sanitizeHtml,
    validate
} from '../../middleware/validationMiddleware.js';

const router = express.Router();

// Все роуты требуют авторизации
router.use(authMiddleware);

// CRUD операции с предметами
router.get('', AdminItemsController.getAllItems.bind(AdminItemsController));

router.get(
    '/:id',
    validateId('id'),
    AdminItemsController.getItemById.bind(AdminItemsController)
);

router.post(
    '',
    validate(
        requireFields(['slug']),
        validateSlug('slug'),
        validateLength('slug', 2, 100)
    ),
    AdminItemsController.createItem.bind(AdminItemsController)
);

router.put(
    '/:id',
    validate(
        validateId('id'),
        validateSlug('slug'),
        validateLength('slug', 2, 100)
    ),
    AdminItemsController.updateItem.bind(AdminItemsController)
);

router.delete(
    '/:id',
    validateId('id'),
    AdminItemsController.deleteItem.bind(AdminItemsController)
);

// Управление переводами предметов
router.get(
    '/:id/translations',
    validateId('id'),
    AdminItemsController.getItemTranslations.bind(AdminItemsController)
);

router.post(
    '/:id/translations',
    validate(
        validateId('id'),
        requireFields(['language', 'name']),
        validateLanguageCode('language'),
        validateLength('name', 1, 200),
        validateLength('description', 0, 1000),
        sanitizeHtml('name', 'description')
    ),
    AdminItemsController.createItemTranslation.bind(AdminItemsController)
);

router.put(
    '/:id/translations/:lang',
    validate(
        validateId('id'),
        validateLanguageCode('lang'),
        validateLength('name', 1, 200),
        validateLength('description', 0, 1000),
        sanitizeHtml('name', 'description')
    ),
    AdminItemsController.updateItemTranslation.bind(AdminItemsController)
);

router.delete(
    '/:id/translations/:lang',
    validate(
        validateId('id'),
        validateLanguageCode('lang')
    ),
    AdminItemsController.deleteItemTranslation.bind(AdminItemsController)
);

export default router;

