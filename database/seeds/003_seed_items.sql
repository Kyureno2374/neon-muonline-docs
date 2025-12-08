-- Добавление тестовых предметов в Items Database
INSERT INTO items (slug, image_url, thumbnail_url, is_active) VALUES
('dark-wizard', '/uploads/items/dark-wizard.png', '/uploads/items/dark-wizard_thumb.png', TRUE),
('dark-knight', '/uploads/items/dark-knight.png', '/uploads/items/dark-knight_thumb.png', TRUE),
('elf', '/uploads/items/elf.png', '/uploads/items/elf_thumb.png', TRUE),
('equalizer-buff', '/uploads/items/equalizer.png', '/uploads/items/equalizer_thumb.png', TRUE),
('excalibur-sword', '/uploads/items/excalibur.png', '/uploads/items/excalibur_thumb.png', TRUE),
('dragon-armor', '/uploads/items/dragon-armor.png', '/uploads/items/dragon-armor_thumb.png', TRUE),
('mythril-ore', '/uploads/items/mythril-ore.png', '/uploads/items/mythril-ore_thumb.png', TRUE);

-- Переводы предметов на русский
INSERT INTO item_translations (item_id, language, name, description) VALUES
(1, 'ru', 'Dark Wizard', 'The Dark Wizard in MU Online is a ranged magical damage dealer, specializing in offensive spells to annihilate foes from a safe distance.'),
(2, 'ru', 'Dark Knight', 'Тёмный рыцарь - мощный ближнебойный боец с высокой защитой'),
(3, 'ru', 'Elf', 'Эльф - ловкий боец дальнего боя с высокой скоростью атаки'),
(4, 'ru', 'Equalizer', 'Вы получаете его, если ваш сброс ниже, чем у топового игрока на сервере'),
(5, 'ru', 'Меч Экскалибур', 'Легендарный меч с невероятной силой атаки'),
(6, 'ru', 'Драконья броня', 'Защита, выкованная из чешуи древнего дракона'),
(7, 'ru', 'Мифриловая руда', 'Редкий материал для крафта легендарного оружия');

-- Переводы предметов на английский
INSERT INTO item_translations (item_id, language, name, description) VALUES
(1, 'en', 'Dark Wizard', 'The Dark Wizard in MU Online is a ranged magical damage dealer, specializing in offensive spells to annihilate foes from a safe distance.'),
(2, 'en', 'Dark Knight', 'Dark Knight is a powerful melee fighter with high defense'),
(3, 'en', 'Elf', 'Elf is an agile ranged fighter with high attack speed'),
(4, 'en', 'Equalizer', 'You receive it if your reset is lower than the top player on the server'),
(5, 'en', 'Excalibur Sword', 'Legendary sword with incredible attack power'),
(6, 'en', 'Dragon Armor', 'Protection forged from ancient dragon scales'),
(7, 'en', 'Mythril Ore', 'Rare material for crafting legendary weapons');
