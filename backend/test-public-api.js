/**
 * Тесты для публичного API
 * Проверяет загрузку страниц и блоков
 */

const API_BASE = 'http://localhost:3000/api';
const LANGUAGES = ['ru', 'en'];

let testsPassed = 0;
let testsFailed = 0;

/**
 * Вспомогательная функция для тестирования
 */
async function test(name, fn) {
    try {
        await fn();
        console.log(`✅ ${name}`);
        testsPassed++;
    } catch (error) {
        console.error(`❌ ${name}`);
        console.error(`   Error: ${error.message}`);
        testsFailed++;
    }
}

/**
 * Проверить что ответ содержит нужные поля
 */
function assertHasFields(obj, fields, name) {
    fields.forEach(field => {
        if (!(field in obj)) {
            throw new Error(`${name} missing field: ${field}`);
        }
    });
}

/**
 * Запустить тесты
 */
async function runTests() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   PUBLIC API TESTS                     ║');
    console.log('╚════════════════════════════════════════╝\n');

    // Тест 1: Получить список страниц (RU)
    await test('GET /api/pages?lang=ru - получить страницы на русском', async () => {
        const response = await fetch(`${API_BASE}/pages?lang=ru`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (!Array.isArray(data.data)) throw new Error('Response is not an array');
        if (data.data.length === 0) throw new Error('No pages found');
        
        // Проверяем структуру первой страницы
        const page = data.data[0];
        assertHasFields(page, ['id', 'slug', 'title'], 'Page');
    });

    // Тест 2: Получить список страниц (EN)
    await test('GET /api/pages?lang=en - получить страницы на английском', async () => {
        const response = await fetch(`${API_BASE}/pages?lang=en`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (!Array.isArray(data.data)) throw new Error('Response is not an array');
        if (data.data.length === 0) throw new Error('No pages found');
    });

    // Тест 3: Получить страницу со всеми блоками
    await test('GET /api/pages/:slug - получить страницу со блоками', async () => {
        // Сначала получаем список страниц
        const pagesResponse = await fetch(`${API_BASE}/pages?lang=ru`);
        const pagesData = await pagesResponse.json();
        
        if (pagesData.data.length === 0) throw new Error('No pages found');
        
        const firstPageSlug = pagesData.data[0].slug;
        
        // Теперь получаем саму страницу
        const response = await fetch(`${API_BASE}/pages/${firstPageSlug}?lang=ru`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        const page = data.data;
        
        assertHasFields(page, ['id', 'slug', 'title'], 'Page');
        
        // Проверяем что есть блоки
        if (!Array.isArray(page.blocks)) throw new Error('Page has no blocks array');
    });

    // Тест 4: Получить только блоки страницы
    await test('GET /api/pages/:slug/blocks - получить только блоки', async () => {
        // Сначала получаем список страниц
        const pagesResponse = await fetch(`${API_BASE}/pages?lang=ru`);
        const pagesData = await pagesResponse.json();
        
        if (pagesData.data.length === 0) throw new Error('No pages found');
        
        const firstPageSlug = pagesData.data[0].slug;
        
        // Получаем блоки
        const response = await fetch(`${API_BASE}/pages/${firstPageSlug}/blocks?lang=ru`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (!Array.isArray(data.data)) throw new Error('Response is not an array');
    });

    // Тест 5: Получить список предметов
    await test('GET /api/items - получить список предметов', async () => {
        const response = await fetch(`${API_BASE}/items?lang=ru&page=1&limit=12`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (!Array.isArray(data.data)) throw new Error('Response is not an array');
    });

    // Тест 6: Получить один предмет
    await test('GET /api/items/:slug - получить один предмет', async () => {
        // Сначала получаем список предметов
        const itemsResponse = await fetch(`${API_BASE}/items?lang=ru&page=1&limit=1`);
        const itemsData = await itemsResponse.json();
        
        if (itemsData.data.length === 0) {
            console.log('   (Skipped: no items in database)');
            testsPassed++;
            return;
        }
        
        const firstItemSlug = itemsData.data[0].slug;
        
        // Получаем сам предмет
        const response = await fetch(`${API_BASE}/items/${firstItemSlug}?lang=ru`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        const item = data.data;
        
        assertHasFields(item, ['id', 'slug', 'name'], 'Item');
    });

    // Тест 7: Поиск предметов
    await test('GET /api/items/search - поиск предметов', async () => {
        const response = await fetch(`${API_BASE}/items/search?q=test&lang=ru`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (!Array.isArray(data.data)) throw new Error('Response is not an array');
    });

    // Тест 8: Проверить что все языки работают
    await test('Проверить поддержку всех языков', async () => {
        for (const lang of LANGUAGES) {
            const response = await fetch(`${API_BASE}/pages?lang=${lang}`);
            if (!response.ok) throw new Error(`Language ${lang} failed with HTTP ${response.status}`);
            
            const data = await response.json();
            if (!Array.isArray(data.data)) throw new Error(`Language ${lang} response is not an array`);
        }
    });

    // Тест 9: Проверить структуру блока
    await test('Проверить структуру блока', async () => {
        const pagesResponse = await fetch(`${API_BASE}/pages?lang=ru`);
        const pagesData = await pagesResponse.json();
        
        if (pagesData.data.length === 0) throw new Error('No pages found');
        
        const firstPageSlug = pagesData.data[0].slug;
        const pageResponse = await fetch(`${API_BASE}/pages/${firstPageSlug}?lang=ru`);
        const pageData = await pageResponse.json();
        const page = pageData.data;
        
        if (!page.blocks || page.blocks.length === 0) {
            console.log('   (Skipped: no blocks in first page)');
            testsPassed++;
            return;
        }
        
        const block = page.blocks[0];
        assertHasFields(block, ['id', 'block_type_id', 'content'], 'Block');
    });

    // Тест 10: Проверить что 404 возвращается для несуществующей страницы
    await test('GET /api/pages/nonexistent - проверить 404', async () => {
        const response = await fetch(`${API_BASE}/pages/nonexistent-page-slug?lang=ru`);
        if (response.status !== 404) throw new Error(`Expected 404, got ${response.status}`);
    });

    // Итоги
    console.log('\n╔════════════════════════════════════════╗');
    console.log(`║   RESULTS: ${testsPassed} passed, ${testsFailed} failed        ║`);
    console.log('╚════════════════════════════════════════╝\n');

    process.exit(testsFailed > 0 ? 1 : 0);
}

// Запускаем тесты
runTests().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
});
