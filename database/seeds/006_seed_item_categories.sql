-- Вставка категорий предметов
INSERT INTO item_categories (slug, sort_order) VALUES
('weapons', 1),
('armor', 2),
('accessories', 3),
('consumables', 4),
('quest-items', 5)
ON DUPLICATE KEY UPDATE slug=slug;

-- Вставка переводов категорий (русский)
INSERT INTO item_category_translations (category_id, language, name) VALUES
((SELECT id FROM item_categories WHERE slug='weapons'), 'ru', 'Оружие'),
((SELECT id FROM item_categories WHERE slug='armor'), 'ru', 'Броня'),
((SELECT id FROM item_categories WHERE slug='accessories'), 'ru', 'Аксессуары'),
((SELECT id FROM item_categories WHERE slug='consumables'), 'ru', 'Расходники'),
((SELECT id FROM item_categories WHERE slug='quest-items'), 'ru', 'Предметы квестов')
ON DUPLICATE KEY UPDATE name=name;

-- Вставка переводов категорий (английский)
INSERT INTO item_category_translations (category_id, language, name) VALUES
((SELECT id FROM item_categories WHERE slug='weapons'), 'en', 'Weapons'),
((SELECT id FROM item_categories WHERE slug='armor'), 'en', 'Armor'),
((SELECT id FROM item_categories WHERE slug='accessories'), 'en', 'Accessories'),
((SELECT id FROM item_categories WHERE slug='consumables'), 'en', 'Consumables'),
((SELECT id FROM item_categories WHERE slug='quest-items'), 'en', 'Quest Items')
ON DUPLICATE KEY UPDATE name=name;
