/**
 * Скрипт для страницы логина
 */

import { adminLogin } from './api.js';
import { requireNoAuth } from './auth.js';
import { showError, showSuccess } from './notifications.js';

// Проверяем, не авторизован ли уже
requireNoAuth();

// Получаем элементы формы
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const btnLoader = document.getElementById('btnLoader');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const generalError = document.getElementById('generalError');
const closeBtn = document.querySelector('.close-btn');

// Обработчик отправки формы
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Очищаем ошибки
    emailError.textContent = '';
    passwordError.textContent = '';
    generalError.textContent = '';

    // Валидация на клиенте
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email) {
        emailError.textContent = 'Email обязателен';
        return;
    }

    if (!password) {
        passwordError.textContent = 'Пароль обязателен';
        return;
    }

    if (!isValidEmail(email)) {
        emailError.textContent = 'Некорректный email';
        return;
    }

    // Отправляем запрос
    submitBtn.disabled = true;
    btnLoader.style.display = 'inline-block';

    try {
        const response = await adminLogin(email, password);

        showSuccess('Успешный вход!');

        // Редирект на админку через 1 секунду
        setTimeout(() => {
            window.location.href = '/admin/main/index.html';
        }, 1000);
    } catch (error) {
        console.error('Login error:', error);

        if (error.status === 401) {
            generalError.textContent = 'Неверный email или пароль';
        } else if (error.status === 400) {
            generalError.textContent = error.message || 'Ошибка валидации';
        } else {
            generalError.textContent = error.message || 'Ошибка при входе. Попробуйте позже.';
        }

        showError(generalError.textContent);
    } finally {
        submitBtn.disabled = false;
        btnLoader.style.display = 'none';
    }
});

// Обработчик кнопки закрытия
closeBtn.addEventListener('click', () => {
    window.location.href = '/for_users/index.html';
});

// Валидация email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Очистка ошибок при вводе
emailInput.addEventListener('input', () => {
    emailError.textContent = '';
});

passwordInput.addEventListener('input', () => {
    passwordError.textContent = '';
});
