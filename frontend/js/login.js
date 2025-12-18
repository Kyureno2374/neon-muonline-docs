/**
 * Логика страницы логина
 */

// Проверяем, если уже авторизован - редирект на админку
if (auth.redirectIfAuthenticated()) {
    // Уже перенаправили
}

// Элементы формы
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const generalError = document.getElementById('generalError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const closeBtn = document.querySelector('.close-btn');

/**
 * Показать ошибку для конкретного поля
 */
function showFieldError(field, message) {
    const input = field === 'email' ? emailInput : passwordInput;
    const errorElement = field === 'email' ? emailError : passwordError;

    input.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('visible');
}

/**
 * Очистить ошибки полей
 */
function clearFieldErrors() {
    emailInput.classList.remove('error');
    passwordInput.classList.remove('error');
    emailError.classList.remove('visible');
    passwordError.classList.remove('visible');
}

/**
 * Показать общую ошибку
 */
function showGeneralError(message) {
    generalError.textContent = message;
    generalError.classList.add('visible');
}

/**
 * Очистить общую ошибку
 */
function clearGeneralError() {
    generalError.classList.remove('visible');
}

/**
 * Показать loader на кнопке
 */
function setLoading(isLoading) {
    if (isLoading) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        emailInput.disabled = true;
        passwordInput.disabled = true;
    } else {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        emailInput.disabled = false;
        passwordInput.disabled = false;
    }
}

/**
 * Валидация email
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Обработка отправки формы
 */
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Очистить все ошибки
    clearFieldErrors();
    clearGeneralError();

    // Получить данные формы
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Валидация на клиенте
    let hasErrors = false;

    if (!email) {
        showFieldError('email', 'Email is required');
        hasErrors = true;
    } else if (!validateEmail(email)) {
        showFieldError('email', 'Invalid email format');
        hasErrors = true;
    }

    if (!password) {
        showFieldError('password', 'Password is required');
        hasErrors = true;
    }

    if (hasErrors) {
        return;
    }

    // Отправка на сервер
    setLoading(true);

    try {
        const response = await api.post('/admin/auth/login', {
            email: email,
            password: password
        });

        if (response.success && response.data) {
            // Сохраняем токены
            auth.saveTokens(
                response.data.tokens.accessToken,
                response.data.tokens.refreshToken
            );

            // Сохраняем данные админа
            auth.saveAdminData(response.data.admin);

            // Показываем успех и перенаправляем
            console.log('✅ Login successful:', response.data.admin.email);
            
            // Небольшая задержка для плавности
            setTimeout(() => {
                window.location.href = '/admin/index.html';
            }, 300);
        }
    } catch (error) {
        setLoading(false);

        // Обработка ошибок
        if (error.code === 'INVALID_CREDENTIALS') {
            showGeneralError('Invalid email or password');
        } else if (error.code === 'NETWORK_ERROR') {
            showGeneralError('Cannot connect to server. Please try again later.');
        } else {
            showGeneralError(error.message || 'An error occurred. Please try again.');
        }

        console.error('❌ Login error:', error);
    }
});

/**
 * Очистка ошибок при вводе
 */
emailInput.addEventListener('input', () => {
    emailInput.classList.remove('error');
    emailError.classList.remove('visible');
    clearGeneralError();
});

passwordInput.addEventListener('input', () => {
    passwordInput.classList.remove('error');
    passwordError.classList.remove('visible');
    clearGeneralError();
});

/**
 * Обработка кнопки закрытия
 */
closeBtn.addEventListener('click', () => {
    // Перенаправляем на главную страницу сайта
    window.location.href = '/';
});

/**
 * Enter для отправки формы
 */
emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        passwordInput.focus();
    }
});

