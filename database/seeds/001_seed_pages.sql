-- Добавление страниц сайта (согласно Figma дизайну)
INSERT INTO pages (slug, icon, sort_order, is_active) VALUES
('main', '🏠', 0, TRUE),
('general-information', '📋', 1, TRUE),
('characters', '⚔️', 2, TRUE),
('game-interface', '🎮', 3, TRUE),
('unique-features', '✨', 4, TRUE),
('crafting', '🔨', 5, TRUE),
('equipment', '🛡️', 6, TRUE),
('monster-info', '👹', 7, TRUE),
('events', '🎉', 8, TRUE),
('quests', '📜', 9, TRUE),
('donate-features', '💎', 10, TRUE),
('help-server-grow', '❤️', 11, TRUE)
ON DUPLICATE KEY UPDATE 
    icon = VALUES(icon),
    sort_order = VALUES(sort_order),
    is_active = VALUES(is_active);

-- Переводы страниц на русский
INSERT INTO page_translations (page_id, language, name) VALUES
(1, 'ru', 'Главная'),
(2, 'ru', 'Общая информация'),
(3, 'ru', 'Персонажи'),
(4, 'ru', 'Игровой интерфейс'),
(5, 'ru', 'Уникальные особенности'),
(6, 'ru', 'Крафт'),
(7, 'ru', 'Снаряжение'),
(8, 'ru', 'Информация о монстрах'),
(9, 'ru', 'События'),
(10, 'ru', 'Квесты'),
(11, 'ru', 'Донат возможности'),
(12, 'ru', 'Помоги серверу расти')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Переводы страниц на английский
INSERT INTO page_translations (page_id, language, name) VALUES
(1, 'en', 'Main Page'),
(2, 'en', 'General information'),
(3, 'en', 'Characters'),
(4, 'en', 'Game interface'),
(5, 'en', 'Unique features'),
(6, 'en', 'Crafting'),
(7, 'en', 'Equipment'),
(8, 'en', 'Monster info'),
(9, 'en', 'Events'),
(10, 'en', 'Quests'),
(11, 'en', 'Donate features'),
(12, 'en', 'Help the server grow')
ON DUPLICATE KEY UPDATE name = VALUES(name);
