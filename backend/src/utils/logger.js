/**
 * Конфигурация логирования с использованием Winston
 * Логирует в файлы с ротацией по дате
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к папке logs
const LOGS_DIR = path.join(__dirname, '../../../logs');

// Создаём папку logs если её нет
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Формат логов
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Формат для консоли (более читаемый)
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
        }
        return msg;
    })
);

// Транспорт для ошибок
const errorTransport = new DailyRotateFile({
    filename: path.join(LOGS_DIR, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: logFormat
});

// Транспорт для логов аутентификации
const authTransport = new DailyRotateFile({
    filename: path.join(LOGS_DIR, 'auth-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'info',
    format: logFormat
});

// Транспорт для действий админа
const adminTransport = new DailyRotateFile({
    filename: path.join(LOGS_DIR, 'admin-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'info',
    format: logFormat
});

// Транспорт для всех логов
const combinedTransport = new DailyRotateFile({
    filename: path.join(LOGS_DIR, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: logFormat
});

// Основной логгер
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        errorTransport,
        combinedTransport
    ]
});

// В режиме разработки также выводим в консоль
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

// Логгер для аутентификации
export const authLogger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [authTransport, combinedTransport]
});

// Логгер для действий админа
export const adminLogger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [adminTransport, combinedTransport]
});

/**
 * Логирование попытки входа
 */
export function logAuthAttempt(email, success, ip, reason = null) {
    const logData = {
        action: 'LOGIN_ATTEMPT',
        email,
        success,
        ip,
        timestamp: new Date().toISOString()
    };

    if (reason) {
        logData.reason = reason;
    }

    if (success) {
        authLogger.info('Login successful', logData);
    } else {
        authLogger.warn('Login failed', logData);
    }
}

/**
 * Логирование выхода
 */
export function logLogout(adminId, email, ip) {
    authLogger.info('Logout', {
        action: 'LOGOUT',
        admin_id: adminId,
        email,
        ip,
        timestamp: new Date().toISOString()
    });
}

/**
 * Логирование CRUD действий
 */
export function logAdminAction(adminId, action, resource, resourceId, details = {}) {
    adminLogger.info(`${action} ${resource}`, {
        action,
        resource,
        resource_id: resourceId,
        admin_id: adminId,
        details,
        timestamp: new Date().toISOString()
    });
}

/**
 * Логирование ошибок
 */
export function logError(error, context = {}) {
    logger.error(error.message, {
        error: error.message,
        stack: error.stack,
        code: error.code,
        ...context,
        timestamp: new Date().toISOString()
    });
}

/**
 * Логирование предупреждений
 */
export function logWarning(message, context = {}) {
    logger.warn(message, {
        ...context,
        timestamp: new Date().toISOString()
    });
}

/**
 * Логирование информации
 */
export function logInfo(message, context = {}) {
    logger.info(message, {
        ...context,
        timestamp: new Date().toISOString()
    });
}

export default logger;

