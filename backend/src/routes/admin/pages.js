/**
 * Роуты для администрирования страниц
 * Все роуты защищены JWT авторизацией
 */

import express from 'express';
import AdminPagesController from '../../controllers/AdminPagesController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Все роуты требуют авторизации
router.use(authMiddleware);

// CRUD операции со страницами
router.post('/pages', AdminPagesController.createPage.bind(AdminPagesController));
router.put('/pages/:id', AdminPagesController.updatePage.bind(AdminPagesController));
router.delete('/pages/:id', AdminPagesController.deletePage.bind(AdminPagesController));

// Управление переводами страниц
router.get('/pages/:id/translations', AdminPagesController.getPageTranslations.bind(AdminPagesController));
router.post('/pages/:id/translations', AdminPagesController.createPageTranslation.bind(AdminPagesController));
router.put('/pages/:id/translations/:lang', AdminPagesController.updatePageTranslation.bind(AdminPagesController));
router.delete('/pages/:id/translations/:lang', AdminPagesController.deletePageTranslation.bind(AdminPagesController));

export default router;

