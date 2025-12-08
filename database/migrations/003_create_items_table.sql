-- Создание таблицы предметов (Items Database)
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL COMMENT 'URL-friendly идентификатор предмета',
    image_url VARCHAR(500) COMMENT 'Путь к изображению предмета',
    thumbnail_url VARCHAR(500) COMMENT 'Путь к миниатюре',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='База предметов игры (Items Database)';

-- Индексы для предметов
CREATE INDEX idx_items_slug ON items(slug);
CREATE INDEX idx_items_active ON items(is_active);

-- Таблица переводов предметов
CREATE TABLE IF NOT EXISTS item_translations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    language VARCHAR(5) NOT NULL,
    name VARCHAR(255) NOT NULL COMMENT 'Название предмета',
    description TEXT COMMENT 'Описание предмета',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_item_language (item_id, language),
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Переводы названий и описаний предметов';

-- Индексы для переводов предметов
CREATE INDEX idx_item_translations_item_id ON item_translations(item_id);
CREATE INDEX idx_item_translations_language ON item_translations(language);
