-- Добавление тестового администратора
-- Пароль: admin123 (хеш создан с помощью bcrypt, rounds: 10)
-- ВАЖНО: В продакшне обязательно изменить пароль!

INSERT INTO admins (email, password_hash, name, is_active) VALUES
('admin@neon-muonline.com', '$2b$10$xF41UUBEbaGtspU4OTDJq.xrO5fUFAxp16z7qv4g7ECtaj5kNvCNi', 'Администратор', TRUE)
ON DUPLICATE KEY UPDATE
    password_hash = VALUES(password_hash),
    name = VALUES(name);

-- Примечание: Этот пароль только для разработки
-- При первом входе в продакшн систему обязательно смените пароль через админ-панель
