-- Создание таблицы предметов (Items Database)
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    image_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для предметов
CREATE INDEX idx_items_slug ON items(slug);
CREATE INDEX idx_items_active ON items(is_active);

-- Таблица переводов предметов
CREATE TABLE IF NOT EXISTS item_translations (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    language VARCHAR(5) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_id, language)
);

-- Индексы для переводов предметов
CREATE INDEX idx_item_translations_item_id ON item_translations(item_id);
CREATE INDEX idx_item_translations_language ON item_translations(language);

-- Комментарии
COMMENT ON TABLE items IS 'База предметов игры (Items Database)';
COMMENT ON TABLE item_translations IS 'Переводы названий и описаний предметов';
COMMENT ON COLUMN items.slug IS 'URL-friendly идентификатор предмета';
COMMENT ON COLUMN items.image_url IS 'Путь к изображению предмета';
COMMENT ON COLUMN items.thumbnail_url IS 'Путь к миниатюре';
COMMENT ON COLUMN item_translations.name IS 'Название предмета';
COMMENT ON COLUMN item_translations.description IS 'Описание предмета';

