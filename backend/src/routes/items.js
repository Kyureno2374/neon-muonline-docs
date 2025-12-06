/**
 * Роуты для работы с предметами
 * Базовый путь: /api/items
 */

import express from 'express';
import ItemsController from '../controllers/ItemsController.js';

const router = express.Router();

// GET /api/items/search - поиск предметов (должен быть перед /:slug!)
router.get('/search', function searchItemsRoute(req, res, next) {
    ItemsController.searchItems(req, res, next);
});

// GET /api/items - получить список предметов с пагинацией
router.get('/', function getItemsRoute(req, res, next) {
    ItemsController.getAllItems(req, res, next);
});

// GET /api/items/:slug - получить один предмет по slug
router.get('/:slug', function getItemBySlugRoute(req, res, next) {
    ItemsController.getItemBySlug(req, res, next);
});

export default router;

