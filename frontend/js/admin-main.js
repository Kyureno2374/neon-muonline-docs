/**
 * Админ-панель для просмотра страниц и блоков (без редактирования)
 * Структура: Страницы слева -> Блоки при клике -> Контент блоков
 */

import * as api from './api.js';

let currentLanguage = localStorage.getItem('adminLanguage') || 'ru';
let pages = [];
let blocks = {};
let expandedPages = new Set();

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    initLanguageSwitcher();
    await loadPages();
    setupEventListeners();
});

// Инициализация переключателя языков
function initLanguageSwitcher() {
    const switcher = document.querySelector('.language-switcher');
    if (!switcher) return;

    const buttons = switcher.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === currentLanguage) {
            btn.classList.add('active');
        }
        btn.addEventListener('click', async () => {
            currentLanguage = btn.dataset.lang;
            localStorage.setItem('adminLanguage', currentLanguage);
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            await loadPages();
        });
    });
}

// Загрузка страниц
async function loadPages() {
    try {
        pages = await api.adminGetPages(currentLanguage);
        renderPagesList();
    } catch (error) {
        console.error('Ошибка загрузки страниц:', error);
        showNotification('Ошибка загрузки страниц', 'error');
    }
}

// Рендер списка страниц слева
function renderPagesList() {
    const pagesList = document.querySelector('.pages-list');
    if (!pagesList) return;

    pagesList.innerHTML = '';

    pages.forEach(page => {
        const pageItem = document.createElement('div');
        pageItem.className = 'page-item';
        pageItem.innerHTML = `
            <div class="page-header">
                <span class="page-title">${escapeHtml(page.title || page.name || 'Без названия')}</span>
                <span class="expand-icon">+</span>
            </div>
            <div class="blocks-container" style="display: none;">
                <div class="blocks-list"></div>
            </div>
        `;

        const header = pageItem.querySelector('.page-header');
        const container = pageItem.querySelector('.blocks-container');
        const blocksList = pageItem.querySelector('.blocks-list');

        header.addEventListener('click', async () => {
            const isExpanded = expandedPages.has(page.id);
            
            if (isExpanded) {
                expandedPages.delete(page.id);
                container.style.display = 'none';
                header.querySelector('.expand-icon').textContent = '+';
            } else {
                expandedPages.add(page.id);
                container.style.display = 'block';
                header.querySelector('.expand-icon').textContent = '−';
                
                // Загрузить блоки если еще не загружены
                if (!blocks[page.id]) {
                    await loadBlocksForPage(page.id, blocksList);
                } else {
                    renderBlocksList(page.id, blocksList);
                }
            }
        });

        pagesList.appendChild(pageItem);
    });
}

// Загрузка блоков для страницы
async function loadBlocksForPage(pageId, blocksList) {
    try {
        const pageBlocks = await api.adminGetBlocks(pageId, currentLanguage);
        blocks[pageId] = pageBlocks;
        renderBlocksList(pageId, blocksList);
    } catch (error) {
        console.error('Ошибка загрузки блоков:', error);
        blocksList.innerHTML = '<div class="error">Ошибка загрузки блоков</div>';
    }
}

// Рендер списка блоков
function renderBlocksList(pageId, blocksList) {
    blocksList.innerHTML = '';
    const pageBlocks = blocks[pageId] || [];

    if (pageBlocks.length === 0) {
        blocksList.innerHTML = '<div class="no-blocks">Нет блоков</div>';
        return;
    }

    pageBlocks.forEach((block, index) => {
        const blockItem = document.createElement('div');
        blockItem.className = 'block-item';
        blockItem.innerHTML = `
            <div class="block-header">
                <span class="block-number">${index + 1}</span>
                <span class="block-type">${getBlockTypeName(block.block_type_id)}</span>
            </div>
            <div class="block-content">
                ${renderBlockContent(block)}
            </div>
            <div class="block-actions">
                <button class="btn-edit" data-block-id="${block.id}" data-page-id="${pageId}">
                    Редактировать
                </button>
            </div>
        `;

        blocksList.appendChild(blockItem);
    });

    // Добавить обработчики для кнопок редактирования
    blocksList.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const blockId = btn.dataset.blockId;
            const pageId = btn.dataset.pageId;
            redirectToEditing(pageId, blockId);
        });
    });
}

// Рендер контента блока
function renderBlockContent(block) {
    const type = block.block_type_id;
    const content = block.content || '';

    if (type === 1) { // Text
        // Удалить HTML теги для превью
        const text = content.replace(/<[^>]*>/g, '').substring(0, 100);
        return `<div class="text-content">${escapeHtml(text)}${text.length > 100 ? '...' : ''}</div>`;
    } else if (type === 2) { // Picture
        return `<div class="picture-content">
            ${block.image_url ? `<img src="${block.image_url}" alt="Block image" style="max-width: 100%; max-height: 60px;">` : '<div class="no-image">Нет изображения</div>'}
        </div>`;
    } else if (type === 3) { // List
        const text = content.replace(/<[^>]*>/g, '').substring(0, 100);
        return `<div class="list-content">${escapeHtml(text)}${text.length > 100 ? '...' : ''}</div>`;
    }
    return '<div>Неизвестный тип блока</div>';
}

// Получить название типа блока
function getBlockTypeName(typeId) {
    const types = {
        1: 'Текст',
        2: 'Изображение',
        3: 'Список'
    };
    return types[typeId] || 'Неизвестно';
}

// Редирект на страницу редактирования
function redirectToEditing(pageId, blockId) {
    window.location.href = `/admin/editing/index.html?pageId=${pageId}&blockId=${blockId}`;
}

// Установка обработчиков событий
function setupEventListeners() {
    // Кнопка "Вернуться" или "Сохранить"
    const saveBtn = document.querySelector('.btn-save');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            window.location.href = '/admin/main/index.html';
        });
    }
}

// Вспомогательная функция для экранирования HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Показать уведомление
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}
