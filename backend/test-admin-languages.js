/**
 * Тестирование CRUD API для Languages (админка)
 * Проверяет создание, чтение, обновление и удаление языков
 */

import { createTestRunner } from './test-utils.js';

const BASE_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@neon-muonline.com';
const ADMIN_PASSWORD = 'admin123';

const runner = createTestRunner('CRUD API для Languages');

let accessToken = '';

async function runTests() {
    runner.start();

    // Test 1: Авторизация
    runner.test('Авторизация');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/auth/login`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
            }
        );
        runner.assert(success && data.success, 'Login failed');
        accessToken = data.data.tokens.accessToken;
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
        process.exit(1);
    }

    // Test 2: Получение всех языков
    runner.test('Получение всех языков');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/languages`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        runner.assert(success && data.success, 'Get languages failed');
        runner.log(`Найдено языков: ${data.data.length}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 3: Создание нового языка
    runner.test('Создание нового языка');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/languages`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    code: 'de',
                    name_en: 'German',
                    name_native: 'Deutsch',
                    flag_emoji: '🇩🇪'
                })
            },
            201
        );
        runner.assert(success && data.success, 'Create failed');
        runner.log(`Создан язык: ${data.data.code}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 4: Попытка создать дубликат
    runner.test('Попытка создать дубликат кода (ожидается ошибка)');
    try {
        const { status } = await runner.request(
            `${BASE_URL}/admin/languages`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    code: 'de',
                    name_en: 'German',
                    name_native: 'Deutsch',
                    flag_emoji: '🇩🇪'
                })
            },
            409
        );
        runner.assert(status === 409, 'Expected 409 conflict error');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 5: Получение языка по коду
    runner.test('Получение языка по коду');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/languages/de`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        runner.assert(success && data.success, 'Get language failed');
        runner.assert(data.data.code === 'de', 'Wrong language code');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 6: Обновление языка
    runner.test('Обновление языка');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/languages/de`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ display_order: 10 })
            }
        );
        runner.assert(success && data.success, 'Update failed');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 7: Деактивация языка
    runner.test('Деактивация языка');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/languages/de/toggle`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ is_active: false })
            }
        );
        runner.assert(success && data.success, 'Toggle failed');
        runner.log(`Язык активен: ${data.data.is_active}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 8: Активация языка
    runner.test('Активация языка');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/languages/de/toggle`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ is_active: true })
            }
        );
        runner.assert(success && data.success, 'Toggle failed');
        runner.log(`Язык активен: ${data.data.is_active}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 9: Получение статистики языка
    runner.test('Получение статистики языка');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/languages/de/stats`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        runner.assert(success && data.success, 'Get stats failed');
        runner.log(`Переводов страниц: ${data.data.pages_count}`);
        runner.log(`Переводов блоков: ${data.data.blocks_count}`);
        runner.log(`Переводов предметов: ${data.data.items_count}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 10: Удаление языка
    runner.test('Удаление языка');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/languages/de`,
            {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }
        );
        runner.assert(success && data.success, 'Delete failed');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 11: Проверка что язык удалён
    runner.test('Проверка что язык удалён');
    try {
        const { status } = await runner.request(
            `${BASE_URL}/admin/languages/de`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } },
            404
        );
        runner.assert(status === 404, 'Language still exists');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    const allPassed = runner.end();
    process.exit(allPassed ? 0 : 1);
}

runTests();
