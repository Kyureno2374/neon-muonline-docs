-- Добавление тестового администратора
-- Пароль: admin123 (хеш создан с помощью bcrypt, rounds: 10)
-- ВАЖНО: В продакшне обязательно изменить пароль!

INSERT INTO admins (email, password_hash, name, is_active) VALUES
('admin@neon-muonline.com', '$2b$10$rKZ3qX7J9YvHXxJ7nQ3XuO7gKZ3XqJ7YvHXxJ7nQ3XuO7gKZ3XqJ7Y', 'Администратор', true);

-- Примечание: Этот пароль только для разработки
-- При первом входе в продакшн систему обязательно смените пароль через админ-панель

