/**
 * Роуты для работы с категориями предметов
 * Базовый путь: /api/admin/item-categories
 */

import express from 'express';
import ItemCategoriesController from '../../controllers/ItemCategoriesController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Все роуты требуют авторизации
router.use(authMiddleware);

// GET /api/admin/item-categories - получить все категории
router.get('/', function getCategoriesRoute(req, res, next) {
    ItemCategoriesController.getAllCategories(req, res, next);
});

// GET /api/admin/item-categories/:id - получить категорию по ID
router.get('/:id', function getCategoryRoute(req, res, next) {
    ItemCategoriesController.getCategoryById(req, res, next);
});

// POST /api/admin/item-categories - создать категорию
router.post('/', function createCategoryRoute(req, res, next) {
    ItemCategoriesController.createCategory(req, res, next);
});

// PUT /api/admin/item-categories/:id - обновить категорию
router.put('/:id', function updateCategoryRoute(req, res, next) {
    ItemCategoriesController.updateCategory(req, res, next);
});

// DELETE /api/admin/item-categories/:id - удалить категорию
router.delete('/:id', function deleteCategoryRoute(req, res, next) {
    ItemCategoriesController.deleteCategory(req, res, next);
});

// GET /api/admin/item-categories/:id/translations - получить переводы
router.get('/:id/translations', function getTranslationsRoute(req, res, next) {
    ItemCategoriesController.getCategoryTranslations(req, res, next);
});

// POST /api/admin/item-categories/:id/translations - создать перевод
router.post('/:id/translations', function createTranslationRoute(req, res, next) {
    ItemCategoriesController.createCategoryTranslation(req, res, next);
});

// PUT /api/admin/item-categories/:id/translations/:lang - обновить перевод
router.put('/:id/translations/:lang', function updateTranslationRoute(req, res, next) {
    ItemCategoriesController.updateCategoryTranslation(req, res, next);
});

export default router;
