/**
 * Тестирование публичных API эндпоинтов
 * Проверяет READ операции для Pages и Items
 */

import { createTestRunner } from './test-utils.js';

const BASE_URL = 'http://localhost:3000/api';
const runner = createTestRunner('Тестирование публичных API');

async function runTests() {
    runner.start();

    // Test 1: Health Check
    runner.test('Health Check');
    try {
        const { success, data } = await runner.request(`${BASE_URL}/health`);
        runner.assert(success, 'Health check failed');
        runner.assert(data.status === 'ok', 'Status is not ok');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 2: Get All Pages (RU)
    runner.test('Получить все страницы (RU)');
    try {
        const { success, data } = await runner.request(`${BASE_URL}/pages?lang=ru`);
        runner.assert(success, 'Request failed');
        runner.assert(data.success, 'Response not successful');
        runner.assert(Array.isArray(data.data), 'Data is not array');
        runner.log(`Найдено страниц: ${data.data.length}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 3: Get All Pages (EN)
    runner.test('Получить все страницы (EN)');
    try {
        const { success, data } = await runner.request(`${BASE_URL}/pages?lang=en`);
        runner.assert(success, 'Request failed');
        runner.assert(data.success, 'Response not successful');
        runner.assert(Array.isArray(data.data), 'Data is not array');
        runner.log(`Найдено страниц: ${data.data.length}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 4: Get Single Page
    runner.test('Получить страницу по slug');
    try {
        const { success, data } = await runner.request(`${BASE_URL}/pages/main?lang=ru`);
        runner.assert(success, 'Request failed');
        runner.assert(data.success, 'Response not successful');
        runner.assert(data.data.slug === 'main', 'Wrong page returned');
        runner.log(`Страница: ${data.data.name}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 5: Get Page Blocks
    runner.test('Получить блоки страницы');
    try {
        const { success, data } = await runner.request(`${BASE_URL}/pages/main/blocks?lang=ru`);
        runner.assert(success, 'Request failed');
        runner.assert(data.success, 'Response not successful');
        runner.assert(Array.isArray(data.data), 'Data is not array');
        runner.log(`Найдено блоков: ${data.data.length}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 6: Get Non-existent Page (should 404)
    runner.test('Получить несуществующую страницу (ожидается 404)');
    try {
        const { success, status, data } = await runner.request(
            `${BASE_URL}/pages/non-existent?lang=ru`,
            {},
            404
        );
        runner.assert(success, 'Expected 404 status');
        runner.assert(!data.success, 'Response should not be successful');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 7: Get All Items (RU)
    runner.test('Получить все предметы (RU)');
    try {
        const { success, data } = await runner.request(`${BASE_URL}/items?lang=ru`);
        runner.assert(success, 'Request failed');
        runner.assert(data.success, 'Response not successful');
        runner.assert(Array.isArray(data.data), 'Data is not array');
        runner.log(`Найдено предметов: ${data.data.length}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 8: Get Item by Slug
    runner.test('Получить предмет по slug');
    try {
        const { success, data } = await runner.request(`${BASE_URL}/items/excalibur-sword?lang=ru`);
        runner.assert(success, 'Request failed');
        runner.assert(data.success, 'Response not successful');
        runner.assert(data.data.slug === 'excalibur-sword', 'Wrong item returned');
        runner.log(`Предмет: ${data.data.name}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 9: Search Items
    runner.test('Поиск предметов');
    try {
        const { success, data } = await runner.request(`${BASE_URL}/items?search=excalibur&lang=ru`);
        runner.assert(success, 'Request failed');
        runner.assert(data.success, 'Response not successful');
        runner.assert(Array.isArray(data.data), 'Data is not array');
        runner.log(`Найдено: ${data.data.length} предметов`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 10: Get Items with Pagination
    runner.test('Получить предметы с пагинацией');
    try {
        const { success, data } = await runner.request(`${BASE_URL}/items?page=1&limit=5&lang=ru`);
        runner.assert(success, 'Request failed');
        runner.assert(data.success, 'Response not successful');
        runner.assert(Array.isArray(data.data), 'Data is not array');
        runner.assert(data.data.length <= 5, 'Limit not respected');
        runner.log(`Получено: ${data.data.length} предметов`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    const allPassed = runner.end();
    process.exit(allPassed ? 0 : 1);
}

runTests();
