-- Создание таблицы страниц
CREATE TABLE IF NOT EXISTS pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL COMMENT 'URL-friendly идентификатор страницы',
    sort_order INT DEFAULT 0 COMMENT 'Порядок отображения в боковой панели',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Страницы сайта (General information, Characters, и т.д.)';

-- Индекс для быстрого поиска по slug
CREATE INDEX idx_pages_slug ON pages(slug);

-- Индекс для сортировки
CREATE INDEX idx_pages_sort_order ON pages(sort_order);

-- Индекс для активных страниц
CREATE INDEX idx_pages_active ON pages(is_active);

-- Таблица переводов страниц
CREATE TABLE IF NOT EXISTS page_translations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page_id INT NOT NULL,
    language VARCHAR(5) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_page_language (page_id, language),
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Переводы названий страниц';

-- Индексы для переводов страниц
CREATE INDEX idx_page_translations_page_id ON page_translations(page_id);
CREATE INDEX idx_page_translations_language ON page_translations(language);
