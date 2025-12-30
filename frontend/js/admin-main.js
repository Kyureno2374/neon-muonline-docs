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
            console.log(`[pages] header click pageId=${page.id}, isExpanded=${isExpanded}`);

            if (isExpanded) {
                // Collapse with animation: add collapsed class, wait for transition to remove 'open'
                expandedPages.delete(page.id);
                container.classList.add('collapsed');
                header.querySelector('.expand-icon').textContent = '+';

                const onTransitionEnd = (e) => {
                    if (e.target === container) {
                        container.classList.remove('open');
                        container.removeEventListener('transitionend', onTransitionEnd);
                    }
                };
                container.addEventListener('transitionend', onTransitionEnd);
            } else {
                // Close other open containers first (visual parity with editing)
                document.querySelectorAll('.blocks-container.open').forEach(other => {
                    if (other !== container) {
                        other.classList.add('collapsed');
                        other.addEventListener('transitionend', function onEnd(e) {
                            if (e.target === other) {
                                other.classList.remove('open');
                                other.removeEventListener('transitionend', onEnd);
                            }
                        });
                    }
                });

                expandedPages.clear();
                expandedPages.add(page.id);
                currentPageId = page.id;
                window.history.pushState({}, '', `/admin/editing/index.html?pageId=${page.id}`);

                // Open container
                container.classList.remove('collapsed');
                container.classList.add('open');
                console.log(`[pages] set container.open for pageId=${page.id}`, { container });
                header.querySelector('.expand-icon').textContent = '−';

                // Загрузить блоки если еще не загружены
                if (!blocks[page.id]) {
                    console.log(`[pages] loading blocks for pageId=${page.id}`);
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
        console.log(`[blocks] loadBlocksForPage start pageId=${pageId}`);
        const response = await api.adminGetBlocks(pageId, currentLanguage);
        console.log(`[blocks] api response for pageId=${pageId}:`, response);
        // API may return { success: true, data: [...] } or an array directly
        const pageBlocks = (response && Array.isArray(response.data)) ? response.data : (Array.isArray(response) ? response : (response?.data || []));
        // Ensure we always store an array
        blocks[pageId] = pageBlocks;
        console.log(`[blocks] loaded ${pageBlocks.length} blocks for pageId=${pageId}`);
        renderBlocksList(pageId, blocksList);
    } catch (error) {
        console.error('Ошибка загрузки блоков:', error);
        blocksList.innerHTML = '<div class="error">Ошибка загрузки блоков</div>';
    }
}

// Рендер списка блоков
function renderBlocksList(pageId, blocksList) {
    console.log(`[blocks] renderBlocksList pageId=${pageId} currentStored=${(blocks[pageId] || []).length}`);
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
