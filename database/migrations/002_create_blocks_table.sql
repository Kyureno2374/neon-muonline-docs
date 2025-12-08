-- Создание таблицы типов блоков
CREATE TABLE IF NOT EXISTS block_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Типы блоков контента (text, picture, list)';

-- Вставка базовых типов блоков
INSERT INTO block_types (slug, name, description) VALUES
('text', 'Text Block', 'Простой текстовый блок'),
('picture', 'Picture Block', 'Блок с изображением'),
('list', 'List Block', 'Блок со списком')
ON DUPLICATE KEY UPDATE slug=slug;

-- Создание таблицы блоков
CREATE TABLE IF NOT EXISTS blocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_id INT NOT NULL COMMENT 'ID страницы',
    block_type_id INT NOT NULL COMMENT 'Тип блока (text/picture/list)',
    image_url VARCHAR(500) COMMENT 'URL изображения (для типа picture)',
    thumbnail_url VARCHAR(500),
    sort_order INT DEFAULT 0 COMMENT 'Порядок отображения блока на странице',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    FOREIGN KEY (block_type_id) REFERENCES block_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Блоки контента внутри страниц';

-- Индексы для блоков
CREATE INDEX idx_blocks_page_id ON blocks(page_id);
CREATE INDEX idx_blocks_type ON blocks(block_type_id);
CREATE INDEX idx_blocks_sort_order ON blocks(sort_order);
CREATE INDEX idx_blocks_active ON blocks(is_active);

-- Таблица переводов блоков
CREATE TABLE IF NOT EXISTS block_translations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    block_id INT NOT NULL,
    language VARCHAR(5) NOT NULL,
    content TEXT NOT NULL COMMENT 'Содержимое блока на конкретном языке',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_block_language (block_id, language),
    FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Переводы содержимого блоков';

-- Индексы для переводов блоков
CREATE INDEX idx_block_translations_block_id ON block_translations(block_id);
CREATE INDEX idx_block_translations_language ON block_translations(language);
