/**
 * Роуты для аутентификации администраторов
 * Базовый путь: /api/admin/auth
 */

import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/admin/auth/login - вход в систему
router.post('/login', function loginRoute(req, res, next) {
    AuthController.login(req, res, next);
});

// POST /api/admin/auth/refresh - обновление access токена
router.post('/refresh', function refreshRoute(req, res, next) {
    AuthController.refresh(req, res, next);
});

// POST /api/admin/auth/logout - выход из системы (требует авторизации)
router.post('/logout', authMiddleware, function logoutRoute(req, res, next) {
    AuthController.logout(req, res, next);
});

// GET /api/admin/auth/me - получение данных текущего админа (требует авторизации)
router.get('/me', authMiddleware, function getMeRoute(req, res, next) {
    AuthController.getMe(req, res, next);
});

export default router;

