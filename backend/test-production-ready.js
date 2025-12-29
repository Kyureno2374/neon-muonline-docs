/**
 * Комплексный тест для проверки готовности к продакшену
 * Проверяет все критические функции
 */

const API_BASE = 'http://localhost:3000/api';

let checks = {
    passed: 0,
    failed: 0,
    warnings: 0
};

/**
 * Проверка
 */
async function check(name, fn, isWarning = false) {
    try {
        await fn();
        console.log(`✅ ${name}`);
        checks.passed++;
    } catch (error) {
        if (isWarning) {
            console.warn(`⚠️  ${name}`);
            console.warn(`   ${error.message}`);
            checks.warnings++;
        } else {
            console.error(`❌ ${name}`);
            console.error(`   ${error.message}`);
            checks.failed++;
        }
    }
}

/**
 * Запустить проверки
 */
async function runChecks() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   PRODUCTION READINESS CHECK           ║');
    console.log('╚════════════════════════════════════════╝\n');

    // ===== BACKEND CHECKS =====
    console.log('📡 BACKEND CHECKS:\n');

    await check('API сервер доступен', async () => {
        const response = await fetch(`${API_BASE}/health`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
    });

    await check('Страницы загружаются (RU)', async () => {
        const response = await fetch(`${API_BASE}/pages?lang=ru`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data.data || data.data.length === 0) throw new Error('No pages found');
    });

    await check('Страницы загружаются (EN)', async () => {
        const response = await fetch(`${API_BASE}/pages?lang=en`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data.data || data.data.length === 0) throw new Error('No pages found');
    });

    await check('Блоки загружаются', async () => {
        const pagesResponse = await fetch(`${API_BASE}/pages?lang=ru`);
        const pagesData = await pagesResponse.json();
        if (!pagesData.data || pagesData.data.length === 0) throw new Error('No pages');
        
        const pageSlug = pagesData.data[0].slug;
        const response = await fetch(`${API_BASE}/pages/${pageSlug}?lang=ru`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data.data.blocks) throw new Error('No blocks in page');
    });

    await check('Предметы загружаются', async () => {
        const response = await fetch(`${API_BASE}/items?lang=ru&page=1&limit=12`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data.data) throw new Error('No items data');
    });

    await check('Поиск предметов работает', async () => {
        const response = await fetch(`${API_BASE}/items/search?q=test&lang=ru`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data.data) throw new Error('No search results');
    });

    // ===== AUTHENTICATION CHECKS =====
    console.log('\n🔐 AUTHENTICATION CHECKS:\n');

    let adminToken = null;

    await check('Админ может войти', async () => {
        const response = await fetch(`${API_BASE}/admin/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'admin123'
            })
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data.data || !data.data.tokens) throw new Error('No tokens in response');
        
        adminToken = data.data.tokens.accessToken;
    }, true); // Warning, не критично если нет тестового админа

    // ===== ADMIN API CHECKS =====
    if (adminToken) {
        console.log('\n👨‍💼 ADMIN API CHECKS:\n');

        await check('Админ может получить страницы', async () => {
            const response = await fetch(`${API_BASE}/admin/pages?lang=ru`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (!data.data) throw new Error('No pages data');
        });

        await check('Админ может получить предметы', async () => {
            const response = await fetch(`${API_BASE}/admin/items?page=1&limit=50`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (!data.data) throw new Error('No items data');
        });

        await check('Админ может получить языки', async () => {
            const response = await fetch(`${API_BASE}/admin/languages`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (!data.data) throw new Error('No languages data');
        });
    }

    // ===== DATA VALIDATION CHECKS =====
    console.log('\n📊 DATA VALIDATION CHECKS:\n');

    await check('Страницы имеют правильную структуру', async () => {
        const response = await fetch(`${API_BASE}/pages?lang=ru`);
        const data = await response.json();
        const page = data.data[0];
        
        if (!page.id) throw new Error('Missing id');
        if (!page.slug) throw new Error('Missing slug');
        if (!page.title) throw new Error('Missing title');
    });

    await check('Блоки имеют правильную структуру', async () => {
        const pagesResponse = await fetch(`${API_BASE}/pages?lang=ru`);
        const pagesData = await pagesResponse.json();
        const pageSlug = pagesData.data[0].slug;
        
        const response = await fetch(`${API_BASE}/pages/${pageSlug}?lang=ru`);
        const data = await response.json();
        
        if (!data.data.blocks || data.data.blocks.length === 0) {
            throw new Error('No blocks found');
        }
        
        const block = data.data.blocks[0];
        if (!block.id) throw new Error('Block missing id');
        if (!block.block_type_id) throw new Error('Block missing block_type_id');
    });

    await check('Предметы имеют правильную структуру', async () => {
        const response = await fetch(`${API_BASE}/items?lang=ru&page=1&limit=1`);
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            throw new Error('No items found');
        }
        
        const item = data.data[0];
        if (!item.id) throw new Error('Item missing id');
        if (!item.slug) throw new Error('Item missing slug');
        if (!item.name) throw new Error('Item missing name');
    });

    // ===== ERROR HANDLING CHECKS =====
    console.log('\n⚠️  ERROR HANDLING CHECKS:\n');

    await check('404 для несуществующей страницы', async () => {
        const response = await fetch(`${API_BASE}/pages/nonexistent-slug?lang=ru`);
        if (response.status !== 404) throw new Error(`Expected 404, got ${response.status}`);
    });

    await check('401 для неавторизованного запроса', async () => {
        const response = await fetch(`${API_BASE}/admin/pages`);
        if (response.status !== 401) throw new Error(`Expected 401, got ${response.status}`);
    });

    // ===== PERFORMANCE CHECKS =====
    console.log('\n⚡ PERFORMANCE CHECKS:\n');

    await check('Страницы загружаются быстро (< 1s)', async () => {
        const start = Date.now();
        const response = await fetch(`${API_BASE}/pages?lang=ru`);
        const time = Date.now() - start;
        
        if (time > 1000) throw new Error(`Took ${time}ms (expected < 1000ms)`);
    });

    await check('Предметы загружаются быстро (< 1s)', async () => {
        const start = Date.now();
        const response = await fetch(`${API_BASE}/items?lang=ru&page=1&limit=12`);
        const time = Date.now() - start;
        
        if (time > 1000) throw new Error(`Took ${time}ms (expected < 1000ms)`);
    });

    // ===== ИТОГИ =====
    console.log('\n╔════════════════════════════════════════╗');
    console.log(`║   RESULTS:                             ║`);
    console.log(`║   ✅ Passed:  ${checks.passed.toString().padEnd(28)} ║`);
    console.log(`║   ⚠️  Warnings: ${checks.warnings.toString().padEnd(26)} ║`);
    console.log(`║   ❌ Failed:  ${checks.failed.toString().padEnd(28)} ║`);
    console.log('╚════════════════════════════════════════╝\n');

    if (checks.failed === 0) {
        console.log('🚀 ПРОЕКТ ГОТОВ К ПРОДАКШЕНУ!\n');
        process.exit(0);
    } else {
        console.log('⚠️  ЕСТЬ КРИТИЧЕСКИЕ ОШИБКИ!\n');
        process.exit(1);
    }
}

// Запускаем проверки
runChecks().catch(error => {
    console.error('Check runner error:', error);
    process.exit(1);
});
