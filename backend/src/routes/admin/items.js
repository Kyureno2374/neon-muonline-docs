/**
 * Роуты для управления предметами (админка)
 * Все роуты защищены JWT авторизацией
 */

import express from 'express';
import AdminItemsController from '../../controllers/AdminItemsController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Все роуты требуют авторизации
router.use(authMiddleware);

// CRUD операции с предметами
router.get('/items', AdminItemsController.getAllItems.bind(AdminItemsController));
router.get('/items/:id', AdminItemsController.getItemById.bind(AdminItemsController));
router.post('/items', AdminItemsController.createItem.bind(AdminItemsController));
router.put('/items/:id', AdminItemsController.updateItem.bind(AdminItemsController));
router.delete('/items/:id', AdminItemsController.deleteItem.bind(AdminItemsController));

// Управление переводами предметов
router.get('/items/:id/translations', AdminItemsController.getItemTranslations.bind(AdminItemsController));
router.post('/items/:id/translations', AdminItemsController.createItemTranslation.bind(AdminItemsController));
router.put('/items/:id/translations/:lang', AdminItemsController.updateItemTranslation.bind(AdminItemsController));
router.delete('/items/:id/translations/:lang', AdminItemsController.deleteItemTranslation.bind(AdminItemsController));

export default router;

