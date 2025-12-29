-- Добавление блоков к страницам (по 1-2 блока на каждую страницу)

-- Блоки для страницы "General information" (ID 2)
INSERT INTO blocks (page_id, block_type_id, sort_order, is_active) VALUES
(2, 1, 0, TRUE),  -- Text block
(2, 1, 1, TRUE)   -- Text block
ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Блоки для страницы "Characters" (ID 3)
INSERT INTO blocks (page_id, block_type_id, sort_order, is_active) VALUES
(3, 1, 0, TRUE),  -- Text block
(3, 2, 1, TRUE)   -- Picture block
ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Блоки для страницы "Game interface" (ID 4)
INSERT INTO blocks (page_id, block_type_id, sort_order, is_active) VALUES
(4, 1, 0, TRUE),  -- Text block
(4, 2, 1, TRUE)   -- Picture block
ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Блоки для страницы "Unique features" (ID 5)
INSERT INTO blocks (page_id, block_type_id, sort_order, is_active) VALUES
(5, 1, 0, TRUE),  -- Text block
(5, 3, 1, TRUE)   -- List block
ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Блоки для страницы "Crafting" (ID 6)
INSERT INTO blocks (page_id, block_type_id, sort_order, is_active) VALUES
(6, 1, 0, TRUE),  -- Text block
(6, 2, 1, TRUE)   -- Picture block
ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Блоки для страницы "Equipment" (ID 7)
INSERT INTO blocks (page_id, block_type_id, sort_order, is_active) VALUES
(7, 1, 0, TRUE),  -- Text block
(7, 3, 1, TRUE)   -- List block
ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Блоки для страницы "Monster info" (ID 8)
INSERT INTO blocks (page_id, block_type_id, sort_order, is_active) VALUES
(8, 1, 0, TRUE),  -- Text block
(8, 2, 1, TRUE)   -- Picture block
ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Блоки для страницы "Events" (ID 9)
INSERT INTO blocks (page_id, block_type_id, sort_order, is_active) VALUES
(9, 1, 0, TRUE),  -- Text block
(9, 1, 1, TRUE)   -- Text block
ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Блоки для страницы "Quests" (ID 10)
INSERT INTO blocks (page_id, block_type_id, sort_order, is_active) VALUES
(10, 1, 0, TRUE),  -- Text block
(10, 3, 1, TRUE)   -- List block
ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Блоки для страницы "Donate features" (ID 11)
INSERT INTO blocks (page_id, block_type_id, sort_order, is_active) VALUES
(11, 1, 0, TRUE),  -- Text block
(11, 3, 1, TRUE)   -- List block
ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);

-- Блоки для страницы "Help the server grow" (ID 12)
INSERT INTO blocks (page_id, block_type_id, sort_order, is_active) VALUES
(12, 1, 0, TRUE),  -- Text block
(12, 1, 1, TRUE)   -- Text block
ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order);
