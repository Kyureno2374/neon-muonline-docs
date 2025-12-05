-- Создание таблицы страниц
CREATE TABLE IF NOT EXISTS pages (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по slug
CREATE INDEX idx_pages_slug ON pages(slug);

-- Индекс для сортировки
CREATE INDEX idx_pages_sort_order ON pages(sort_order);

-- Индекс для активных страниц
CREATE INDEX idx_pages_active ON pages(is_active);

-- Таблица переводов страниц
CREATE TABLE IF NOT EXISTS page_translations (
    id SERIAL PRIMARY KEY,
    page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    language VARCHAR(5) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(page_id, language)
);

-- Индексы для переводов страниц
CREATE INDEX idx_page_translations_page_id ON page_translations(page_id);
CREATE INDEX idx_page_translations_language ON page_translations(language);

-- Комментарии
COMMENT ON TABLE pages IS 'Страницы сайта (General information, Characters, и т.д.)';
COMMENT ON TABLE page_translations IS 'Переводы названий страниц';
COMMENT ON COLUMN pages.slug IS 'URL-friendly идентификатор страницы';
COMMENT ON COLUMN pages.icon IS 'Иконка страницы (опционально)';
COMMENT ON COLUMN pages.sort_order IS 'Порядок отображения в боковой панели';

