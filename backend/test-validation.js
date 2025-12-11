/**
 * Тестирование валидации и обработки ошибок
 * Проверяет работу validation middleware и error handling
 */

import { createTestRunner } from './test-utils.js';

const BASE_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@neon-muonline.com';
const ADMIN_PASSWORD = 'admin123';

const runner = createTestRunner('Валидация и обработка ошибок');

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

    // Test 2: Невалидный slug
    runner.test('Создание страницы с невалидным slug (ожидается ошибка)');
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
                    slug: 'Invalid Slug!',
                    icon: '📝'
                })
            },
            400
        );
        runner.assert(status === 400, 'Expected 400 error');
        runner.assert(!data.success, 'Response should not be successful');
        runner.log(`Ошибка: ${data.error.message}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 3: Отсутствующие поля
    runner.test('Создание страницы без обязательных полей (ожидается ошибка)');
    try {
        const { status, data } = await runner.request(
            `${BASE_URL}/admin/pages`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({})
            },
            400
        );
        runner.assert(status === 400, 'Expected 400 error');
        runner.log(`Ошибка: ${data.error.message}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 4: Невалидный код языка
    runner.test('Создание перевода с невалидным кодом языка (ожидается ошибка)');
    try {
        const { status, data } = await runner.request(
            `${BASE_URL}/admin/pages/1/translations`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    language: 'invalid-lang-code-123',
                    name: 'Test'
                })
            },
            400
        );
        runner.assert(status === 400, 'Expected 400 error');
        runner.log(`Ошибка: ${data.error.message}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 5: Слишком длинный текст
    runner.test('Создание языка со слишком длинным названием (ожидается ошибка)');
    try {
        const { status, data } = await runner.request(
            `${BASE_URL}/admin/languages`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    code: 'zz',
                    name_en: 'A'.repeat(200),
                    name_native: 'Test',
                    flag_emoji: '🏳️'
                })
            },
            400
        );
        runner.assert(status === 400, 'Expected 400 error');
        runner.log(`Ошибка: ${data.error.message}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 6: Невалидный ID
    runner.test('Получение страницы с невалидным ID (ожидается ошибка)');
    try {
        const { status, data } = await runner.request(
            `${BASE_URL}/admin/pages/abc`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ icon: '🔥' })
            },
            400
        );
        runner.assert(status === 400, 'Expected 400 error');
        runner.log(`Ошибка: ${data.error.message}`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 7: Проверка структуры ответа об ошибке
    runner.test('Проверка структуры ошибки в ответе');
    try {
        const { status, data } = await runner.request(
            `${BASE_URL}/admin/pages`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ slug: 'a' })
            },
            400
        );
        runner.assert(status === 400, 'Expected 400 status');
        runner.assert(data.success === false, 'Success should be false');
        runner.assert(data.error, 'Error object missing');
        runner.assert(data.error.message, 'Error message missing');
        runner.assert(data.error.code, 'Error code missing');
        runner.log(`Структура ответа корректна`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    const allPassed = runner.end();
    process.exit(allPassed ? 0 : 1);
}

runTests();
