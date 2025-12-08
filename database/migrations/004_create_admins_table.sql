-- Создание таблицы администраторов
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL COMMENT 'Хешированный пароль (bcrypt)',
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Флаг активности администратора',
    last_login TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Администраторы системы';

-- Индекс для быстрого поиска по email
CREATE INDEX idx_admins_email ON admins(email);
