/**
 * Middleware для валидации входящих данных
 * Предоставляет набор функций для проверки различных типов данных
 */

/**
 * Класс ошибки валидации
 */
export class ValidationError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
        this.code = 'VALIDATION_ERROR';
        this.field = field;
    }
}

/**
 * Проверка обязательных полей
 * @param {Array<string>} fields - Список обязательных полей
 * @returns {Function} - Middleware функция
 */
export function requireFields(fields) {
    return (req, res, next) => {
        const data = { ...(req.body || {}), ...(req.params || {}), ...(req.query || {}) };
        const missingFields = [];

        for (const field of fields) {
            if (data[field] === undefined || data[field] === null || data[field] === '') {
                missingFields.push(field);
            }
        }

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: {
                    message: `Required fields are missing: ${missingFields.join(', ')}`,
                    code: 'MISSING_REQUIRED_FIELDS',
                    fields: missingFields
                }
            });
        }

        next();
    };
}

/**
 * Валидация email
 */
export function validateEmail(field = 'email') {
    return (req, res, next) => {
        const email = req.body[field];

        if (!email) {
            return next();
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: `Invalid email format: ${email}`,
                    code: 'INVALID_EMAIL',
                    field: field
                }
            });
        }

        next();
    };
}

/**
 * Валидация slug (URL-friendly строка)
 */
export function validateSlug(field = 'slug') {
    return (req, res, next) => {
        const slug = req.body[field];

        if (!slug) {
            return next();
        }

        // Slug должен содержать только буквы, цифры и дефисы
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

        if (!slugRegex.test(slug)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: `Invalid slug format. Use only lowercase letters, numbers and hyphens: ${slug}`,
                    code: 'INVALID_SLUG',
                    field: field
                }
            });
        }

        next();
    };
}

/**
 * Валидация URL
 */
export function validateUrl(field = 'url', required = false) {
    return (req, res, next) => {
        const url = req.body[field];

        if (!url) {
            if (required) {
                return res.status(400).json({
                    success: false,
                    error: {
                        message: `${field} is required`,
                        code: 'MISSING_REQUIRED_FIELD',
                        field: field
                    }
                });
            }
            return next();
        }

        try {
            new URL(url);
            next();
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: {
                    message: `Invalid URL format: ${url}`,
                    code: 'INVALID_URL',
                    field: field
                }
            });
        }
    };
}

/**
 * Валидация длины строки
 */
export function validateLength(field, min = 0, max = Infinity) {
    return (req, res, next) => {
        const value = req.body[field];

        if (!value) {
            return next();
        }

        const length = String(value).length;

        if (length < min) {
            return res.status(400).json({
                success: false,
                error: {
                    message: `${field} must be at least ${min} characters long`,
                    code: 'VALUE_TOO_SHORT',
                    field: field,
                    min: min,
                    current: length
                }
            });
        }

        if (length > max) {
            return res.status(400).json({
                success: false,
                error: {
                    message: `${field} must not exceed ${max} characters`,
                    code: 'VALUE_TOO_LONG',
                    field: field,
                    max: max,
                    current: length
                }
            });
        }

        next();
    };
}

/**
 * Валидация числового диапазона
 */
export function validateRange(field, min = -Infinity, max = Infinity) {
    return (req, res, next) => {
        const value = req.body[field];

        if (value === undefined || value === null) {
            return next();
        }

        const num = Number(value);

        if (isNaN(num)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: `${field} must be a number`,
                    code: 'INVALID_NUMBER',
                    field: field
                }
            });
        }

        if (num < min || num > max) {
            return res.status(400).json({
                success: false,
                error: {
                    message: `${field} must be between ${min} and ${max}`,
                    code: 'VALUE_OUT_OF_RANGE',
                    field: field,
                    min: min,
                    max: max,
                    current: num
                }
            });
        }

        next();
    };
}

/**
 * Валидация enum значений
 */
export function validateEnum(field, allowedValues) {
    return (req, res, next) => {
        const value = req.body[field];

        if (!value) {
            return next();
        }

        if (!allowedValues.includes(value)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: `${field} must be one of: ${allowedValues.join(', ')}`,
                    code: 'INVALID_ENUM_VALUE',
                    field: field,
                    allowedValues: allowedValues,
                    current: value
                }
            });
        }

        next();
    };
}

/**
 * Валидация boolean
 */
export function validateBoolean(field) {
    return (req, res, next) => {
        const value = req.body[field];

        if (value === undefined || value === null) {
            return next();
        }

        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false' && value !== 0 && value !== 1) {
            return res.status(400).json({
                success: false,
                error: {
                    message: `${field} must be a boolean value`,
                    code: 'INVALID_BOOLEAN',
                    field: field
                }
            });
        }

        // Конвертируем в boolean
        req.body[field] = Boolean(value === 'true' || value === true || value === 1);

        next();
    };
}

/**
 * Валидация ID (положительное целое число)
 */
export function validateId(field = 'id') {
    return (req, res, next) => {
        const value = req.params?.[field] || req.body?.[field] || req.query?.[field];

        // Если значение отсутствует или undefined, пропускаем валидацию
        if (!value || value === undefined) {
            return next();
        }

        const id = parseInt(value, 10);

        // Проверяем что это корректное число больше 0
        if (isNaN(id) || id <= 0 || !Number.isFinite(id)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: `${field} must be a positive integer`,
                    code: 'INVALID_ID',
                    field: field,
                    received: value
                }
            });
        }

        next();
    };
}

/**
 * Валидация кода языка (ISO 639-1)
 */
export function validateLanguageCode(field = 'language') {
    return (req, res, next) => {
        const code = req.body?.[field] || req.params?.[field] || req.query?.[field];

        if (!code) {
            return next();
        }

        const languageCodeRegex = /^[a-z]{2}$/;

        if (!languageCodeRegex.test(code)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: `${field} must be a 2-letter lowercase language code (ISO 639-1)`,
                    code: 'INVALID_LANGUAGE_CODE',
                    field: field
                }
            });
        }

        next();
    };
}

/**
 * Санитизация HTML (базовая защита от XSS)
 */
export function sanitizeHtml(...fields) {
    return (req, res, next) => {
        for (const field of fields) {
            if (req.body[field]) {
                // Удаляем опасные теги
                req.body[field] = req.body[field]
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
                    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
            }
        }
        next();
    };
}

/**
 * Композиция нескольких валидаторов
 */
export function validate(...validators) {
    return (req, res, next) => {
        const runValidators = (index) => {
            if (index >= validators.length) {
                return next();
            }

            validators[index](req, res, (err) => {
                if (err) {
                    return next(err);
                }
                if (res.headersSent) {
                    return;
                }
                runValidators(index + 1);
            });
        };

        runValidators(0);
    };
}

