/**
 * Роуты для управления языками (админка)
 * Все роуты защищены JWT авторизацией
 */

import express from 'express';
import AdminLanguagesController from '../../controllers/AdminLanguagesController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import {
    requireFields,
    validateLanguageCode,
    validateLength,
    validateBoolean,
    validateRange,
    validate
} from '../../middleware/validationMiddleware.js';

const router = express.Router();

// Все роуты требуют авторизации
router.use(authMiddleware);

// Получить активные языки (должно быть перед /:code)
router.get('/active', AdminLanguagesController.getActiveLanguages.bind(AdminLanguagesController));

// CRUD операции с языками
router.get('', AdminLanguagesController.getAllLanguages.bind(AdminLanguagesController));

router.get(
    '/:code',
    validateLanguageCode('code'),
    AdminLanguagesController.getLanguageByCode.bind(AdminLanguagesController)
);

router.get(
    '/:code/stats',
    validateLanguageCode('code'),
    AdminLanguagesController.getLanguageStats.bind(AdminLanguagesController)
);

router.post(
    '',
    validate(
        requireFields(['code', 'name_native', 'name_en']),
        validateLanguageCode('code'),
        validateLength('name_native', 1, 50),
        validateLength('name_en', 1, 50),
        validateLength('flag_emoji', 0, 10),
        validateRange('display_order', 0, 999)
    ),
    AdminLanguagesController.createLanguage.bind(AdminLanguagesController)
);

router.put(
    '/:code',
    validate(
        validateLanguageCode('code'),
        validateLength('name_native', 1, 50),
        validateLength('name_en', 1, 50),
        validateLength('flag_emoji', 0, 10),
        validateRange('display_order', 0, 999)
    ),
    AdminLanguagesController.updateLanguage.bind(AdminLanguagesController)
);

router.put(
    '/:code/toggle',
    validate(
        validateLanguageCode('code'),
        requireFields(['is_active']),
        validateBoolean('is_active')
    ),
    AdminLanguagesController.toggleLanguage.bind(AdminLanguagesController)
);

router.delete(
    '/:code',
    validateLanguageCode('code'),
    AdminLanguagesController.deleteLanguage.bind(AdminLanguagesController)
);

export default router;

