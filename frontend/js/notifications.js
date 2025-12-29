/**
 * Система уведомлений
 */

/**
 * Показать уведомление
 */
export function showNotification(message, type = 'info', duration = 3000) {
    // Создаем контейнер для уведомлений если его нет
    let container = document.getElementById('notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        padding: 15px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        word-wrap: break-word;
    `;

    // Устанавливаем цвета в зависимости от типа
    const colors = {
        success: { bg: '#10b981', text: '#fff' },
        error: { bg: '#ef4444', text: '#fff' },
        warning: { bg: '#f59e0b', text: '#fff' },
        info: { bg: '#3b82f6', text: '#fff' },
    };

    const color = colors[type] || colors.info;
    notification.style.backgroundColor = color.bg;
    notification.style.color = color.text;

    notification.textContent = message;
    container.appendChild(notification);

    // Удаляем уведомление через duration
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

/**
 * Показать успешное уведомление
 */
export function showSuccess(message, duration = 3000) {
    showNotification(message, 'success', duration);
}

/**
 * Показать ошибку
 */
export function showError(message, duration = 5000) {
    showNotification(message, 'error', duration);
}

/**
 * Показать предупреждение
 */
export function showWarning(message, duration = 4000) {
    showNotification(message, 'warning', duration);
}

/**
 * Показать информационное сообщение
 */
export function showInfo(message, duration = 3000) {
    showNotification(message, 'info', duration);
}

// Добавляем CSS анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
