/**
 * Тест CRUD API для Pages (админ-панель)
 * Запускать после успешной авторизации
 */

const API_URL = 'http://localhost:3000/api';
let accessToken = '';
let createdPageId = null;

// Цвета для консоли
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
};

// Результаты тестов
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

/**
 * Выполнить тест
 */
async function runTest(name, testFunc) {
    try {
        console.log(`\n${colors.cyan}▶ Testing:${colors.reset} ${name}`);
        await testFunc();
        results.passed++;
        results.tests.push({ name, status: 'PASSED' });
        console.log(`${colors.green}✓ PASSED${colors.reset}`);
    } catch (error) {
        results.failed++;
        results.tests.push({ name, status: 'FAILED', error: error.message });
        console.log(`${colors.red}✗ FAILED${colors.reset}: ${error.message}`);
    }
}

/**
 * 1. Авторизация
 */
async function testLogin() {
    const response = await fetch(`${API_URL}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@neon-muonline.com',
            password: 'admin123'
        })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(`Login failed: ${data.error?.message || 'Unknown error'}`);
    }

    if (!data.data.tokens.accessToken) {
        throw new Error('No access token received');
    }

    accessToken = data.data.tokens.accessToken;
}

/**
 * 2. Создание страницы
 */
async function testCreatePage() {
    // Сначала попробуем найти и удалить тестовую страницу, если она существует
    const findResponse = await fetch(`${API_URL}/pages/test-page?lang=ru`);
    if (findResponse.ok) {
        const findData = await findResponse.json();
        if (findData.success && findData.data) {
            // Удаляем старую тестовую страницу
            await fetch(`${API_URL}/admin/pages/${findData.data.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
        }
    }

    const response = await fetch(`${API_URL}/admin/pages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            slug: 'test-page',
            icon: '🧪',
            sort_order: 999
        })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(`Create page failed: ${data.error?.message || 'Unknown error'}`);
    }

    if (!data.data.id) {
        throw new Error('No page ID returned');
    }

    createdPageId = data.data.id;
}

/**
 * 3. Попытка создать страницу с существующим slug (должна провалиться)
 */
async function testCreateDuplicatePage() {
    const response = await fetch(`${API_URL}/admin/pages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            slug: 'test-page',
            icon: '🧪',
            sort_order: 999
        })
    });

    const data = await response.json();

    if (response.ok || data.success) {
        throw new Error('Duplicate page creation should fail');
    }

    if (data.error?.code !== 'DUPLICATE_SLUG') {
        throw new Error('Expected DUPLICATE_SLUG error');
    }
}

/**
 * 4. Обновление страницы
 */
async function testUpdatePage() {
    const response = await fetch(`${API_URL}/admin/pages/${createdPageId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            icon: '🔬',
            sort_order: 1000
        })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(`Update page failed: ${data.error?.message || 'Unknown error'}`);
    }

    if (data.data.icon !== '🔬' || data.data.sort_order !== 1000) {
        throw new Error('Page not updated correctly');
    }
}

/**
 * 5. Создание перевода страницы (RU)
 */
async function testCreateTranslationRU() {
    const response = await fetch(`${API_URL}/admin/pages/${createdPageId}/translations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            language: 'ru',
            name: 'Тестовая страница'
        })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(`Create RU translation failed: ${data.error?.message || 'Unknown error'}`);
    }

    if (data.data.name !== 'Тестовая страница') {
        throw new Error('Translation not created correctly');
    }
}

/**
 * 6. Создание перевода страницы (EN)
 */
async function testCreateTranslationEN() {
    const response = await fetch(`${API_URL}/admin/pages/${createdPageId}/translations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            language: 'en',
            name: 'Test Page'
        })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(`Create EN translation failed: ${data.error?.message || 'Unknown error'}`);
    }

    if (data.data.name !== 'Test Page') {
        throw new Error('Translation not created correctly');
    }
}

/**
 * 7. Получение всех переводов страницы
 */
async function testGetTranslations() {
    const response = await fetch(`${API_URL}/admin/pages/${createdPageId}/translations`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(`Get translations failed: ${data.error?.message || 'Unknown error'}`);
    }

    if (data.count !== 2) {
        throw new Error(`Expected 2 translations, got ${data.count}`);
    }
}

/**
 * 8. Обновление перевода
 */
async function testUpdateTranslation() {
    const response = await fetch(`${API_URL}/admin/pages/${createdPageId}/translations/ru`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            name: 'Обновленная тестовая страница'
        })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(`Update translation failed: ${data.error?.message || 'Unknown error'}`);
    }

    if (data.data.name !== 'Обновленная тестовая страница') {
        throw new Error('Translation not updated correctly');
    }
}

/**
 * 9. Удаление перевода
 */
async function testDeleteTranslation() {
    const response = await fetch(`${API_URL}/admin/pages/${createdPageId}/translations/en`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(`Delete translation failed: ${data.error?.message || 'Unknown error'}`);
    }
}

/**
 * 10. Удаление страницы
 */
async function testDeletePage() {
    const response = await fetch(`${API_URL}/admin/pages/${createdPageId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(`Delete page failed: ${data.error?.message || 'Unknown error'}`);
    }
}

/**
 * 11. Попытка получить удаленную страницу (должна провалиться)
 */
async function testGetDeletedPage() {
    const response = await fetch(`${API_URL}/pages/test-page?lang=ru`, {
        method: 'GET'
    });

    const data = await response.json();

    if (response.ok || data.success) {
        throw new Error('Getting deleted page should fail');
    }

    if (data.error?.code !== 'PAGE_NOT_FOUND') {
        throw new Error('Expected PAGE_NOT_FOUND error');
    }
}

/**
 * Запуск всех тестов
 */
async function runAllTests() {
    console.log(`\n${colors.bold}${colors.cyan}╔════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}║   ADMIN PAGES CRUD API TESTS                   ║${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}╚════════════════════════════════════════════════╝${colors.reset}\n`);

    await runTest('1. Admin Login', testLogin);
    await runTest('2. Create Page', testCreatePage);
    await runTest('3. Create Duplicate Page (should fail)', testCreateDuplicatePage);
    await runTest('4. Update Page', testUpdatePage);
    await runTest('5. Create Translation (RU)', testCreateTranslationRU);
    await runTest('6. Create Translation (EN)', testCreateTranslationEN);
    await runTest('7. Get All Translations', testGetTranslations);
    await runTest('8. Update Translation', testUpdateTranslation);
    await runTest('9. Delete Translation', testDeleteTranslation);
    await runTest('10. Delete Page', testDeletePage);
    await runTest('11. Get Deleted Page (should fail)', testGetDeletedPage);

    // Итоговый отчет
    console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(50)}${colors.reset}`);
    console.log(`${colors.bold}TEST RESULTS${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(50)}${colors.reset}\n`);
    
    console.log(`Total tests: ${colors.bold}${results.passed + results.failed}${colors.reset}`);
    console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
    console.log(`Success rate: ${colors.bold}${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%${colors.reset}\n`);

    if (results.failed === 0) {
        console.log(`${colors.green}${colors.bold}✓ All tests passed!${colors.reset}\n`);
    } else {
        console.log(`${colors.red}${colors.bold}✗ Some tests failed:${colors.reset}\n`);
        results.tests
            .filter(function filterFailed(t) { return t.status === 'FAILED'; })
            .forEach(function printFailed(t) {
                console.log(`  ${colors.red}✗${colors.reset} ${t.name}`);
                console.log(`    ${colors.yellow}${t.error}${colors.reset}`);
            });
        console.log('');
    }

    process.exit(results.failed > 0 ? 1 : 0);
}

// Запуск
runAllTests().catch(function handleError(error) {
    console.error(`${colors.red}${colors.bold}Fatal error:${colors.reset}`, error);
    process.exit(1);
});

