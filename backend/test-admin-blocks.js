/**
 * Тестирование CRUD API для Blocks (админка)
 * Проверяет создание, чтение, обновление и удаление блоков
 */

import { createTestRunner } from './test-utils.js';

const BASE_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@neon-muonline.com';
const ADMIN_PASSWORD = 'admin123';

const runner = createTestRunner('CRUD API для Blocks');

let accessToken = '';
let createdBlockId = null;

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

    // Test 2: Получение всех блоков
    runner.test('Получение всех блоков');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/blocks`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        runner.assert(success && data.success, 'Get blocks failed');
        runner.log(`Найдено блоков: ${data.data.length}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 3: Создание блока
    runner.test('Создание нового блока');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/blocks`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    page_id: 1,
                    block_type_id: 1,
                    sort_order: 999
                })
            },
            201
        );
        runner.assert(success && data.success, 'Create failed');
        createdBlockId = data.data.id;
        runner.log(`Создан блок ID: ${createdBlockId}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 4: Получение блока по ID
    runner.test('Получение блока по ID');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/blocks/${createdBlockId}`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        runner.assert(success && data.success, 'Get block failed');
        runner.assert(data.data.id === createdBlockId, 'Wrong block ID');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 5: Обновление блока
    runner.test('Обновление блока');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/blocks/${createdBlockId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ sort_order: 1000 })
            }
        );
        runner.assert(success && data.success, 'Update failed');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 6: Создание перевода (RU)
    runner.test('Создание перевода блока (RU)');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/blocks/${createdBlockId}/translations`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    language: 'ru',
                    title: 'Тестовый блок',
                    content: 'Содержимое'
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
    runner.test('Создание перевода блока (EN)');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/blocks/${createdBlockId}/translations`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    language: 'en',
                    title: 'Test Block',
                    content: 'Content'
                })
            },
            201
        );
        runner.assert(success && data.success, 'Translation create failed');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 8: Получение переводов блока
    runner.test('Получение всех переводов блока');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/blocks/${createdBlockId}/translations`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        runner.assert(success && data.success, 'Get translations failed');
        runner.log(`Найдено переводов: ${data.data.length}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 9: Обновление перевода
    runner.test('Обновление перевода блока');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/blocks/${createdBlockId}/translations/ru`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ content: 'Обновлённое содержимое' })
            }
        );
        runner.assert(success && data.success, 'Translation update failed');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 10: Удаление перевода
    runner.test('Удаление перевода блока');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/blocks/${createdBlockId}/translations/en`,
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

    // Test 11: Удаление блока
    runner.test('Удаление блока');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/blocks/${createdBlockId}`,
            {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }
        );
        runner.assert(success && data.success, 'Block delete failed');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 12: Проверка что блок удалён
    runner.test('Проверка что блок удалён');
    try {
        const { status } = await runner.request(
            `${BASE_URL}/admin/blocks/${createdBlockId}`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } },
            404
        );
        runner.assert(status === 404, 'Block still exists');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    const allPassed = runner.end();
    process.exit(allPassed ? 0 : 1);
}

runTests();
