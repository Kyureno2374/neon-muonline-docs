-- Создание таблицы категорий предметов
CREATE TABLE IF NOT EXISTS item_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL COMMENT 'URL-friendly идентификатор категории',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Категории предметов';

-- Таблица переводов категорий
CREATE TABLE IF NOT EXISTS item_category_translations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    language VARCHAR(5) NOT NULL,
    name VARCHAR(255) NOT NULL COMMENT 'Название категории',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_category_language (category_id, language),
    FOREIGN KEY (category_id) REFERENCES item_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Переводы названий категорий';

-- Добавление поля category_id в таблицу items
ALTER TABLE items ADD COLUMN category_id INT COMMENT 'ID категории предмета' AFTER slug;
ALTER TABLE items ADD FOREIGN KEY (category_id) REFERENCES item_categories(id) ON DELETE SET NULL;
ALTER TABLE items ADD INDEX idx_items_category ON items(category_id);

-- Индексы для категорий
CREATE INDEX idx_item_categories_slug ON item_categories(slug);
CREATE INDEX idx_item_categories_active ON item_categories(is_active);
CREATE INDEX idx_item_category_translations_category_id ON item_category_translations(category_id);
CREATE INDEX idx_item_category_translations_language ON item_category_translations(language);
