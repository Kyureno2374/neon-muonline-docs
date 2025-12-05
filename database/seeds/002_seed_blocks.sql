-- Получение ID типов блоков
-- 1 = text, 2 = picture, 3 = list

-- Блоки для страницы "General information" (page_id = 1)
INSERT INTO blocks (page_id, block_type_id, sort_order, is_active) VALUES
(1, 1, 1, true),  -- Client: MUs6
(1, 1, 2, true),  -- Classes
(1, 1, 3, true),  -- Exp Rate
(1, 1, 4, true),  -- Zodiac Exp Rate
(1, 1, 5, true),  -- Drop Rate
(1, 1, 6, true),  -- Zen Drop Rate
(1, 1, 7, true),  -- Max Reset
(1, 1, 8, true),  -- Max points by resets 0-100
(1, 1, 9, true),  -- Max points by resets 101-1000
(1, 1, 10, true), -- Max points from class quests
(1, 1, 11, true), -- Max points from Noria quests
(1, 1, 12, true); -- Max points per Zodiac levels

-- Переводы блоков для "General information" (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(1, 'ru', 'Клиент: MUs6'),
(2, 'ru', 'Классы: Dark Wizard, Dark Knight, Elf, Magic Gladiator, Dark Lord, Summoner'),
(3, 'ru', 'Скорость опыта: Средняя'),
(4, 'ru', 'Скорость опыта Зодиака: Средняя'),
(5, 'ru', 'Шанс дропа: Низкий'),
(6, 'ru', 'Шанс дропа Zen: Средний'),
(7, 'ru', 'Максимум сбросов: 1000'),
(8, 'ru', 'Максимум очков за сбросы 0-100: 171397'),
(9, 'ru', 'Максимум очков за сбросы 101-1000: 90000'),
(10, 'ru', 'Максимум очков от классовых квестов: 9500'),
(11, 'ru', 'Максимум очков от квестов Нории: 33100'),
(12, 'ru', 'Максимум очков за уровни Зодиака: 50000');

-- Переводы блоков для "General information" (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(1, 'en', 'Client: MUs6'),
(2, 'en', 'Classes: Dark Wizard, Dark Knight, Elf, Magic Gladiator, Dark Lord, Summoner'),
(3, 'en', 'Exp Rate: Medium'),
(4, 'en', 'Zodiac Exp Rate: Medium'),
(5, 'en', 'Drop Rate: Low'),
(6, 'en', 'Zen Drop Rate: Medium'),
(7, 'en', 'Max Reset: 1000'),
(8, 'en', 'Max points by resets 0-100: 171397'),
(9, 'en', 'Max points by resets 101-1000: 90000'),
(10, 'en', 'Max points from class quests: 9500'),
(11, 'en', 'Max points from Noria quests: 33100'),
(12, 'en', 'Max points per Zodiac levels: 50000');

-- Блоки для страницы "Characters" (page_id = 2)
INSERT INTO blocks (page_id, block_type_id, sort_order, is_active, image_url) VALUES
(2, 2, 1, true, '/uploads/dark-wizard.png'),    -- Dark Wizard (с изображением)
(2, 2, 2, true, '/uploads/dark-knight.png'),    -- Dark Knight
(2, 2, 3, true, '/uploads/elf.png'),            -- Elf
(2, 2, 4, true, '/uploads/magic-gladiator.png'), -- Magic Gladiator
(2, 2, 5, true, '/uploads/dark-lord.png'),      -- Dark Lord
(2, 2, 6, true, '/uploads/summoner.png');       -- Summoner

-- Переводы блоков для "Characters" (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(13, 'ru', 'Тёмный маг (Dark Wizard) - это дальнобойный магический боец, специализирующийся на атакующих заклинаниях для уничтожения врагов на расстоянии. Несмотря на низкую физическую силу и защиту, они очень мобильны и обладают одними из самых мощных способностей массового поражения (AoE) в игре.'),
(14, 'ru', 'Тёмный рыцарь (Dark Knight) - мощный ближнебойный боец с высокой защитой и уроном. Идеален для новичков благодаря балансу атаки и выживаемости.'),
(15, 'ru', 'Эльф (Elf) - ловкий боец дальнего боя, владеющий луками и арбалетами. Может призывать помощников и имеет высокую скорость атаки.'),
(16, 'ru', 'Магический гладиатор (Magic Gladiator) - гибридный класс, сочетающий физические атаки и магию. Универсальный боец для любых ситуаций.'),
(17, 'ru', 'Тёмный лорд (Dark Lord) - командир, способный призывать питомцев и усиливать союзников. Отличный класс для групповой игры.'),
(18, 'ru', 'Призыватель (Summoner) - маг, специализирующийся на призыве могущественных существ для помощи в бою.');

-- Переводы блоков для "Characters" (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(13, 'en', 'The Dark Wizard in MU Online is a ranged magical damage dealer, specializing in offensive spells to annihilate foes from a safe distance. Despite having low physical strength and defense, they are highly mobile and possess some of the most powerful Area-of-Effect (AoE) abilities in the game.'),
(14, 'en', 'Dark Knight is a powerful melee fighter with high defense and damage. Ideal for beginners due to balance of attack and survivability.'),
(15, 'en', 'Elf is an agile ranged fighter, wielding bows and crossbows. Can summon helpers and has high attack speed.'),
(16, 'en', 'Magic Gladiator is a hybrid class combining physical attacks and magic. Universal fighter for any situation.'),
(17, 'en', 'Dark Lord is a commander capable of summoning pets and buffing allies. Excellent class for group play.'),
(18, 'en', 'Summoner is a mage specializing in summoning powerful creatures to aid in battle.');

-- Блоки для страницы "Unique features" (page_id = 4) - Reset details
INSERT INTO blocks (page_id, block_type_id, sort_order, is_active) VALUES
(4, 1, 1, true),  -- Reset details header
(4, 1, 2, true),  -- Mana replaced
(4, 1, 3, true),  -- Zen
(4, 1, 4, true),  -- Emeralds
(4, 1, 5, true);  -- Diamonds

-- Переводы блоков для "Unique features" (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(19, 'ru', 'Детали сброса'),
(20, 'ru', 'Мана заменена на Заряд Силы'),
(21, 'ru', 'Zen'),
(22, 'ru', 'Изумруды'),
(23, 'ru', 'Алмазы');

-- Переводы блоков для "Unique features" (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(19, 'en', 'Reset details'),
(20, 'en', 'Mana replaced with Power Charge'),
(21, 'en', 'Zen'),
(22, 'en', 'Emeralds'),
(23, 'en', 'Diamonds');

