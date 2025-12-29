-- Добавление контента блоков на русском и английском

-- GENERAL INFORMATION (Page ID 2)
-- Block 1 - Text (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(1, 'ru', '<p><strong>Клиент:</strong> MUs6</p><p><strong>Классы:</strong> Dark Wizard, Dark Knight, Elf, Magic Gladiator, Dark Lord, Summoner</p><p><strong>Exp Rate:</strong> Medium</p><p><strong>Zodiac Exp Rate:</strong> Medium</p><p><strong>Drop Rate:</strong> Low</p><p><strong>Zen Drop Rate:</strong> Medium</p><p><strong>Max Reset:</strong> 1000</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 1 - Text (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(1, 'en', '<p><strong>Client:</strong> MUs6</p><p><strong>Classes:</strong> Dark Wizard, Dark Knight, Elf, Magic Gladiator, Dark Lord, Summoner</p><p><strong>Exp Rate:</strong> Medium</p><p><strong>Zodiac Exp Rate:</strong> Medium</p><p><strong>Drop Rate:</strong> Low</p><p><strong>Zen Drop Rate:</strong> Medium</p><p><strong>Max Reset:</strong> 1000</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 2 - Text (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(2, 'ru', '<p><strong>Max points by resets 0 - 100:</strong> 171397</p><p><strong>Max points by resets 101 - 1000:</strong> 90000</p><p><strong>Max points from class quests:</strong> 9500</p><p><strong>Max points from Noria quests:</strong> 33100</p><p><strong>Max points per Zodiac levels:</strong> 50000</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 2 - Text (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(2, 'en', '<p><strong>Max points by resets 0 - 100:</strong> 171397</p><p><strong>Max points by resets 101 - 1000:</strong> 90000</p><p><strong>Max points from class quests:</strong> 9500</p><p><strong>Max points from Noria quests:</strong> 33100</p><p><strong>Max points per Zodiac levels:</strong> 50000</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- CHARACTERS (Page ID 3)
-- Block 3 - Text (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(3, 'ru', '<p>На сервере доступны 6 классов персонажей, каждый с уникальными способностями и стилем игры. Выберите класс, который вам нравится, и начните свое приключение!</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 3 - Text (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(3, 'en', '<p>The server features 6 character classes, each with unique abilities and playstyle. Choose the class you like and start your adventure!</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 4 - Picture (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(4, 'ru', 'Изображение персонажей')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 4 - Picture (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(4, 'en', 'Character image')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- GAME INTERFACE (Page ID 4)
-- Block 5 - Text (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(5, 'ru', '<p>Интерфейс игры разработан для удобства и интуитивности. Все необходимые функции легко доступны и понятны даже новичкам.</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 5 - Text (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(5, 'en', '<p>The game interface is designed for convenience and intuitiveness. All necessary functions are easily accessible and understandable even for beginners.</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 6 - Picture (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(6, 'ru', 'Скриншот интерфейса')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 6 - Picture (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(6, 'en', 'Interface screenshot')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- UNIQUE FEATURES (Page ID 5)
-- Block 7 - Text (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(7, 'ru', '<p>Наш сервер имеет множество уникальных особенностей, которые делают его отличным от других серверов MuOnline.</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 7 - Text (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(7, 'en', '<p>Our server has many unique features that make it different from other MuOnline servers.</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 8 - List (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(8, 'ru', '<ul><li>Система Equalizer для новых игроков</li><li>Автоматический Reset для Premium игроков</li><li>Система Zodiac уровней</li><li>Специальные события каждую неделю</li></ul>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 8 - List (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(8, 'en', '<ul><li>Equalizer system for new players</li><li>Automatic Reset for Premium players</li><li>Zodiac level system</li><li>Special events every week</li></ul>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- CRAFTING (Page ID 6)
-- Block 9 - Text (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(9, 'ru', '<p>Система крафта позволяет вам создавать мощное снаряжение из материалов, найденных в игре. Комбинируйте различные ингредиенты для получения уникальных предметов.</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 9 - Text (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(9, 'en', '<p>The crafting system allows you to create powerful equipment from materials found in the game. Combine different ingredients to get unique items.</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 10 - Picture (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(10, 'ru', 'Интерфейс крафта')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 10 - Picture (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(10, 'en', 'Crafting interface')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- EQUIPMENT (Page ID 7)
-- Block 11 - Text (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(11, 'ru', '<p>Снаряжение играет ключевую роль в развитии вашего персонажа. Собирайте комплеты для получения бонусов и становитесь сильнее.</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 11 - Text (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(11, 'en', '<p>Equipment plays a key role in your character development. Collect sets to get bonuses and become stronger.</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 12 - List (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(12, 'ru', '<ul><li>Оружие: мечи, посохи, луки</li><li>Броня: шлемы, нагрудники, перчатки, ботинки</li><li>Аксессуары: кольца, амулеты</li><li>Специальные предметы: крылья, ауры</li></ul>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 12 - List (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(12, 'en', '<ul><li>Weapons: swords, staffs, bows</li><li>Armor: helmets, breastplates, gloves, boots</li><li>Accessories: rings, amulets</li><li>Special items: wings, auras</li></ul>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- MONSTER INFO (Page ID 8)
-- Block 13 - Text (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(13, 'ru', '<p>На сервере обитает множество монстров различной сложности. Каждый монстр имеет свои характеристики, добычу и опыт.</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 13 - Text (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(13, 'en', '<p>The server is inhabited by many monsters of varying difficulty. Each monster has its own characteristics, loot, and experience.</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 14 - Picture (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(14, 'ru', 'Информация о монстрах')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 14 - Picture (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(14, 'en', 'Monster information')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- EVENTS (Page ID 9)
-- Block 15 - Text (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(15, 'ru', '<p>На сервере регулярно проводятся события, которые дают игрокам возможность получить редкие предметы и большой опыт.</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 15 - Text (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(15, 'en', '<p>The server regularly hosts events that give players the opportunity to get rare items and great experience.</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 16 - Text (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(16, 'ru', '<p><strong>Еженедельные события:</strong> Bosses, Invasions, Treasure Hunts</p><p><strong>Сезонные события:</strong> Праздничные мероприятия, специальные квесты</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 16 - Text (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(16, 'en', '<p><strong>Weekly events:</strong> Bosses, Invasions, Treasure Hunts</p><p><strong>Seasonal events:</strong> Holiday events, special quests</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- QUESTS (Page ID 10)
-- Block 17 - Text (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(17, 'ru', '<p>Квесты - это основной способ получения опыта и наград. Выполняйте задания от NPC и получайте ценные награды.</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 17 - Text (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(17, 'en', '<p>Quests are the main way to gain experience and rewards. Complete tasks from NPCs and receive valuable rewards.</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 18 - List (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(18, 'ru', '<ul><li>Классовые квесты: уникальные для каждого класса</li><li>Квесты Noria: специальные задания</li><li>Ежедневные квесты: повторяющиеся задания</li><li>Квесты мастера: сложные испытания</li></ul>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 18 - List (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(18, 'en', '<ul><li>Class quests: unique for each class</li><li>Noria quests: special tasks</li><li>Daily quests: repeating tasks</li><li>Master quests: challenging trials</li></ul>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- DONATE FEATURES (Page ID 11)
-- Block 19 - Text (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(19, 'ru', '<p>Premium подписка дает вам доступ к эксклюзивным возможностям и удобствам, которые сделают вашу игру еще более приятной.</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 19 - Text (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(19, 'en', '<p>Premium subscription gives you access to exclusive features and conveniences that will make your game even more enjoyable.</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 20 - List (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(20, 'ru', '<ul><li>Автоматический Reset</li><li>Увеличенный Drop Rate</li><li>Дополнительные слоты инвентаря</li><li>Приватный магазин</li><li>Ускоренное восстановление маны</li></ul>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 20 - List (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(20, 'en', '<ul><li>Automatic Reset</li><li>Increased Drop Rate</li><li>Additional inventory slots</li><li>Private shop</li><li>Faster mana recovery</li></ul>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- HELP THE SERVER GROW (Page ID 12)
-- Block 21 - Text (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(21, 'ru', '<p>Помогите серверу расти! Приглашайте друзей, делитесь впечатлениями и участвуйте в жизни сообщества.</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 21 - Text (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(21, 'en', '<p>Help the server grow! Invite friends, share your impressions, and participate in the community.</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 22 - Text (RU)
INSERT INTO block_translations (block_id, language, content) VALUES
(22, 'ru', '<p><strong>Способы помощи:</strong></p><p>• Пригласите друзей на сервер</p><p>• Оставьте отзыв на форумах</p><p>• Поддержите сервер донатом</p><p>• Помогите новичкам советами</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- Block 22 - Text (EN)
INSERT INTO block_translations (block_id, language, content) VALUES
(22, 'en', '<p><strong>Ways to help:</strong></p><p>• Invite friends to the server</p><p>• Leave a review on forums</p><p>• Support the server with a donation</p><p>• Help newcomers with advice</p>')
ON DUPLICATE KEY UPDATE content = VALUES(content);
