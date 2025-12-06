-- Таблица: languages (управление языками системы)
-- Хранит информацию обо всех доступных языках интерфейса

CREATE TABLE IF NOT EXISTS languages (
    code VARCHAR(5) PRIMARY KEY,                    -- Код языка (ISO 639-1): ru, en, de, fr и т.д.
    name_native VARCHAR(50) NOT NULL,               -- Название языка на родном языке (например: "Русский", "English")
    name_en VARCHAR(50) NOT NULL,                   -- Название языка по-английски (для админки)
    flag_emoji VARCHAR(10) DEFAULT '🌐',            -- Emoji флага страны (🇷🇺, 🇬🇧, 🇩🇪 и т.д.)
    is_active BOOLEAN DEFAULT TRUE,                 -- Активен ли язык (можно отключать без удаления)
    display_order INTEGER DEFAULT 0,                -- Порядок отображения в переключателе языков
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_languages_active ON languages(is_active);
CREATE INDEX IF NOT EXISTS idx_languages_order ON languages(display_order);

-- Комментарии к таблице и полям
COMMENT ON TABLE languages IS 'Список всех языков, доступных в системе';
COMMENT ON COLUMN languages.code IS 'ISO 639-1 код языка (2 символа) или комбинация язык-регион (en-US)';
COMMENT ON COLUMN languages.name_native IS 'Название языка на самом этом языке';
COMMENT ON COLUMN languages.name_en IS 'Название языка по-английски (для интерфейса админки)';
COMMENT ON COLUMN languages.flag_emoji IS 'Emoji флага для UI';
COMMENT ON COLUMN languages.is_active IS 'Если false - язык скрыт из переключателя, но переводы сохранены';
COMMENT ON COLUMN languages.display_order IS 'Порядок отображения в списке языков (меньше = выше)';

