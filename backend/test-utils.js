/**
 * Утилиты для красивого вывода тестов
 * Единый стиль для всех тестовых скриптов
 */

export class TestRunner {
    constructor(suiteName) {
        this.suiteName = suiteName;
        this.tests = [];
        this.currentTest = null;
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: []
        };
    }

    /**
     * Начало набора тестов
     */
    start() {
        console.log('\n🧪 ' + this.suiteName.toUpperCase());
        console.log('='.repeat(60));
        console.log();
    }

    /**
     * Начало отдельного теста
     */
    test(name) {
        this.currentTest = { name, passed: false, error: null };
        this.results.total++;
        console.log(`🔹 Test ${this.results.total}: ${name}`);
    }

    /**
     * Тест пройден
     */
    pass(message = '') {
        this.results.passed++;
        this.currentTest.passed = true;
        console.log(`   ✅ PASSED${message ? ' - ' + message : ''}`);
        console.log();
    }

    /**
     * Тест провален
     */
    fail(error) {
        this.results.failed++;
        this.currentTest.passed = false;
        this.currentTest.error = error;
        this.results.errors.push({
            test: this.currentTest.name,
            error: error
        });
        console.log(`   ❌ FAILED: ${error}`);
        console.log();
    }

    /**
     * Лог информации
     */
    log(message) {
        console.log(`   ${message}`);
    }

    /**
     * Конец набора тестов - вывод результатов
     */
    end() {
        const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
        
        console.log('='.repeat(60));
        console.log('📊 РЕЗУЛЬТАТЫ');
        console.log('='.repeat(60));
        console.log(`Всего тестов: ${this.results.total}`);
        console.log(`Пройдено:     ${this.results.passed} ✅`);
        console.log(`Провалено:    ${this.results.failed} ❌`);
        console.log(`Успешность:   ${successRate}%`);
        console.log();

        if (this.results.errors.length > 0) {
            console.log('❌ Провалы:');
            this.results.errors.forEach(({ test, error }) => {
                console.log(`   • ${test}`);
                console.log(`     ${error}`);
            });
            console.log();
        } else {
            console.log('🎉 Все тесты пройдены успешно!');
            console.log();
        }

        console.log('✨ Готово!');
        console.log();

        return this.results.failed === 0;
    }

    /**
     * HTTP запрос с автоматической проверкой
     */
    async request(url, options = {}, expectedStatus = 200) {
        try {
            const response = await fetch(url, options);
            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            const success = response.status === expectedStatus;
            
            if (!success) {
                this.log(`Expected status: ${expectedStatus}, got: ${response.status}`);
            }

            return { success, status: response.status, data, response };
        } catch (error) {
            return { success: false, error: error.message, data: null };
        }
    }

    /**
     * Проверка условия
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }
}

/**
 * Создать новый тест-раннер
 */
export function createTestRunner(suiteName) {
    return new TestRunner(suiteName);
}

export default { TestRunner, createTestRunner };

