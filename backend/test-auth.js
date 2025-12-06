/**
 * Скрипт для тестирования аутентификации
 * Проверяет все эндпоинты /api/admin/auth/*
 */

const BASE_URL = 'http://localhost:3000/api/admin/auth';

// Цвета для консоли
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    reset: '\x1b[0m'
};

// Переменные для хранения токенов
let accessToken = '';
let refreshToken = '';

// Счетчики
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Функция для выполнения HTTP запроса
 */
async function testEndpoint(name, url, options = {}, expectedStatus = 200) {
    totalTests++;
    
    try {
        console.log(`\n${colors.blue}Testing:${colors.reset} ${name}`);
        console.log(`${colors.yellow}URL:${colors.reset} ${url}`);
        if (options.body) {
            console.log(`${colors.yellow}Body:${colors.reset}`, JSON.parse(options.body));
        }
        
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (response.status === expectedStatus) {
            console.log(`${colors.green}✓ PASS${colors.reset} - Status: ${response.status}`);
            console.log(`Response:`, JSON.stringify(data, null, 2).substring(0, 300) + '...');
            passedTests++;
            return { success: true, data, status: response.status };
        } else {
            console.log(`${colors.red}✗ FAIL${colors.reset} - Expected: ${expectedStatus}, Got: ${response.status}`);
            console.log(`Response:`, data);
            failedTests++;
            return { success: false, data, status: response.status };
        }
    } catch (error) {
        console.log(`${colors.red}✗ ERROR${colors.reset} - ${error.message}`);
        failedTests++;
        return { success: false, error: error.message };
    }
}

/**
 * Главная функция тестирования
 */
async function runAuthTests() {
    console.log(`
╔════════════════════════════════════════╗
║   Authentication Testing Script        ║
╚════════════════════════════════════════╝
    `);

    // =====================================
    // 1. Тест неудачного логина (неправильный пароль)
    // =====================================
    console.log('\n' + colors.yellow + '='.repeat(50) + colors.reset);
    console.log(colors.yellow + '1. FAILED LOGIN TESTS' + colors.reset);
    console.log(colors.yellow + '='.repeat(50) + colors.reset);
    
    await testEndpoint(
        'Login with wrong password',
        `${BASE_URL}/login`,
        {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@neon-muonline.com',
                password: 'wrongpassword'
            })
        },
        401
    );

    await testEndpoint(
        'Login with non-existent email',
        `${BASE_URL}/login`,
        {
            method: 'POST',
            body: JSON.stringify({
                email: 'nonexistent@example.com',
                password: 'anypassword'
            })
        },
        401
    );

    await testEndpoint(
        'Login without password',
        `${BASE_URL}/login`,
        {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@neon-muonline.com'
            })
        },
        400
    );

    // =====================================
    // 2. Тест успешного логина
    // =====================================
    console.log('\n' + colors.yellow + '='.repeat(50) + colors.reset);
    console.log(colors.yellow + '2. SUCCESSFUL LOGIN' + colors.reset);
    console.log(colors.yellow + '='.repeat(50) + colors.reset);
    
    const loginResult = await testEndpoint(
        'Login with correct credentials',
        `${BASE_URL}/login`,
        {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@neon-muonline.com',
                password: 'admin123'
            })
        },
        200
    );

    if (loginResult.success && loginResult.data.data) {
        accessToken = loginResult.data.data.tokens.accessToken;
        refreshToken = loginResult.data.data.tokens.refreshToken;
        console.log(`${colors.green}Tokens received!${colors.reset}`);
    }

    // =====================================
    // 3. Тест получения данных текущего админа
    // =====================================
    console.log('\n' + colors.yellow + '='.repeat(50) + colors.reset);
    console.log(colors.yellow + '3. GET CURRENT ADMIN DATA' + colors.reset);
    console.log(colors.yellow + '='.repeat(50) + colors.reset);
    
    await testEndpoint(
        'Get /me without token (expect 401)',
        `${BASE_URL}/me`,
        {},
        401
    );

    await testEndpoint(
        'Get /me with invalid token (expect 401)',
        `${BASE_URL}/me`,
        {
            headers: {
                'Authorization': 'Bearer invalid-token-here'
            }
        },
        401
    );

    await testEndpoint(
        'Get /me with valid token',
        `${BASE_URL}/me`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        },
        200
    );

    // =====================================
    // 4. Тест обновления токена
    // =====================================
    console.log('\n' + colors.yellow + '='.repeat(50) + colors.reset);
    console.log(colors.yellow + '4. REFRESH TOKEN' + colors.reset);
    console.log(colors.yellow + '='.repeat(50) + colors.reset);
    
    await testEndpoint(
        'Refresh with invalid token (expect 401)',
        `${BASE_URL}/refresh`,
        {
            method: 'POST',
            body: JSON.stringify({
                refreshToken: 'invalid-refresh-token'
            })
        },
        401
    );

    const refreshResult = await testEndpoint(
        'Refresh with valid token',
        `${BASE_URL}/refresh`,
        {
            method: 'POST',
            body: JSON.stringify({
                refreshToken: refreshToken
            })
        },
        200
    );

    if (refreshResult.success && refreshResult.data.data) {
        const newAccessToken = refreshResult.data.data.accessToken;
        console.log(`${colors.green}New access token received!${colors.reset}`);
        accessToken = newAccessToken;
    }

    // =====================================
    // 5. Тест logout
    // =====================================
    console.log('\n' + colors.yellow + '='.repeat(50) + colors.reset);
    console.log(colors.yellow + '5. LOGOUT' + colors.reset);
    console.log(colors.yellow + '='.repeat(50) + colors.reset);
    
    await testEndpoint(
        'Logout without token (expect 401)',
        `${BASE_URL}/logout`,
        {
            method: 'POST'
        },
        401
    );

    await testEndpoint(
        'Logout with valid token',
        `${BASE_URL}/logout`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        },
        200
    );

    // =====================================
    // RESULTS
    // =====================================
    console.log('\n' + colors.yellow + '='.repeat(50) + colors.reset);
    console.log(colors.yellow + 'TEST RESULTS' + colors.reset);
    console.log(colors.yellow + '='.repeat(50) + colors.reset);
    console.log(`Total tests: ${totalTests}`);
    console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
    console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
    console.log(`Success rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
    
    if (failedTests === 0) {
        console.log(`\n${colors.green}✓ All authentication tests passed!${colors.reset}\n`);
        process.exit(0);
    } else {
        console.log(`\n${colors.red}✗ Some tests failed!${colors.reset}\n`);
        process.exit(1);
    }
}

// Запуск тестов
runAuthTests().catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
});

