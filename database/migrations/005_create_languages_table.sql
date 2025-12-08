-- Таблица: languages (управление языками системы)
-- Хранит информацию обо всех доступных языках интерфейса

CREATE TABLE IF NOT EXISTS languages (
    code VARCHAR(5) PRIMARY KEY COMMENT 'ISO 639-1 код языка (2 символа) или комбинация язык-регион (en-US)',
    name_native VARCHAR(50) NOT NULL COMMENT 'Название языка на самом этом языке',
    name_en VARCHAR(50) NOT NULL COMMENT 'Название языка по-английски (для интерфейса админки)',
    flag_emoji VARCHAR(10) DEFAULT '🌐' COMMENT 'Emoji флага для UI',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Если false - язык скрыт из переключателя, но переводы сохранены',
    display_order INT DEFAULT 0 COMMENT 'Порядок отображения в списке языков (меньше = выше)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Список всех языков, доступных в системе';

-- Индексы
CREATE INDEX idx_languages_active ON languages(is_active);
CREATE INDEX idx_languages_order ON languages(display_order);
