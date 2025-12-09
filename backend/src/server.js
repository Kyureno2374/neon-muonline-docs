import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Загрузка переменных окружения
dotenv.config();

// Получение __dirname для ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Импорт middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// Импорт роутов
import pagesRouter from './routes/pages.js';
import itemsRouter from './routes/items.js';
import authRouter from './routes/auth.js';
import adminPagesRouter from './routes/admin/pages.js';
import adminBlocksRouter from './routes/admin/blocks.js';
import adminItemsRouter from './routes/admin/items.js';

// Создание Express приложения
const app = express();
const PORT = process.env.PORT || 3000;

// =====================================
// MIDDLEWARE
// =====================================

// CORS - разрешаем запросы с фронтенда
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Парсинг JSON и URL-encoded данных
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use(requestLogger);

// Статические файлы (загруженные изображения)
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// =====================================
// ROUTES
// =====================================

// Проверка здоровья API
app.get('/api/health', function healthCheck(req, res) {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API роуты
app.use('/api/pages', pagesRouter);
app.use('/api/items', itemsRouter);
app.use('/api/admin/auth', authRouter);
app.use('/api/admin', adminPagesRouter);
app.use('/api/admin', adminBlocksRouter);
app.use('/api/admin', adminItemsRouter);

// =====================================
// ERROR HANDLING
// =====================================

// 404 - роут не найден
app.use(notFoundHandler);

// Обработчик ошибок
app.use(errorHandler);

// =====================================
// SERVER START
// =====================================

app.listen(PORT, function serverStart() {
    console.log(`
╔════════════════════════════════════════╗
║   NEON MuOnline Guides API Server     ║
╚════════════════════════════════════════╝

🚀 Server running on port ${PORT}
📝 API endpoint: http://localhost:${PORT}/api
🏥 Health check: http://localhost:${PORT}/api/health
🌍 Environment: ${process.env.NODE_ENV || 'development'}

Press Ctrl+C to stop the server
    `);
});

// Graceful shutdown
process.on('SIGTERM', function handleSigterm() {
    console.log('\n🛑 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', function handleSigint() {
    console.log('\n🛑 SIGINT received, shutting down gracefully...');
    process.exit(0);
});

export default app;

