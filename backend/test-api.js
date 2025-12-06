/**
 * Скрипт для тестирования всех API эндпоинтов
 * Проверяет работоспособность READ операций
 */

const BASE_URL = 'http://localhost:3000/api';

// Цвета для консоли
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    reset: '\x1b[0m'
};

// Счетчики
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Функция для выполнения HTTP запроса
 */
async function testEndpoint(name, url, expectedStatus = 200) {
    totalTests++;
    
    try {
        console.log(`\n${colors.blue}Testing:${colors.reset} ${name}`);
        console.log(`${colors.yellow}URL:${colors.reset} ${url}`);
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.status === expectedStatus) {
            console.log(`${colors.green}✓ PASS${colors.reset} - Status: ${response.status}`);
            console.log(`Response:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
            passedTests++;
            return { success: true, data };
        } else {
            console.log(`${colors.red}✗ FAIL${colors.reset} - Expected: ${expectedStatus}, Got: ${response.status}`);
            console.log(`Response:`, data);
            failedTests++;
            return { success: false, data };
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
async function runTests() {
    console.log(`
╔════════════════════════════════════════╗
║     API Endpoints Testing Script      ║
╚════════════════════════════════════════╝
    `);

    // =====================================
    // 1. Health check
    // =====================================
    console.log('\n' + colors.yellow + '='.repeat(50) + colors.reset);
    console.log(colors.yellow + '1. HEALTH CHECK' + colors.reset);
    console.log(colors.yellow + '='.repeat(50) + colors.reset);
    
    await testEndpoint('Health Check', `${BASE_URL}/health`);

    // =====================================
    // 2. Pages API
    // =====================================
    console.log('\n' + colors.yellow + '='.repeat(50) + colors.reset);
    console.log(colors.yellow + '2. PAGES API' + colors.reset);
    console.log(colors.yellow + '='.repeat(50) + colors.reset);
    
    // GET /api/pages (RU)
    const pagesRu = await testEndpoint(
        'Get all pages (RU)',
        `${BASE_URL}/pages?lang=ru`
    );
    
    // GET /api/pages (EN)
    await testEndpoint(
        'Get all pages (EN)',
        `${BASE_URL}/pages?lang=en`
    );
    
    // GET /api/pages/:slug (используем первую страницу из результата)
    if (pagesRu.success && pagesRu.data.data && pagesRu.data.data.length > 0) {
        const firstPageSlug = pagesRu.data.data[0].slug;
        
        await testEndpoint(
            `Get page by slug: ${firstPageSlug} (RU)`,
            `${BASE_URL}/pages/${firstPageSlug}?lang=ru`
        );
        
        await testEndpoint(
            `Get page by slug: ${firstPageSlug} (EN)`,
            `${BASE_URL}/pages/${firstPageSlug}?lang=en`
        );
        
        await testEndpoint(
            `Get page blocks: ${firstPageSlug} (RU)`,
            `${BASE_URL}/pages/${firstPageSlug}/blocks?lang=ru`
        );
    }
    
    // GET /api/pages/:slug (несуществующая страница - ожидаем 404)
    await testEndpoint(
        'Get non-existent page (expect 404)',
        `${BASE_URL}/pages/non-existent-page`,
        404
    );

    // =====================================
    // 3. Items API
    // =====================================
    console.log('\n' + colors.yellow + '='.repeat(50) + colors.reset);
    console.log(colors.yellow + '3. ITEMS API' + colors.reset);
    console.log(colors.yellow + '='.repeat(50) + colors.reset);
    
    // GET /api/items (RU)
    const itemsRu = await testEndpoint(
        'Get all items (RU)',
        `${BASE_URL}/items?lang=ru`
    );
    
    // GET /api/items (EN)
    await testEndpoint(
        'Get all items (EN)',
        `${BASE_URL}/items?lang=en`
    );
    
    // GET /api/items с пагинацией
    await testEndpoint(
        'Get items with pagination (page=1, limit=3)',
        `${BASE_URL}/items?lang=ru&page=1&limit=3`
    );
    
    // GET /api/items/:slug (используем первый предмет из результата)
    if (itemsRu.success && itemsRu.data.data && itemsRu.data.data.length > 0) {
        const firstItemSlug = itemsRu.data.data[0].slug;
        
        await testEndpoint(
            `Get item by slug: ${firstItemSlug} (RU)`,
            `${BASE_URL}/items/${firstItemSlug}?lang=ru`
        );
        
        await testEndpoint(
            `Get item by slug: ${firstItemSlug} (EN)`,
            `${BASE_URL}/items/${firstItemSlug}?lang=en`
        );
    }
    
    // GET /api/items/search (поиск)
    await testEndpoint(
        'Search items: "меч"',
        `${BASE_URL}/items/search?q=меч&lang=ru`
    );
    
    await testEndpoint(
        'Search items: "sword"',
        `${BASE_URL}/items/search?q=sword&lang=en`
    );
    
    // GET /api/items/:slug (несуществующий предмет - ожидаем 404)
    await testEndpoint(
        'Get non-existent item (expect 404)',
        `${BASE_URL}/items/non-existent-item`,
        404
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
        console.log(`\n${colors.green}✓ All tests passed!${colors.reset}\n`);
        process.exit(0);
    } else {
        console.log(`\n${colors.red}✗ Some tests failed!${colors.reset}\n`);
        process.exit(1);
    }
}

// Запуск тестов
runTests().catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
});

