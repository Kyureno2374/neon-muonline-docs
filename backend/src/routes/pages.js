/**
 * Роуты для работы со страницами
 * Базовый путь: /api/pages
 */

import express from 'express';
import PagesController from '../controllers/PagesController.js';

const router = express.Router();

// GET /api/pages - получить список всех страниц
router.get('/', function getPagesRoute(req, res, next) {
    PagesController.getAllPages(req, res, next);
});

// GET /api/pages/:slug - получить страницу по slug со всеми блоками
router.get('/:slug', function getPageBySlugRoute(req, res, next) {
    PagesController.getPageBySlug(req, res, next);
});

// GET /api/pages/:slug/blocks - получить только блоки страницы
router.get('/:slug/blocks', function getPageBlocksRoute(req, res, next) {
    PagesController.getPageBlocks(req, res, next);
});

export default router;

