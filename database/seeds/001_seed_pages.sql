-- Добавление страниц сайта (согласно Figma дизайну)
INSERT INTO pages (slug, icon, sort_order, is_active) VALUES
('general-information', '📋', 1, true),
('characters', '⚔️', 2, true),
('game-interface', '🎮', 3, true),
('unique-features', '✨', 4, true),
('crafting', '🔨', 5, true),
('equipment', '🛡️', 6, true),
('monster-info', '👹', 7, true),
('events', '🎉', 8, true),
('quests', '📜', 9, true),
('donate-features', '💎', 10, true),
('help-server-grow', '❤️', 11, true);

-- Переводы страниц на русский
INSERT INTO page_translations (page_id, language, name) VALUES
(1, 'ru', 'Общая информация'),
(2, 'ru', 'Персонажи'),
(3, 'ru', 'Игровой интерфейс'),
(4, 'ru', 'Уникальные особенности'),
(5, 'ru', 'Крафт'),
(6, 'ru', 'Снаряжение'),
(7, 'ru', 'Информация о монстрах'),
(8, 'ru', 'События'),
(9, 'ru', 'Квесты'),
(10, 'ru', 'Донат возможности'),
(11, 'ru', 'Помоги серверу расти');

-- Переводы страниц на английский
INSERT INTO page_translations (page_id, language, name) VALUES
(1, 'en', 'General information'),
(2, 'en', 'Characters'),
(3, 'en', 'Game interface'),
(4, 'en', 'Unique features'),
(5, 'en', 'Crafting'),
(6, 'en', 'Equipment'),
(7, 'en', 'Monster info'),
(8, 'en', 'Events'),
(9, 'en', 'Quests'),
(10, 'en', 'Donate features'),
(11, 'en', 'Help the server grow');

