-- Seed: начальные языки системы
-- Добавляем RU и EN как базовые языки

INSERT INTO languages (code, name_native, name_en, flag_emoji, is_active, display_order) VALUES
('ru', 'Русский', 'Russian', '🇷🇺', TRUE, 1),
('en', 'English', 'English', '🇬🇧', TRUE, 2)
ON CONFLICT (code) DO NOTHING;

-- Примеры других популярных языков (закомментированы, можно добавить через админку):
-- ('de', 'Deutsch', 'German', '🇩🇪', FALSE, 3),
-- ('fr', 'Français', 'French', '🇫🇷', FALSE, 4),
-- ('es', 'Español', 'Spanish', '🇪🇸', FALSE, 5),
-- ('pt', 'Português', 'Portuguese', '🇵🇹', FALSE, 6),
-- ('zh', '中文', 'Chinese', '🇨🇳', FALSE, 7),
-- ('ja', '日本語', 'Japanese', '🇯🇵', FALSE, 8),
-- ('ko', '한국어', 'Korean', '🇰🇷', FALSE, 9),
-- ('tr', 'Türkçe', 'Turkish', '🇹🇷', FALSE, 10),
-- ('pl', 'Polski', 'Polish', '🇵🇱', FALSE, 11);

