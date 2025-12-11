/**
 * Тестирование логирования
 * Проверяет работу winston логирования auth и admin действий
 */

import { createTestRunner } from './test-utils.js';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@neon-muonline.com';
const ADMIN_PASSWORD = 'admin123';

const runner = createTestRunner('Логирование действий');

let accessToken = '';

/**
 * Прочитать логи из файла
 */
function readLogs(filename) {
    try {
        const logsPath = path.join(process.cwd(), 'logs', filename);
        const content = fs.readFileSync(logsPath, 'utf-8');
        const logs = content.trim().split('\n')
            .filter(line => line.trim())
            .map(line => JSON.parse(line));
        return logs;
    } catch (error) {
        return [];
    }
}

async function runTests() {
    runner.start();

    // Test 1: Неудачный вход (должен залогировать)
    runner.test('Логирование неудачной попытки входа');
    try {
        await runner.request(
            `${BASE_URL}/admin/auth/login`,
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
        runner.pass('Неудачная попытка отправлена');
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 2: Успешный вход (должен залогировать)
    runner.test('Логирование успешного входа');
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
        runner.pass('Успешный вход залогирован');
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 3: CRUD действие (должно залогировать)
    runner.test('Логирование CRUD действия');
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
                    slug: 'logging-test-page',
                    icon: '📊'
                })
            },
            201
        );
        runner.assert(success && data.success, 'Create failed');
        
        // Удаляем тестовую страницу
        await runner.request(
            `${BASE_URL}/admin/pages/${data.data.id}`,
            {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }
        );
        
        runner.pass('CRUD действие залогировано');
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 4: Выход (должен залогировать)
    runner.test('Логирование выхода');
    try {
        const { success, data } = await runner.request(
            `${BASE_URL}/admin/auth/logout`,
            {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }
        );
        runner.assert(success && data.success, 'Logout failed');
        runner.pass('Выход залогирован');
    } catch (error) {
        runner.fail(error.message);
    }

    // Даём время серверу записать логи
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 5: Проверка auth логов
    runner.test('Проверка наличия auth логов');
    try {
        const authLogs = readLogs(`auth-${new Date().toISOString().split('T')[0]}.log`);
        runner.assert(authLogs.length > 0, 'Auth logs are empty');
        runner.log(`Найдено записей auth: ${authLogs.length}`);
        
        const failedLogin = authLogs.find(log => log.action === 'LOGIN_ATTEMPT' && !log.success);
        runner.assert(failedLogin, 'No failed login logged');
        
        const successLogin = authLogs.find(log => log.action === 'LOGIN_ATTEMPT' && log.success);
        runner.assert(successLogin, 'No successful login logged');
        
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 6: Проверка admin логов
    runner.test('Проверка наличия admin логов');
    try {
        const adminLogs = readLogs(`admin-${new Date().toISOString().split('T')[0]}.log`);
        runner.assert(adminLogs.length > 0, 'Admin logs are empty');
        runner.log(`Найдено записей admin: ${adminLogs.length}`);
        
        const createAction = adminLogs.find(log => log.action === 'CREATE');
        runner.assert(createAction, 'No CREATE action logged');
        
        const deleteAction = adminLogs.find(log => log.action === 'DELETE');
        runner.assert(deleteAction, 'No DELETE action logged');
        
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    // Test 7: Проверка структуры логов
    runner.test('Проверка структуры логов');
    try {
        const authLogs = readLogs(`auth-${new Date().toISOString().split('T')[0]}.log`);
        const firstLog = authLogs[0];
        
        runner.assert(firstLog.timestamp, 'Timestamp missing');
        runner.assert(firstLog.action, 'Action missing');
        runner.assert(firstLog.email, 'Email missing');
        runner.assert(firstLog.level, 'Level missing');
        
        runner.log('Структура логов корректна');
        runner.pass();
    } catch (error) {
        runner.fail(error.message);
    }

    const allPassed = runner.end();
    process.exit(allPassed ? 0 : 1);
}

runTests();
