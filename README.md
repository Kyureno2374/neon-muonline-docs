# neon-muonline-docs

Сайт с гайдами для игры MuOnline

## Структура проекта

```
NEON_MuOnline/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── uploads/
│   └── logs/
├── frontend/
│   ├── src/
│   │   ├── styles/
│   │   ├── scripts/
│   │   └── assets/
│   └── public/
├── database/
│   ├── migrations/
│   └── seeds/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Деплой

Проект будет развернут на поддомене: **guides.neon-mu.net**

## Мультиязычность 🌍

Система поддерживает множественные языки с возможностью добавления новых через админ-панель:
- 🇷🇺 Русский (ru) - по умолчанию
- 🇬🇧 Английский (en) - по умолчанию
- ➕ Администратор может добавлять любые другие языки (de, fr, es, pt, zh и т.д.)


**Текущий статус**: Этап 1.2 (База данных) ✅

