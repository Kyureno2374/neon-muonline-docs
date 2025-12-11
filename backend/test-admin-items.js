/**
 * Тестирование CRUD API для Items (админка)
 * Проверяет создание, чтение, обновление и удаление предметов
 */

import { createTestRunner } from './test-utils.js';

const BASE_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@neon-muonline.com';
const ADMIN_PASSWORD = 'admin123';

const runner = createTestRunner('CRUD API для Items');

let accessToken = '';
let createdItemId = null;

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

    // Test 2: Получение всех предметов
    runner.test('Получение всех предметов');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/items`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        runner.assert(success && data.success, 'Get items failed');
        runner.log(`Найдено предметов: ${data.data.length}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 3: Создание предмета
    runner.test('Создание нового предмета');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/items`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    slug: 'test-item-sword',
                    category: 'weapon'
                })
            },
            201
        );
        runner.assert(success && data.success, 'Create failed');
        createdItemId = data.data.id;
        runner.log(`Создан предмет ID: ${createdItemId}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 4: Попытка создать дубликат
    runner.test('Попытка создать дубликат slug (ожидается ошибка)');
    try {
        const { status } = await runner.request(
            `${BASE_URL}/admin/items`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    slug: 'test-item-sword',
                    category: 'weapon'
                })
            },
            409
        );
        runner.assert(status === 409, 'Expected 409 conflict error');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 5: Обновление предмета
    runner.test('Обновление предмета');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/items/${createdItemId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ category: 'armor' })
            }
        );
        runner.assert(success && data.success, 'Update failed');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 6: Создание перевода (RU)
    runner.test('Создание перевода предмета (RU)');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/items/${createdItemId}/translations`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    language: 'ru',
                    name: 'Тестовый меч',
                    description: 'Описание'
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
    runner.test('Создание перевода предмета (EN)');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/items/${createdItemId}/translations`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    language: 'en',
                    name: 'Test Sword',
                    description: 'Description'
                })
            },
            201
        );
        runner.assert(success && data.success, 'Translation create failed');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 8: Получение переводов
    runner.test('Получение всех переводов предмета');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/items/${createdItemId}/translations`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        runner.assert(success && data.success, 'Get translations failed');
        runner.log(`Найдено переводов: ${data.data.length}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 9: Обновление перевода
    runner.test('Обновление перевода предмета');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/items/${createdItemId}/translations/ru`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ name: 'Обновлённый тестовый меч' })
            }
        );
        runner.assert(success && data.success, 'Translation update failed');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 10: Удаление перевода
    runner.test('Удаление перевода предмета');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/items/${createdItemId}/translations/en`,
            {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }
        );
        runner.assert(success && data.success, 'Translation delete failed');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 11: Удаление предмета
    runner.test('Удаление предмета');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/items/${createdItemId}`,
            {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }
        );
        runner.assert(success && data.success, 'Item delete failed');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 12: Проверка что предмет удалён
    runner.test('Проверка что предмет удалён');
    try {
        const { status } = await runner.request(
            `${BASE_URL}/items/test-item-sword?lang=ru`,
            {},
            404
        );
        runner.assert(status === 404, 'Item still exists');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    const allPassed = runner.end();
    process.exit(allPassed ? 0 : 1);
}

runTests();
