-- Создание таблицы администраторов
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по email
CREATE INDEX idx_admins_email ON admins(email);

-- Комментарии
COMMENT ON TABLE admins IS 'Администраторы системы';
COMMENT ON COLUMN admins.password_hash IS 'Хешированный пароль (bcrypt)';
COMMENT ON COLUMN admins.is_active IS 'Флаг активности администратора';
