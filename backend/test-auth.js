/**
 * Тестирование аутентификации
 * Проверяет все эндпоинты /api/admin/auth/*
 */

import { createTestRunner } from './test-utils.js';

const BASE_URL = 'http://localhost:3000/api/admin/auth';
const ADMIN_EMAIL = 'admin@neon-muonline.com';
const ADMIN_PASSWORD = 'admin123';

const runner = createTestRunner('Тестирование аутентификации');

let accessToken = '';
let refreshToken = '';

async function runTests() {
    runner.start();

    // Test 1: Неправильный пароль
    runner.test('Вход с неправильным паролем (ожидается 401)');
    try {
        const { success, status } = await runner.request(
            `${BASE_URL}/login`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: ADMIN_EMAIL,
                    password: 'wrongpassword'
                })
            },
            401
        );
        runner.assert(success, 'Expected 401 status');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 2: Несуществующий email
    runner.test('Вход с несуществующим email (ожидается 401)');
    try {
        const { success } = await runner.request(
            `${BASE_URL}/login`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'nonexistent@example.com',
                    password: 'anypassword'
                })
            },
            401
        );
        runner.assert(success, 'Expected 401 status');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 3: Без пароля
    runner.test('Вход без пароля (ожидается 400)');
    try {
        const { success } = await runner.request(
            `${BASE_URL}/login`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: ADMIN_EMAIL
                })
            },
            400
        );
        runner.assert(success, 'Expected 400 status');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 4: Успешный вход
    runner.test('Успешный вход');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/login`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: ADMIN_EMAIL,
                    password: ADMIN_PASSWORD
                })
            }
        );
        runner.assert(success, 'Login failed');
        runner.assert(data.success, 'Response not successful');
        runner.assert(data.data.tokens, 'Tokens missing');
        runner.assert(data.data.tokens.accessToken, 'Access token missing');
        runner.assert(data.data.tokens.refreshToken, 'Refresh token missing');

        accessToken = data.data.tokens.accessToken;
        refreshToken = data.data.tokens.refreshToken;

        runner.log(`Admin: ${data.data.admin.email}`);
        runner.log(`Access Token: ${accessToken.substring(0, 20)}...`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 5: Получение текущего админа
    runner.test('Получить данные текущего админа');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/me`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        runner.assert(success, 'Request failed');
        runner.assert(data.success, 'Response not successful');
        runner.assert(data.data.email === ADMIN_EMAIL, 'Wrong admin returned');
        runner.log(`Admin: ${data.data.name} (${data.data.email})`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 6: /me без токена (ожидается 401)
    runner.test('/me без токена (ожидается 401)');
    try {
        const { success } = await runner.request(
            `${BASE_URL}/me`,
            {},
            401
        );
        runner.assert(success, 'Expected 401 status');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 7: /me с неверным токеном (ожидается 401)
    runner.test('/me с неверным токеном (ожидается 401)');
    try {
        const { success } = await runner.request(
            `${BASE_URL}/me`,
            {
                headers: {
                    'Authorization': 'Bearer invalid-token-here'
                }
            },
            401
        );
        runner.assert(success, 'Expected 401 status');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 8: Обновление access token
    runner.test('Обновление access token через refresh token');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/refresh`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    refreshToken: refreshToken
                })
            }
        );
        runner.assert(success, 'Refresh failed');
        runner.assert(data.success, 'Response not successful');
        runner.assert(data.data.accessToken, 'New access token missing');

        const oldToken = accessToken;
        accessToken = data.data.accessToken;

        runner.log(`Старый token: ${oldToken.substring(0, 20)}...`);
        runner.log(`Новый token: ${accessToken.substring(0, 20)}...`);
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 9: Refresh с неверным токеном
    runner.test('Refresh с неверным токеном (ожидается 401)');
    try {
        const { success } = await runner.request(
            `${BASE_URL}/refresh`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    refreshToken: 'invalid-refresh-token'
                })
            },
            401
        );
        runner.assert(success, 'Expected 401 status');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 10: Выход из системы
    runner.test('Выход из системы');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/logout`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        runner.assert(success, 'Logout failed');
        runner.assert(data.success, 'Response not successful');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 11: Logout без токена (ожидается 401)
    runner.test('Logout без токена (ожидается 401)');
    try {
        const { success } = await runner.request(
            `${BASE_URL}/logout`,
            {
                method: 'POST'
            },
            401
        );
        runner.assert(success, 'Expected 401 status');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    const allPassed = runner.end();
    process.exit(allPassed ? 0 : 1);
}

runTests();
