-- Создание таблицы типов блоков
CREATE TABLE IF NOT EXISTS block_types (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка базовых типов блоков
INSERT INTO block_types (slug, name, description) VALUES
('text', 'Text Block', 'Простой текстовый блок'),
('picture', 'Picture Block', 'Блок с изображением'),
('list', 'List Block', 'Блок со списком');

-- Создание таблицы блоков
CREATE TABLE IF NOT EXISTS blocks (
    id SERIAL PRIMARY KEY,
    page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    block_type_id INTEGER NOT NULL REFERENCES block_types(id),
    image_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для блоков
CREATE INDEX idx_blocks_page_id ON blocks(page_id);
CREATE INDEX idx_blocks_type ON blocks(block_type_id);
CREATE INDEX idx_blocks_sort_order ON blocks(sort_order);
CREATE INDEX idx_blocks_active ON blocks(is_active);

-- Таблица переводов блоков
CREATE TABLE IF NOT EXISTS block_translations (
    id SERIAL PRIMARY KEY,
    block_id INTEGER NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    language VARCHAR(5) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(block_id, language)
);

-- Индексы для переводов блоков
CREATE INDEX idx_block_translations_block_id ON block_translations(block_id);
CREATE INDEX idx_block_translations_language ON block_translations(language);

-- Комментарии
COMMENT ON TABLE block_types IS 'Типы блоков контента (text, picture, list)';
COMMENT ON TABLE blocks IS 'Блоки контента внутри страниц';
COMMENT ON TABLE block_translations IS 'Переводы содержимого блоков';
COMMENT ON COLUMN blocks.block_type_id IS 'Тип блока (text/picture/list)';
COMMENT ON COLUMN blocks.image_url IS 'URL изображения (для типа picture)';
COMMENT ON COLUMN blocks.sort_order IS 'Порядок отображения блока на странице';
COMMENT ON COLUMN block_translations.content IS 'Содержимое блока на конкретном языке';

