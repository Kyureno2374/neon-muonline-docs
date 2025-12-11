/**
 * Контроллер для аутентификации администраторов
 */

import AdminsModel from '../models/AdminsModel.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwtUtils.js';
import { logAuthAttempt, logLogout } from '../utils/logger.js';

class AuthController {
    /**
     * POST /api/admin/auth/login
     * Вход администратора в систему
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Валидация входных данных
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Email and password are required',
                        code: 'VALIDATION_ERROR'
                    }
                });
            }

            // Поиск админа по email
            const admin = await AdminsModel.findByEmail(email);

            if (!admin) {
                logAuthAttempt(email, false, req.ip, 'User not found');
                return res.status(401).json({
                    success: false,
                    error: {
                        message: 'Invalid email or password',
                        code: 'INVALID_CREDENTIALS'
                    }
                });
            }

            // Проверка пароля
            const isPasswordValid = await AdminsModel.verifyPassword(password, admin.password);

            if (!isPasswordValid) {
                logAuthAttempt(email, false, req.ip, 'Invalid password');
                return res.status(401).json({
                    success: false,
                    error: {
                        message: 'Invalid email or password',
                        code: 'INVALID_CREDENTIALS'
                    }
                });
            }

            // Генерация токенов
            const accessToken = generateAccessToken({
                id: admin.id,
                email: admin.email
            });

            const refreshToken = generateRefreshToken({
                id: admin.id
            });

            // Логирование успешного входа
            console.log(`✅ Admin logged in: ${admin.email} (ID: ${admin.id})`);
            logAuthAttempt(email, true, req.ip);

            // Возвращаем данные админа и токены
            res.json({
                success: true,
                data: {
                    admin: {
                        id: admin.id,
                        email: admin.email,
                        name: admin.name
                    },
                    tokens: {
                        accessToken,
                        refreshToken
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/admin/auth/refresh
     * Обновление access токена с помощью refresh токена
     */
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: 'Refresh token is required',
                        code: 'VALIDATION_ERROR'
                    }
                });
            }

            // Верификация refresh токена
            let decoded;
            try {
                decoded = verifyRefreshToken(refreshToken);
            } catch (error) {
                return res.status(401).json({
                    success: false,
                    error: {
                        message: 'Invalid or expired refresh token',
                        code: 'INVALID_REFRESH_TOKEN'
                    }
                });
            }

            // Проверяем что админ существует
            const admin = await AdminsModel.findById(decoded.id);

            if (!admin) {
                return res.status(401).json({
                    success: false,
                    error: {
                        message: 'Admin not found',
                        code: 'ADMIN_NOT_FOUND'
                    }
                });
            }

            // Генерируем новый access token
            const newAccessToken = generateAccessToken({
                id: admin.id,
                email: admin.email
            });

            res.json({
                success: true,
                data: {
                    accessToken: newAccessToken
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/admin/auth/logout
     * Выход из системы (на клиенте удаляются токены)
     */
    async logout(req, res, next) {
        try {
            // В текущей реализации JWT токены хранятся на клиенте
            // Сервер просто подтверждает logout
            // Клиент должен удалить токены из localStorage/cookies

            console.log(`🚪 Admin logged out: ${req.admin.email} (ID: ${req.admin.id})`);
            logLogout(req.admin.id, req.admin.email, req.ip);

            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/admin/auth/me
     * Получение данных текущего авторизованного админа
     */
    async getMe(req, res, next) {
        try {
            // req.admin добавляется через authMiddleware
            const admin = await AdminsModel.findById(req.admin.id);

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: 'Admin not found',
                        code: 'ADMIN_NOT_FOUND'
                    }
                });
            }

            res.json({
                success: true,
                data: {
                    id: admin.id,
                    email: admin.email,
                    name: admin.name,
                    created_at: admin.created_at,
                    updated_at: admin.updated_at
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();

