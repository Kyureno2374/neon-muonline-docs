/**
 * Тестирование CRUD API для блоков (админка)
 */

import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@neon-muonline.com';
const ADMIN_PASSWORD = 'admin123';

let authToken = '';
let createdBlockId = null;
let testPageId = null; // ID существующей страницы для теста

// Цвета для консоли
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// ==================== Утилиты ====================

async function request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (authToken && !options.skipAuth) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    const data = await response.json();
    return { response, data };
}

// ==================== Тесты ====================

async function testLogin() {
    log('\n🔐 === ТЕСТ 1: Авторизация ===', 'cyan');

    const { response, data } = await request('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
        }),
        skipAuth: true,
    });

    if (response.ok && data.data?.tokens?.accessToken) {
        authToken = data.data.tokens.accessToken;
        log('✅ Авторизация успешна', 'green');
        log(`Token: ${authToken.substring(0, 20)}...`, 'blue');
        return true;
    } else {
        log(`❌ Авторизация не удалась: ${JSON.stringify(data.error || data.message)}`, 'red');
        return false;
    }
}

async function getTestPageId() {
    log('\n📄 === Получение ID тестовой страницы ===', 'cyan');

    const { response, data } = await request('/pages?lang=ru', {
        skipAuth: true,
    });

    if (response.ok && data.data && data.data.length > 0) {
        testPageId = data.data[0].id;
        log(`✅ Используем страницу ID: ${testPageId} (${data.data[0].title})`, 'green');
        return true;
    } else {
        log('❌ Не удалось получить страницу для теста', 'red');
        return false;
    }
}

async function testGetAllBlocks() {
    log('\n📋 === ТЕСТ 2: Получение всех блоков ===', 'cyan');

    const { response, data } = await request('/admin/blocks');

    if (response.ok) {
        log(`✅ Получено блоков: ${data.count}`, 'green');
        console.log('Блоки:', JSON.stringify(data.data.slice(0, 2), null, 2));
        return true;
    } else {
        log(`❌ Ошибка: ${data.error}`, 'red');
        return false;
    }
}

async function testGetBlocksByPageId() {
    log('\n📋 === ТЕСТ 3: Получение блоков конкретной страницы ===', 'cyan');

    const { response, data } = await request(`/admin/blocks?page_id=${testPageId}`);

    if (response.ok) {
        log(`✅ Получено блоков для страницы ${testPageId}: ${data.count}`, 'green');
        console.log('Блоки:', JSON.stringify(data.data.slice(0, 2), null, 2));
        return true;
    } else {
        log(`❌ Ошибка: ${data.error}`, 'red');
        return false;
    }
}

async function testCreateBlock() {
    log('\n➕ === ТЕСТ 4: Создание нового блока ===', 'cyan');

    const newBlock = {
        page_id: testPageId,
        block_type_id: 1, // text
        image_url: null,
        thumbnail_url: null,
        sort_order: 999,
    };

    const { response, data } = await request('/admin/blocks', {
        method: 'POST',
        body: JSON.stringify(newBlock),
    });

    if (response.status === 201 && data.data) {
        createdBlockId = data.data.id;
        log(`✅ Блок создан с ID: ${createdBlockId}`, 'green');
        console.log('Данные:', JSON.stringify(data.data, null, 2));
        return true;
    } else {
        log(`❌ Ошибка создания: ${data.error}`, 'red');
        return false;
    }
}

async function testCreateBlockTranslation() {
    log('\n🌐 === ТЕСТ 5: Создание перевода блока ===', 'cyan');

    const translation = {
        language: 'ru',
        content: 'Тестовый контент блока на русском языке',
    };

    const { response, data } = await request(`/admin/blocks/${createdBlockId}/translations`, {
        method: 'POST',
        body: JSON.stringify(translation),
    });

    if (response.status === 201) {
        log('✅ Перевод создан', 'green');
        console.log('Данные:', JSON.stringify(data.data, null, 2));
        return true;
    } else {
        log(`❌ Ошибка: ${data.error}`, 'red');
        return false;
    }
}

async function testGetBlockTranslations() {
    log('\n🌐 === ТЕСТ 6: Получение переводов блока ===', 'cyan');

    const { response, data } = await request(`/admin/blocks/${createdBlockId}/translations`);

    if (response.ok) {
        log(`✅ Получено переводов: ${data.count}`, 'green');
        console.log('Переводы:', JSON.stringify(data.data, null, 2));
        return true;
    } else {
        log(`❌ Ошибка: ${data.error}`, 'red');
        return false;
    }
}

async function testUpdateBlock() {
    log('\n✏️ === ТЕСТ 7: Обновление блока ===', 'cyan');

    const updates = {
        block_type_id: 2, // picture
        image_url: 'https://example.com/test-image.jpg',
        sort_order: 100,
    };

    const { response, data } = await request(`/admin/blocks/${createdBlockId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });

    if (response.ok) {
        log('✅ Блок обновлён', 'green');
        console.log('Данные:', JSON.stringify(data.data, null, 2));
        return true;
    } else {
        log(`❌ Ошибка обновления: ${data.error}`, 'red');
        return false;
    }
}

async function testUpdateBlockTranslation() {
    log('\n🌐 === ТЕСТ 8: Обновление перевода блока ===', 'cyan');

    const updatedContent = {
        content: 'Обновлённый тестовый контент блока',
    };

    const { response, data } = await request(`/admin/blocks/${createdBlockId}/translations/ru`, {
        method: 'PUT',
        body: JSON.stringify(updatedContent),
    });

    if (response.ok) {
        log('✅ Перевод обновлён', 'green');
        console.log('Данные:', JSON.stringify(data.data, null, 2));
        return true;
    } else {
        log(`❌ Ошибка: ${data.error}`, 'red');
        return false;
    }
}

async function testUpdateBlockOrder() {
    log('\n🔢 === ТЕСТ 9: Изменение порядка блока ===', 'cyan');

    const { response, data } = await request(`/admin/blocks/${createdBlockId}/order`, {
        method: 'PUT',
        body: JSON.stringify({ sort_order: 50 }),
    });

    if (response.ok) {
        log('✅ Порядок изменён', 'green');
        console.log('Данные:', JSON.stringify(data.data, null, 2));
        return true;
    } else {
        log(`❌ Ошибка: ${data.error}`, 'red');
        return false;
    }
}

async function testGetBlockById() {
    log('\n🔍 === ТЕСТ 10: Получение блока по ID ===', 'cyan');

    const { response, data } = await request(`/admin/blocks/${createdBlockId}`);

    if (response.ok) {
        log('✅ Блок получен', 'green');
        console.log('Данные:', JSON.stringify(data.data, null, 2));
        return true;
    } else {
        log(`❌ Ошибка: ${data.error}`, 'red');
        return false;
    }
}

async function testDeleteBlockTranslation() {
    log('\n🗑️ === ТЕСТ 11: Удаление перевода блока ===', 'cyan');

    const { response, data } = await request(`/admin/blocks/${createdBlockId}/translations/ru`, {
        method: 'DELETE',
    });

    if (response.ok) {
        log('✅ Перевод удалён', 'green');
        return true;
    } else {
        log(`❌ Ошибка: ${data.error}`, 'red');
        return false;
    }
}

async function testDeleteBlock() {
    log('\n🗑️ === ТЕСТ 12: Удаление блока ===', 'cyan');

    const { response, data } = await request(`/admin/blocks/${createdBlockId}`, {
        method: 'DELETE',
    });

    if (response.ok) {
        log('✅ Блок удалён (мягкое удаление)', 'green');
        return true;
    } else {
        log(`❌ Ошибка удаления: ${data.error}`, 'red');
        return false;
    }
}

// ==================== Запуск всех тестов ====================

async function runAllTests() {
    log('\n╔═══════════════════════════════════════════════════╗', 'blue');
    log('║   ТЕСТИРОВАНИЕ CRUD API ДЛЯ БЛОКОВ (АДМИНКА)    ║', 'blue');
    log('╚═══════════════════════════════════════════════════╝', 'blue');

    const tests = [
        testLogin,
        getTestPageId,
        testGetAllBlocks,
        testGetBlocksByPageId,
        testCreateBlock,
        testCreateBlockTranslation,
        testGetBlockTranslations,
        testUpdateBlock,
        testUpdateBlockTranslation,
        testUpdateBlockOrder,
        testGetBlockById,
        testDeleteBlockTranslation,
        testDeleteBlock,
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            const result = await test();
            if (result) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            log(`❌ Тест упал с ошибкой: ${error.message}`, 'red');
            failed++;
        }
    }

    log('\n╔═══════════════════════════════════════════════════╗', 'blue');
    log(`║   РЕЗУЛЬТАТЫ: ${passed} ✅  |  ${failed} ❌              ║`, 'blue');
    log('╚═══════════════════════════════════════════════════╝', 'blue');

    if (failed === 0) {
        log('\n🎉 ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!', 'green');
    } else {
        log(`\n⚠️  ${failed} тестов не прошли`, 'yellow');
    }
}

runAllTests().catch((error) => {
    log(`\n💥 Критическая ошибка: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});

