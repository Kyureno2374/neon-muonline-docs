/**
 * Тестирование CRUD API для предметов (админка)
 */

import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@neon-muonline.com';
const ADMIN_PASSWORD = 'admin123';

let authToken = '';
let createdItemId = null;

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

async function testGetAllItems() {
    log('\n📋 === ТЕСТ 2: Получение всех предметов ===', 'cyan');

    const { response, data } = await request('/admin/items');

    if (response.ok) {
        log(`✅ Получено предметов: ${data.count}`, 'green');
        console.log('Предметы:', JSON.stringify(data.data.slice(0, 2), null, 2));
        return true;
    } else {
        log(`❌ Ошибка: ${data.error}`, 'red');
        return false;
    }
}

async function testSearchItems() {
    log('\n🔍 === ТЕСТ 3: Поиск предметов ===', 'cyan');

    const { response, data } = await request('/admin/items?search=sword');

    if (response.ok) {
        log(`✅ Найдено предметов: ${data.count}`, 'green');
        console.log('Результаты:', JSON.stringify(data.data.slice(0, 2), null, 2));
        return true;
    } else {
        log(`❌ Ошибка: ${data.error}`, 'red');
        return false;
    }
}

async function testCreateItem() {
    log('\n➕ === ТЕСТ 4: Создание нового предмета ===', 'cyan');

    const newItem = {
        slug: 'test-item-' + Date.now(),
        image_url: 'https://example.com/test-item.png',
        thumbnail_url: 'https://example.com/test-item-thumb.png',
    };

    const { response, data } = await request('/admin/items', {
        method: 'POST',
        body: JSON.stringify(newItem),
    });

    if (response.status === 201 && data.data) {
        createdItemId = data.data.id;
        log(`✅ Предмет создан с ID: ${createdItemId}`, 'green');
        console.log('Данные:', JSON.stringify(data.data, null, 2));
        return true;
    } else {
        log(`❌ Ошибка создания: ${data.error}`, 'red');
        return false;
    }
}

async function testCreateDuplicateItem() {
    log('\n⚠️ === ТЕСТ 5: Попытка создать дубликат ===', 'cyan');

    const { response, data } = await request('/admin/items', {
        method: 'POST',
        body: JSON.stringify({
            slug: 'excalibur-sword', // существующий slug
            image_url: 'test.png',
        }),
    });

    if (response.status === 409) {
        log('✅ Корректно заблокирован дубликат', 'green');
        return true;
    } else {
        log(`❌ Ошибка: должен был вернуть 409, но вернул ${response.status}`, 'red');
        return false;
    }
}

async function testCreateItemTranslation() {
    log('\n🌐 === ТЕСТ 6: Создание перевода предмета ===', 'cyan');

    const translation = {
        language: 'ru',
        name: 'Тестовый предмет',
        description: 'Описание тестового предмета',
    };

    const { response, data } = await request(`/admin/items/${createdItemId}/translations`, {
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

async function testGetItemTranslations() {
    log('\n🌐 === ТЕСТ 7: Получение переводов предмета ===', 'cyan');

    const { response, data } = await request(`/admin/items/${createdItemId}/translations`);

    if (response.ok) {
        log(`✅ Получено переводов: ${data.count}`, 'green');
        console.log('Переводы:', JSON.stringify(data.data, null, 2));
        return true;
    } else {
        log(`❌ Ошибка: ${data.error}`, 'red');
        return false;
    }
}

async function testUpdateItem() {
    log('\n✏️ === ТЕСТ 8: Обновление предмета ===', 'cyan');

    const updates = {
        image_url: 'https://example.com/updated-image.png',
        thumbnail_url: 'https://example.com/updated-thumb.png',
    };

    const { response, data } = await request(`/admin/items/${createdItemId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });

    if (response.ok) {
        log('✅ Предмет обновлён', 'green');
        console.log('Данные:', JSON.stringify(data.data, null, 2));
        return true;
    } else {
        log(`❌ Ошибка обновления: ${data.error}`, 'red');
        return false;
    }
}

async function testUpdateItemTranslation() {
    log('\n🌐 === ТЕСТ 9: Обновление перевода предмета ===', 'cyan');

    const updatedContent = {
        name: 'Обновлённое название',
        description: 'Обновлённое описание тестового предмета',
    };

    const { response, data } = await request(`/admin/items/${createdItemId}/translations/ru`, {
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

async function testGetItemById() {
    log('\n🔍 === ТЕСТ 10: Получение предмета по ID ===', 'cyan');

    const { response, data } = await request(`/admin/items/${createdItemId}`);

    if (response.ok) {
        log('✅ Предмет получен', 'green');
        console.log('Данные:', JSON.stringify(data.data, null, 2));
        return true;
    } else {
        log(`❌ Ошибка: ${data.error}`, 'red');
        return false;
    }
}

async function testDeleteItemTranslation() {
    log('\n🗑️ === ТЕСТ 11: Удаление перевода предмета ===', 'cyan');

    const { response, data } = await request(`/admin/items/${createdItemId}/translations/ru`, {
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

async function testDeleteItem() {
    log('\n🗑️ === ТЕСТ 12: Удаление предмета ===', 'cyan');

    const { response, data } = await request(`/admin/items/${createdItemId}`, {
        method: 'DELETE',
    });

    if (response.ok) {
        log('✅ Предмет удалён (мягкое удаление)', 'green');
        return true;
    } else {
        log(`❌ Ошибка удаления: ${data.error}`, 'red');
        return false;
    }
}

async function testCreateItemWithoutSlug() {
    log('\n⚠️ === ТЕСТ 13: Создание предмета без slug (валидация) ===', 'cyan');

    const { response, data } = await request('/admin/items', {
        method: 'POST',
        body: JSON.stringify({
            image_url: 'test.png',
        }),
    });

    if (response.status === 400) {
        log('✅ Валидация работает корректно', 'green');
        return true;
    } else {
        log(`❌ Ошибка: должен был вернуть 400, но вернул ${response.status}`, 'red');
        return false;
    }
}

// ==================== Запуск всех тестов ====================

async function runAllTests() {
    log('\n╔═══════════════════════════════════════════════════╗', 'blue');
    log('║   ТЕСТИРОВАНИЕ CRUD API ДЛЯ ПРЕДМЕТОВ (АДМИНКА)  ║', 'blue');
    log('╚═══════════════════════════════════════════════════╝', 'blue');

    const tests = [
        testLogin,
        testGetAllItems,
        testSearchItems,
        testCreateItem,
        testCreateDuplicateItem,
        testCreateItemTranslation,
        testGetItemTranslations,
        testUpdateItem,
        testUpdateItemTranslation,
        testGetItemById,
        testDeleteItemTranslation,
        testDeleteItem,
        testCreateItemWithoutSlug,
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

