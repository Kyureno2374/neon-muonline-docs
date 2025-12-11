/**
 * Тестирование CRUD API для Pages (админка)
 * Проверяет создание, чтение, обновление и удаление страниц
 */

import { createTestRunner } from './test-utils.js';

const BASE_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@neon-muonline.com';
const ADMIN_PASSWORD = 'admin123';

const runner = createTestRunner('CRUD API для Pages');

let accessToken = '';
let createdPageId = null;

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
                body: JSON.stringify({
                    email: ADMIN_EMAIL,
                    password: ADMIN_PASSWORD
                })
            }
        );
        runner.assert(success && data.success, 'Login failed');
        accessToken = data.data.tokens.accessToken;
        runner.log(`Авторизован: ${data.data.admin.email}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
        process.exit(1);
    }

    // Test 2: Проверка что страницы не существует
    runner.test('Проверка отсутствия тестовой страницы');
    try {
        const { data } = await runner.request(
            `${BASE_URL}/pages/test-page?lang=ru`,
            {},
            404
        );
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 3: Создание страницы
    runner.test('Создание новой страницы');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/pages`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    slug: 'test-page',
                    icon: '🧪'
                })
            },
            201
        );
        runner.assert(success && data.success, 'Create failed');
        runner.assert(data.data.id, 'No ID returned');
        createdPageId = data.data.id;
        runner.log(`Создана страница ID: ${createdPageId}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 4: Попытка создать дубликат (ожидается ошибка)
    runner.test('Попытка создать дубликат slug (ожидается ошибка)');
    try {
        const { status, data } = await runner.request(
            `${BASE_URL}/admin/pages`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    slug: 'test-page',
                    icon: '🧪'
                })
            },
            400
        );
        runner.assert(status === 400, 'Expected 400 error for duplicate');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 5: Обновление страницы
    runner.test('Обновление страницы');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/pages/${createdPageId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    icon: '✅'
                })
            }
        );
        runner.assert(success && data.success, 'Update failed');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 6: Создание перевода (RU)
    runner.test('Создание перевода страницы (RU)');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/pages/${createdPageId}/translations`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    language: 'ru',
                    name: 'Тестовая страница'
                })
            },
            201
        );
        runner.assert(success && data.success, 'Translation create failed');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 7: Создание перевода (EN)
    runner.test('Создание перевода страницы (EN)');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/pages/${createdPageId}/translations`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    language: 'en',
                    name: 'Test Page'
                })
            },
            201
        );
        runner.assert(success && data.success, 'Translation create failed');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 8: Получение всех переводов
    runner.test('Получение всех переводов страницы');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/pages/${createdPageId}/translations`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        runner.assert(success && data.success, 'Get translations failed');
        runner.assert(Array.isArray(data.data), 'Data is not array');
        runner.log(`Найдено переводов: ${data.data.length}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 9: Обновление перевода
    runner.test('Обновление перевода страницы');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/pages/${createdPageId}/translations/ru`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    name: 'Обновлённая тестовая страница'
                })
            }
        );
        runner.assert(success && data.success, 'Translation update failed');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 10: Удаление перевода
    runner.test('Удаление перевода страницы');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/pages/${createdPageId}/translations/en`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        runner.assert(success && data.success, 'Translation delete failed');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 11: Удаление страницы
    runner.test('Удаление страницы');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/pages/${createdPageId}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        runner.assert(success && data.success, 'Page delete failed');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 12: Проверка что страница удалена
    runner.test('Проверка что страница удалена');
    try {
        const { status } = await runner.request(
            `${BASE_URL}/pages/test-page?lang=ru`,
            {},
            404
        );
        runner.assert(status === 404, 'Page still exists');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    const allPassed = runner.end();
    process.exit(allPassed ? 0 : 1);
}

runTests();
