/**
 * Роуты для управления блоками (админка)
 * Все роуты защищены JWT авторизацией
 */

import express from 'express';
import AdminBlocksController from '../../controllers/AdminBlocksController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import {
    requireFields,
    validateId,
    validateRange,
    validateLanguageCode,
    validateLength,
    sanitizeHtml,
    validate
} from '../../middleware/validationMiddleware.js';

const router = express.Router();

// Все роуты требуют авторизации
router.use(authMiddleware);

// CRUD операции с блоками
router.get('', AdminBlocksController.getAllBlocks.bind(AdminBlocksController));

router.get(
    '/:id',
    validateId('id'),
    AdminBlocksController.getBlockById.bind(AdminBlocksController)
);

router.post(
    '',
    validate(
        requireFields(['page_id', 'block_type_id']),
        validateId('page_id'),
        validateId('block_type_id'),
        validateRange('sort_order', 0, 9999)
    ),
    AdminBlocksController.createBlock.bind(AdminBlocksController)
);

router.put(
    '/:id',
    validate(
        validateId('id'),
        validateId('block_type_id'),
        validateRange('sort_order', 0, 9999)
    ),
    AdminBlocksController.updateBlock.bind(AdminBlocksController)
);

router.delete(
    '/:id',
    validateId('id'),
    AdminBlocksController.deleteBlock.bind(AdminBlocksController)
);

router.put(
    '/:id/order',
    validate(
        validateId('id'),
        requireFields(['sort_order']),
        validateRange('sort_order', 0, 9999)
    ),
    AdminBlocksController.updateBlockOrder.bind(AdminBlocksController)
);

// Управление переводами блоков
router.get(
    '/:id/translations',
    validateId('id'),
    AdminBlocksController.getBlockTranslations.bind(AdminBlocksController)
);

router.post(
    '/:id/translations',
    validate(
        validateId('id'),
        requireFields(['language', 'content']),
        validateLanguageCode('language'),
        validateLength('content', 1, 10000),
        sanitizeHtml('content')
    ),
    AdminBlocksController.createBlockTranslation.bind(AdminBlocksController)
);

router.put(
    '/:id/translations/:lang',
    validate(
        validateId('id'),
        validateLanguageCode('lang')
        // Убираем requireFields(['content']), так как контроллер сам проверяет наличие поля
        // Разрешаем пустой контент для удаления изображений
    ),
    AdminBlocksController.updateBlockTranslation.bind(AdminBlocksController)
);

router.delete(
    '/:id/translations/:lang',
    validate(
        validateId('id'),
        validateLanguageCode('lang')
    ),
    AdminBlocksController.deleteBlockTranslation.bind(AdminBlocksController)
);

export default router;

