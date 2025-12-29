/**
 * Скрипт для страницы редактирования админ-панели
 */

import * as api from './api.js';

let currentLanguage = localStorage.getItem('adminLanguage') || 'ru';
let currentPageId = null;
let pages = [];
let blocks = [];
let currentBlockId = null;
let expandedPages = new Set(); // Отслеживание раскрытых страниц
let autoSaveTimeout = null; // Таймер автосохранения
let hasUnsavedChanges = false; // Флаг несохраненных изменений

// Debounced автосохранение
const debouncedAutoSave = (() => {
    let timeout = null;
    return () => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            autoSave();
        }, 3000);
    };
})();

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    // Проверка аутентификации
    if (!api.isAdminLoggedIn()) {
        console.warn('Не авторизован, редирект на страницу входа');
        window.location.href = '/login/login.html';
        return;
    }

    try {
        await api.getAdminMe();
        console.log('Аутентификация успешна');
    } catch (error) {
        console.error('Ошибка проверки аутентификации:', error);
        window.location.href = '/login/login.html';
        return;
    }

    // Получаем pageId из URL
    const urlParams = new URLSearchParams(window.location.search);
    currentPageId = urlParams.get('pageId');

    initModals();
    initSaveButton();
    initLanguageSwitcher();
    initSearch();
    initMobileMenu();
    await loadPages();
    
    if (currentPageId) {
        expandedPages.add(parseInt(currentPageId));
        await loadPageBlocks(currentPageId);
    }
});

// Инициализация модальных окон
function initModals() {
    // Object Modal (переименовали из Block Modal)
    const objectModal = document.getElementById('blockModal');
    const closeObjectModal = document.getElementById('closeBlockModal');
    const objectForm = document.getElementById('blockForm');
    
    if (closeObjectModal) {
        closeObjectModal.addEventListener('click', () => {
            // Проверяем, есть ли несохраненные данные
            const typeSelect = document.getElementById('blockType');
            const contentInput = document.getElementById('blockContent');
            
            if (typeSelect.value || contentInput.value.trim()) {
                if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
                    return;
                }
            }
            
            objectModal.style.display = 'none';
            currentBlockId = null;
            // Удаляем временные элементы если есть
            const uploadBtn = document.getElementById('uploadImageBtn');
            if (uploadBtn) uploadBtn.remove();
        });
    }
    
    if (objectForm) {
        objectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveObject();
        });
    }
    
    // Page Modal
    const pageModal = document.getElementById('pageModal');
    const closePageModal = document.getElementById('closePageModal');
    const pageForm = document.getElementById('pageForm');
    
    if (closePageModal) {
        closePageModal.addEventListener('click', () => {
            // Проверяем, есть ли несохраненные данные
            const titleInput = document.getElementById('pageTitle');
            const slugInput = document.getElementById('pageSlug');
            
            if (titleInput.value.trim() || slugInput.value.trim()) {
                if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
                    return;
                }
            }
            
            pageModal.style.display = 'none';
        });
    }
    
    if (pageForm) {
        pageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await savePage();
        });
    }
    
    // Close on overlay click
    document.querySelectorAll('.add-object-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', () => {
            // Проверяем несохраненные данные для object modal
            const typeSelect = document.getElementById('blockType');
            const contentInput = document.getElementById('blockContent');
            
            if (objectModal.style.display === 'flex' && (typeSelect.value || contentInput.value.trim())) {
                if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
                    return;
                }
            }
            
            // Проверяем несохраненные данные для page modal
            const titleInput = document.getElementById('pageTitle');
            const slugInput = document.getElementById('pageSlug');
            
            if (pageModal.style.display === 'flex' && (titleInput.value.trim() || slugInput.value.trim())) {
                if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
                    return;
                }
            }
            
            objectModal.style.display = 'none';
            pageModal.style.display = 'none';
            currentBlockId = null;
            // Удаляем временные элементы если есть
            const uploadBtn = document.getElementById('uploadImageBtn');
            if (uploadBtn) uploadBtn.remove();
        });
    });
}

// Инициализация языкового свитчера
function initLanguageSwitcher() {
    const switcherBtn = document.getElementById('languageSwitcherBtn');
    const dropdown = document.getElementById('languageSwitcherDropdown');
    const currentLangDisplay = document.getElementById('currentLanguage');
    
    if (!switcherBtn || !dropdown) return;
    
    const options = dropdown.querySelectorAll('.language-switcher-option');
    
    // Установить текущий язык
    updateLanguageDisplay();
    
    // Toggle dropdown
    switcherBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('open');
        if (isOpen) {
            dropdown.classList.remove('open');
            switcherBtn.classList.remove('active');
        } else {
            dropdown.classList.add('open');
            switcherBtn.classList.add('active');
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!switcherBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
            switcherBtn.classList.remove('active');
        }
    });
    
    // Handle language selection
    options.forEach(option => {
        option.addEventListener('click', async function(e) {
            e.stopPropagation();
            const lang = this.dataset.lang;
            
            if (lang !== currentLanguage) {
                currentLanguage = lang;
                localStorage.setItem('adminLanguage', currentLanguage);
                updateLanguageDisplay();
                dropdown.classList.remove('open');
                switcherBtn.classList.remove('active');
                
                // Перезагрузить данные
                await loadPages();
                if (currentPageId) {
                    await loadPageBlocks(currentPageId);
                }
            }
        });
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && dropdown.classList.contains('open')) {
            dropdown.classList.remove('open');
            switcherBtn.classList.remove('active');
        }
    });
    
    function updateLanguageDisplay() {
        const langMap = { 'ru': 'RU', 'en': 'EN' };
        if (currentLangDisplay) {
            currentLangDisplay.textContent = langMap[currentLanguage] || 'RU';
        }
        options.forEach(opt => {
            if (opt.dataset.lang === currentLanguage) {
                opt.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            } else {
                opt.style.backgroundColor = 'transparent';
            }
        });
    }
}

// Инициализация поиска
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchContainer = searchInput?.parentElement;
    
    if (!searchInput) return;
    
    // Анимация при фокусе
    searchInput.addEventListener('focus', () => {
        searchContainer.style.transform = 'scale(1.02)';
        searchContainer.style.boxShadow = '0 0 20px rgba(100, 149, 237, 0.3)';
    });
    
    searchInput.addEventListener('blur', () => {
        searchContainer.style.transform = 'scale(1)';
        searchContainer.style.boxShadow = 'none';
    });
    
    // Debounced поиск
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, 300);
    });
}

// Выполнить поиск
function performSearch(query) {
    const searchQuery = query.toLowerCase().trim();
    
    if (!searchQuery) {
        // Если поиск пустой - показываем все страницы
        renderPagesList();
        return;
    }
    
    // Фильтруем страницы по названию
    const filteredPages = pages.filter(page => {
        const title = (page.title || page.name || '').toLowerCase();
        return title.includes(searchQuery);
    });
    
    console.log(`Найдено страниц: ${filteredPages.length} из ${pages.length}`);
    
    // Рендерим только найденные страницы
    renderFilteredPages(filteredPages, searchQuery);
}

// Рендер отфильтрованных страниц
function renderFilteredPages(filteredPages, searchQuery) {
    const pagesList = document.getElementById('pagesList');
    if (!pagesList) return;
    
    pagesList.innerHTML = '';
    
    if (filteredPages.length === 0) {
        // Сообщение если ничего не найдено
        const noResults = document.createElement('div');
        noResults.style.cssText = 'padding: 20px; text-align: center; color: rgba(255,255,255,0.5); font-size: 14px;';
        noResults.textContent = 'No pages found';
        pagesList.appendChild(noResults);
        return;
    }
    
    filteredPages.forEach(page => {
        const isActive = page.id == currentPageId;
        const isExpanded = expandedPages.has(page.id);
        
        // Кнопка страницы с подсветкой найденного текста
        const pageBtn = document.createElement('div');
        pageBtn.className = isActive ? 'frame-31 active search-result' : 'frame-31 search-result';
        
        const pageTitle = escapeHtml(page.title || page.name);
        const highlightedTitle = highlightSearchQuery(pageTitle, searchQuery);
        
        pageBtn.innerHTML = `
            <div class="text-wrapper-3">${highlightedTitle}</div>
            <img class="arrow-forward-ios ${isExpanded ? 'expanded' : ''}" src="https://c.animaapp.com/mjkrezacKyXbCJ/img/arrow-forward-ios-24dp-e3e3e3-fill0-wght400-grad0-opsz24--1--1-3.svg" />
        `;
        
        pageBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            if (expandedPages.has(page.id)) {
                expandedPages.delete(page.id);
                performSearch(searchQuery); // Перерисовываем с поиском
            } else {
                expandedPages.clear();
                expandedPages.add(page.id);
                currentPageId = page.id;
                window.history.pushState({}, '', `/admin/editing/index.html?pageId=${page.id}`);
                await loadPageBlocks(page.id);
            }
        });
        
        // Анимация появления
        pageBtn.style.animation = 'fadeInSlide 0.3s ease-out';
        
        pagesList.appendChild(pageBtn);
        
        // Блоки если страница раскрыта
        if (isExpanded) {
            const blocksContainer = document.createElement('div');
            blocksContainer.className = 'blocks-container';
            
            const pageBlocks = (page.id == currentPageId) ? blocks : [];
            
            if (pageBlocks.length > 1) {
                pageBlocks.slice(1).forEach(block => {
                    const blockContent = block.content || '';
                    const lines = blockContent.split('\n').filter(line => line.trim());
                    const blockTitle = lines[0] || `Block ${block.id}`;
                    
                    const blockBtn = document.createElement('div');
                    blockBtn.className = 'frame-32';
                    blockBtn.innerHTML = `<div class="text-wrapper-3">${escapeHtml(blockTitle)}</div>`;
                    
                    blockBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        scrollToBlock(block.id);
                    });
                    
                    blocksContainer.appendChild(blockBtn);
                });
            }
            
            const addBlockBtn = document.createElement('div');
            addBlockBtn.className = 'frame-27';
            addBlockBtn.innerHTML = `
                <img class="ic-baseline-plus" src="https://c.animaapp.com/mjkrezacKyXbCJ/img/ic-baseline-plus.svg" />
                <div class="text-wrapper-2">Add block</div>
            `;
            addBlockBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await createNewBlock();
            });
            blocksContainer.appendChild(addBlockBtn);
            
            pagesList.appendChild(blocksContainer);
        }
    });
    
    // Кнопка Add page
    const addPageBtn = document.createElement('div');
    addPageBtn.className = 'frame-35';
    addPageBtn.innerHTML = `
        <img class="ic-baseline-plus" src="https://c.animaapp.com/mjkrezacKyXbCJ/img/ic-baseline-plus.svg" />
        <div class="text-wrapper-2">Add page</div>
    `;
    addPageBtn.addEventListener('click', () => openPageModal());
    pagesList.appendChild(addPageBtn);
}

// Подсветка найденного текста
function highlightSearchQuery(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark style="background: rgba(100, 149, 237, 0.4); color: white; padding: 2px 4px; border-radius: 2px;">$1</mark>');
}

// Инициализация мобильного меню
function initMobileMenu() {
    // Создаём кнопку бургера если её нет
    let menuBtn = document.querySelector('.mobile-menu-btn');
    if (!menuBtn) {
        menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        document.body.appendChild(menuBtn);
    }
    
    // Создаём overlay для меню
    let overlay = document.querySelector('.mobile-menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        document.body.appendChild(overlay);
    }
    
    const menu = document.querySelector('.frame-29');
    
    // Открыть/закрыть меню
    function toggleMenu() {
        const isOpen = menu.classList.contains('mobile-menu-open');
        
        if (isOpen) {
            menu.classList.remove('mobile-menu-open');
            overlay.classList.remove('active');
            menuBtn.classList.remove('active');
        } else {
            menu.classList.add('mobile-menu-open');
            overlay.classList.add('active');
            menuBtn.classList.add('active');
        }
    }
    
    // Закрыть меню
    function closeMenu() {
        menu.classList.remove('mobile-menu-open');
        overlay.classList.remove('active');
        menuBtn.classList.remove('active');
    }
    
    // Обработчики событий
    menuBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);
    
    // Закрывать меню при выборе страницы (на мобильных)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            const pageBtn = e.target.closest('.frame-31');
            if (pageBtn && menu.classList.contains('mobile-menu-open')) {
                setTimeout(closeMenu, 300); // Небольшая задержка для плавности
            }
        }
    });
}

// Инициализация кнопки Save
function initSaveButton() {
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            await saveAllChanges();
        });
    }
}

// Загрузка списка страниц
async function loadPages() {
    try {
        const response = await api.adminGetPages(currentLanguage);
        pages = response?.data || response || [];
        console.log('Загружено страниц:', pages.length);
        renderPagesList();
    } catch (error) {
        console.error('Ошибка загрузки страниц:', error);
    }
}

// Рендер списка страниц в левой панели
function renderPagesList() {
    const pagesList = document.getElementById('pagesList');
    if (!pagesList) return;
    
    pagesList.innerHTML = '';
    
    pages.forEach(page => {
        const isActive = page.id == currentPageId;
        const isExpanded = expandedPages.has(page.id);
        
        // Кнопка страницы
        const pageBtn = document.createElement('div');
        pageBtn.className = isActive ? 'frame-31 active' : 'frame-31';
        pageBtn.innerHTML = `
            <div class="text-wrapper-3">${escapeHtml(page.title || page.name)}</div>
            <img class="arrow-forward-ios ${isExpanded ? 'expanded' : ''}" src="https://c.animaapp.com/mjkrezacKyXbCJ/img/arrow-forward-ios-24dp-e3e3e3-fill0-wght400-grad0-opsz24--1--1-3.svg" />
        `;
        
        pageBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            // Переключаем раскрытие страницы
            if (expandedPages.has(page.id)) {
                // Закрываем текущую страницу
                expandedPages.delete(page.id);
                renderPagesList();
            } else {
                // Закрываем все другие страницы и открываем текущую
                expandedPages.clear();
                expandedPages.add(page.id);
                
                // Устанавливаем текущую страницу
                currentPageId = page.id;
                // Обновляем URL
                window.history.pushState({}, '', `/admin/editing/index.html?pageId=${page.id}`);
                
                // Всегда загружаем блоки для отображения
                await loadPageBlocks(page.id);
            }
        });
        
        pagesList.appendChild(pageBtn);
        
        // Если страница раскрыта, показываем её блоки
        if (isExpanded) {
            const blocksContainer = document.createElement('div');
            blocksContainer.className = 'blocks-container';
            
            // Получаем блоки для этой страницы
            const pageBlocks = (page.id == currentPageId) ? blocks : [];
            
            // Показываем блоки (кроме первого - заголовка страницы)
            if (pageBlocks.length > 1) {
                pageBlocks.slice(1).forEach(block => {
                    // Получаем первую строку контента как название блока
                    const blockContent = block.content || '';
                    const lines = blockContent.split('\n').filter(line => line.trim());
                    const blockTitle = lines[0] || `Block ${block.id}`;
                    
                    const blockBtn = document.createElement('div');
                    blockBtn.className = 'frame-32';
                    blockBtn.innerHTML = `<div class="text-wrapper-3">${escapeHtml(blockTitle)}</div>`;
                    
                    blockBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        scrollToBlock(block.id);
                    });
                    
                    blocksContainer.appendChild(blockBtn);
                });
            }
            
            // Кнопка Add block (всегда показываем для раскрытой страницы)
            const addBlockBtn = document.createElement('div');
            addBlockBtn.className = 'frame-27';
            addBlockBtn.innerHTML = `
                <img class="ic-baseline-plus" src="https://c.animaapp.com/mjkrezacKyXbCJ/img/ic-baseline-plus.svg" />
                <div class="text-wrapper-2">Add block</div>
            `;
            addBlockBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                // Создаем блок
                await createNewBlock();
            });
            blocksContainer.appendChild(addBlockBtn);
            
            pagesList.appendChild(blocksContainer);
        }
    });
    
    // Кнопка Add page
    const addPageBtn = document.createElement('div');
    addPageBtn.className = 'frame-35';
    addPageBtn.innerHTML = `
        <img class="ic-baseline-plus" src="https://c.animaapp.com/mjkrezacKyXbCJ/img/ic-baseline-plus.svg" />
        <div class="text-wrapper-2">Add page</div>
    `;
    addPageBtn.addEventListener('click', () => openPageModal());
    pagesList.appendChild(addPageBtn);
}

// Загрузка блоков страницы
async function loadPageBlocks(pageId) {
    console.log(`=== loadPageBlocks ===`);
    console.log(`Page ID: ${pageId}`);
    console.log(`Текущие блоки в памяти:`, blocks.length);
    
    try {
        const response = await api.adminGetBlocks(pageId, currentLanguage);
        blocks = response?.data || response || [];
        console.log('✅ Загружено блоков с сервера:', blocks.length);
        
        // Логируем каждый блок
        blocks.forEach((block, index) => {
            console.log(`  Блок ${index}: ID=${block.id}, type=${block.block_type_id}, content length=${block.content?.length || 0}`);
        });
        
        // Если нет блоков, создаем первый блок (заголовок страницы)
        if (blocks.length === 0) {
            console.log('Нет блоков, создаём заголовок страницы...');
            const page = pages.find(p => p.id == pageId);
            const pageTitle = page?.title || page?.name || 'New Page';
            await createPageHeaderBlock(pageId, pageTitle);
            
            // Перезагружаем блоки
            const newResponse = await api.adminGetBlocks(pageId, currentLanguage);
            blocks = newResponse?.data || newResponse || [];
            console.log('✅ После создания заголовка:', blocks.length, 'блоков');
        }
        
        renderBlocks();
        renderPagesList(); // Обновляем список страниц чтобы показать блоки
    } catch (error) {
        console.error('❌ Ошибка загрузки блоков:', error);
    }
}

// Рендер блоков в правой части
function renderBlocks() {
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    
    contentArea.innerHTML = '';
    
    // Если страница не выбрана, не показываем ничего
    if (!currentPageId || blocks.length === 0) {
        return;
    }
    
    // Получаем название текущей страницы
    const currentPage = pages.find(p => p.id == currentPageId);
    const pageTitle = currentPage?.title || currentPage?.name || 'Page';
    
    console.log('🔄 Рендеринг блоков, всего:', blocks.length);
    
    // Блоки всегда должны быть (минимум первый блок - заголовок страницы)
    blocks.forEach((block, index) => {
        try {
            console.log(`  → Рендерим блок ${index + 1}/${blocks.length}: ID=${block.id}, type=${block.block_type_id}`);
        const blockSection = createBlockElement(block, index, pageTitle);
        contentArea.appendChild(blockSection);
            console.log(`  ✅ Блок ${block.id} отрендерен`);
        } catch (error) {
            console.error(`  ❌ ОШИБКА рендеринга блока ${block.id}:`, error);
            // Продолжаем рендерить остальные блоки
            const errorBlock = document.createElement('div');
            errorBlock.style.cssText = 'padding: 20px; background: rgba(255, 0, 0, 0.1); border: 1px solid red; border-radius: 4px; margin: 10px 0;';
            errorBlock.innerHTML = `
                <h3 style="color: #ff6b6b;">⚠️ Ошибка рендеринга блока ID: ${block.id}</h3>
                <p style="color: #fff; font-size: 14px;">${error.message}</p>
                <button onclick="if(confirm('Delete broken block?')) { window.location.reload(); }" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete this block</button>
            `;
            contentArea.appendChild(errorBlock);
        }
    });
    
    console.log('✅ Рендеринг завершён');
}

// Создание элемента блока
function createBlockElement(block, index, pageTitle = 'Page') {
    const section = document.createElement('div');
    section.className = 'frame-8';
    section.dataset.blockId = block.id;
    section.id = `block-${block.id}`;
    
    // Проверяем, это первый блок (заголовок страницы)
    const isPageHeader = index === 0;
    
    // Заголовок блока
    const header = document.createElement('div');
    header.className = 'frame-9';
    
    // Получаем первую строку контента как название блока
    const blockContent = block.content || '';
    const lines = blockContent.split('\n').filter(line => line.trim());
    // Для первого блока используем контент или название страницы
    const blockTitle = lines[0] || (isPageHeader ? pageTitle : `Block ${index + 1}`);
    
    // Для первого блока (заголовок страницы) - без кнопки удаления
    if (isPageHeader) {
        header.innerHTML = `
            <div class="frame-4">
                <div class="frame-10">
                    <img class="af-fa-c" src="https://c.animaapp.com/mjkrezacKyXbCJ/img/a1f36730-fa95-49c3-910f-2d84c88b3282-1-1.png" />
                    <div class="frame-11">
                        <div class="list" contenteditable="true" data-block-id="${block.id}" data-field="title">${escapeHtml(blockTitle)}</div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Для остальных блоков - с кнопкой удаления, без кнопки добавления строки
        header.innerHTML = `
            <div class="frame-4">
                <div class="frame-10">
                    <img class="af-fa-c" src="https://c.animaapp.com/mjkrezacKyXbCJ/img/a1f36730-fa95-49c3-910f-2d84c88b3282-1-1.png" />
                    <div class="frame-11">
                        <div class="list" contenteditable="true" data-block-id="${block.id}" data-field="title">${escapeHtml(blockTitle)}</div>
                        <img class="line" src="https://c.animaapp.com/mjkrezacKyXbCJ/img/line-1.svg" />
                    </div>
                </div>
            </div>
            <div class="frame-13 delete-btn" style="cursor: pointer;" data-action="delete" data-block-id="${block.id}">
                <img class="material-symbols-2" src="https://c.animaapp.com/mjkrezacKyXbCJ/img/material-symbols-delete-outline.svg" />
                <div class="delete">Delete this block</div>
            </div>
        `;
    }
    
    // Обработчик для редактирования заголовка (первой строки)
    const titleElement = header.querySelector('[data-field="title"]');
    
    // Обработка Enter - создание новой строки
    titleElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Для первого блока - добавляем новую строку
            if (isPageHeader) {
                addNewLineToBlock(block.id);
            }
        }
    });
    
    // Отмечаем изменения при редактировании
    titleElement.addEventListener('input', () => {
        hasUnsavedChanges = true;
        markAsUnsaved();
        // Автосохранение через 3 секунды после последнего изменения
        debouncedAutoSave();
    });
    
    // Валидация при потере фокуса
    titleElement.addEventListener('blur', () => {
        const newTitle = titleElement.textContent.trim();
        if (!newTitle) {
            titleElement.textContent = blockTitle;
        }
    });
    
    // Обработчик для удаления (только для не-первых блоков)
    if (!isPageHeader) {
        const deleteBtn = header.querySelector('[data-action="delete"]');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteBlock(block.id));
        }
    }
    
    section.appendChild(header);
    
    // Контент блока
    const content = document.createElement('div');
    content.className = 'frame-14';
    
    const blockType = block.block_type_id;
    
    // Для отображения строк пропускаем первую строку (она уже в заголовке)
    const contentLines = lines.slice(1); // Пропускаем первую строку (заголовок)
    
    if (!blockContent.trim()) {
        // Если нет контента - не показываем ничего (блок пустой)
    } else if (blockType === 3) {
        // List type - специальный тип блока (весь текст в одном контейнере)
        const listContainer = document.createElement('div');
        listContainer.className = 'frame-15';
        listContainer.style.cssText = '';
        
        // Весь текст (кроме заголовка) в одном блоке
        const listText = contentLines.join('\n');
        
        listContainer.innerHTML = `
            <div class="list-wrapper" style="flex: 1; min-width: 0; padding: 12px 20px; background: rgba(255,255,255,0.05); border-radius: 4px; border: 1px solid rgba(255,255,255,0.2);">
                <p class="p" style="margin: 0;">
                    <span class="text-wrapper-6" contenteditable="true" data-block-id="${block.id}" data-field="list-content" 
                          style="white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; display: block; line-height: 1.6;">${escapeHtml(listText)}</span>
                </p>
            </div>
        `;
        
        // Обработчик редактирования
        const listElement = listContainer.querySelector('[contenteditable="true"]');
        listElement.addEventListener('input', () => {
            hasUnsavedChanges = true;
            markAsUnsaved();
            debouncedAutoSave();
        });
        
        content.appendChild(listContainer);
        
    } else if (blockType === 2) {
        // Picture type - блок может содержать текст И изображения
        const contentLines = blockContent.split('\n').filter(l => l.trim());
        
        console.log('=== Рендеринг Picture блока ===');
        console.log('Block ID:', block.id);
        console.log('Content lines:', contentLines);
        
        // Парсим контент - находим текстовые строки и изображения
        let i = 1; // Пропускаем заголовок (он уже отображён)
        let iterations = 0;
        const maxIterations = 1000; // ЗАЩИТА от бесконечного цикла
        
        while (i < contentLines.length && iterations < maxIterations) {
            iterations++;
            const line = contentLines[i];
            
            // ЗАЩИТА: Пропускаем битые данные (size: без URL перед ним)
            if (line.startsWith('size:')) {
                console.warn('⚠️ Найдена битая строка size: без URL, пропускаем:', line);
                i++;
                continue;
            }
            
            // Проверяем - это изображение?
            if (line.startsWith('/uploads/') || line.startsWith('http')) {
                let imageUrl = line;
                
                // Следующая строка - размер? (пропускаем)
                if (i + 1 < contentLines.length && contentLines[i + 1].startsWith('size:')) {
                    i++; // Пропускаем строку size:
                    // Всё! Описаний больше нет
                }
                
                // Настройки размера для фото
                // Фото будет полностью видно без серых рамок
                const imageMaxWidth = '600px';   // Максимальная ширина
                const imageMaxHeight = '500px';  // Максимальная высота
                
                // Формируем полный URL для изображения
                if (!imageUrl.startsWith('http')) {
                    if (!imageUrl.startsWith('/')) {
                        imageUrl = '/' + imageUrl;
                    }
                    imageUrl = 'http://localhost:3000' + imageUrl;
                }
                
                // Создаём контейнер для изображения
                const imageContainer = document.createElement('div');
                imageContainer.className = 'frame-4';
                imageContainer.style.cssText = 'display: flex; flex-direction: column; align-items: center; width: 100%; margin-top: 12px;';
                imageContainer.innerHTML = `
                    <div class="image-wrapper" style="position: relative; display: inline-block; max-width: 100%;">
                        <img class="image" src="${escapeHtml(imageUrl)}" alt="Block image" 
                             style="max-width: ${imageMaxWidth}; max-height: ${imageMaxHeight}; width: auto; height: auto; display: block; border-radius: 4px;"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                        <div style="display:none; align-items:center; justify-content:center; height:260px; color:#999; background: rgba(255,255,255,0.05); border-radius: 4px; border: 1px dashed rgba(255,255,255,0.3);">
                            Image not found: ${escapeHtml(imageUrl)}
                        </div>
                        <button class="delete-image-btn" data-image-url="${escapeHtml(line)}" title="Delete this image" 
                                style="position: absolute; top: 10px; right: 10px; background: rgba(220, 53, 69, 0.9); border: none; border-radius: 4px; padding: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">
                            <img src="https://c.animaapp.com/mjkrezacKyXbCJ/img/material-symbols-delete-outline.svg" style="width: 20px; height: 20px;" />
                        </button>
                    </div>
                `;
                
                // Обработчик удаления этого изображения
                const deleteBtn = imageContainer.querySelector('.delete-image-btn');
                deleteBtn.addEventListener('click', async () => {
                    if (confirm('Delete this image?')) {
                        await deleteImageFromBlock(block.id, line);
                    }
                });
                
                deleteBtn.addEventListener('mouseenter', () => {
                    deleteBtn.style.background = 'rgba(220, 53, 69, 1)';
                });
                deleteBtn.addEventListener('mouseleave', () => {
                    deleteBtn.style.background = 'rgba(220, 53, 69, 0.9)';
                });
                
                content.appendChild(imageContainer);
                
            } else if (line === '[LIST]') {
                // Начало List объекта - собираем до [/LIST]
                const listLines = [];
                i++; // Пропускаем [LIST]
                
                while (i < contentLines.length && contentLines[i] !== '[/LIST]') {
                    listLines.push(contentLines[i]);
                    i++;
            }
                
                i++; // Пропускаем [/LIST]
                
                // Рендерим List объект
                const listContainer = document.createElement('div');
                listContainer.className = 'frame-15';
                listContainer.style.cssText = 'margin-top: 12px;';
                
                const listText = listLines.join('\n');
                
                listContainer.innerHTML = `
                    <div class="list-wrapper" style="flex: 1; min-width: 0; padding: 12px 20px; background: rgba(255,255,255,0.05); border-radius: 4px; border: 1px solid rgba(255,255,255,0.2);">
                        <p class="p" style="margin: 0;">
                            <span class="text-wrapper-6" contenteditable="true" data-block-id="${block.id}" data-list-object="true" 
                                  style="white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; display: block; line-height: 1.6;">${escapeHtml(listText)}</span>
                        </p>
                    </div>
                    <button class="delete-list-btn" data-block-id="${block.id}" title="Delete list" style="flex-shrink: 0;">
                        <img src="https://c.animaapp.com/mjkrezacKyXbCJ/img/material-symbols-delete-outline.svg" style="width: 20px; height: 20px;" />
                    </button>
                `;
                
                // Обработчик редактирования
                const listElement = listContainer.querySelector('[contenteditable="true"]');
                listElement.addEventListener('input', () => {
                    hasUnsavedChanges = true;
                    markAsUnsaved();
                    debouncedAutoSave();
                });
        
                // Обработчик удаления списка
                const deleteBtn = listContainer.querySelector('.delete-list-btn');
                deleteBtn.addEventListener('click', async () => {
                    if (confirm('Delete this list?')) {
                        await deleteListObjectFromBlock(block.id, listText);
                    }
                });
                
                content.appendChild(listContainer);
                
            } else {
                // Это текстовая строка
            const item = document.createElement('div');
            item.className = 'frame-15';
            item.innerHTML = `
                    <div class="list-wrapper" style="flex: 1; min-width: 0;">
                        <p class="p" style="margin: 0;">
                            <span class="text-wrapper-6" contenteditable="true" data-block-id="${block.id}" data-line="${i - 1}" 
                                  style="white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; display: block;">${escapeHtml(line)}</span>
                    </p>
                </div>
                    <button class="delete-line-btn" data-block-id="${block.id}" data-line="${i - 1}" title="Delete line" style="flex-shrink: 0;">
                        <img src="https://c.animaapp.com/mjkrezacKyXbCJ/img/material-symbols-delete-outline.svg" style="width: 20px; height: 20px;" />
                    </button>
                `;
                
                // Обработчик для удаления строки
                const deleteLineBtn = item.querySelector('.delete-line-btn');
                if (deleteLineBtn) {
                    deleteLineBtn.addEventListener('click', async () => {
                        if (confirm('Delete this line?')) {
                            await deleteTextLineFromBlock(block.id, line);
                        }
                    });
                }
            
            // Обработчик для редактирования строки
            const lineElement = item.querySelector('[contenteditable="true"]');
                lineElement.addEventListener('keydown', async (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        addNewLineToBlock(block.id);
                    }
                });
            lineElement.addEventListener('input', () => {
                hasUnsavedChanges = true;
                markAsUnsaved();
                debouncedAutoSave();
            });
            
            content.appendChild(item);
                i++;
            }
        }
    } else {
        // Text type - отображаем строки И List объекты
        let i = 0;
        let iterations = 0;
        const maxIterations = 1000; // ЗАЩИТА от бесконечного цикла
        
        while (i < contentLines.length && iterations < maxIterations) {
            iterations++;
            const line = contentLines[i];
            
            // ЗАЩИТА: Пропускаем битые данные (size: без URL перед ним)
            if (line.startsWith('size:')) {
                console.warn('⚠️ Найдена битая строка size: без URL, пропускаем:', line);
                i++;
                continue;
            }
            
            // Проверяем - это начало List объекта?
            if (line === '[LIST]') {
                // Собираем все строки списка до [/LIST]
                const listLines = [];
                i++; // Пропускаем [LIST]
                
                while (i < contentLines.length && contentLines[i] !== '[/LIST]') {
                    listLines.push(contentLines[i]);
                    i++;
                }
                
                i++; // Пропускаем [/LIST]
                
                // Рендерим List объект в контейнере
                const listContainer = document.createElement('div');
                listContainer.className = 'frame-15';
                listContainer.style.cssText = 'margin-top: 12px;';
                
                const listText = listLines.join('\n');
                
                listContainer.innerHTML = `
                    <div class="list-wrapper" style="flex: 1; min-width: 0; padding: 12px 20px; background: rgba(255,255,255,0.05); border-radius: 4px; border: 1px solid rgba(255,255,255,0.2);">
                        <p class="p" style="margin: 0;">
                            <span class="text-wrapper-6" contenteditable="true" data-block-id="${block.id}" data-list-object="true" 
                                  style="white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; display: block; line-height: 1.6;">${escapeHtml(listText)}</span>
                        </p>
                </div>
                    <button class="delete-list-btn" data-block-id="${block.id}" title="Delete list" style="flex-shrink: 0;">
                    <img src="https://c.animaapp.com/mjkrezacKyXbCJ/img/material-symbols-delete-outline.svg" style="width: 20px; height: 20px;" />
                </button>
                `;
                
                // Обработчик редактирования
                const listElement = listContainer.querySelector('[contenteditable="true"]');
                listElement.addEventListener('input', () => {
                    hasUnsavedChanges = true;
                    markAsUnsaved();
                    debouncedAutoSave();
                });
        
                // Обработчик удаления списка
                const deleteBtn = listContainer.querySelector('.delete-list-btn');
                deleteBtn.addEventListener('click', async () => {
                    if (confirm('Delete this list?')) {
                        await deleteListObjectFromBlock(block.id, listText);
            }
        });
        
                content.appendChild(listContainer);
                
    } else {
                // Обычная текстовая строка
            const item = document.createElement('div');
            item.className = 'frame-15';
            
            item.innerHTML = `
                    <div class="list-wrapper" style="flex: 1; min-width: 0;">
                        <p class="p" style="margin: 0;">
                            <span class="text-wrapper-6" contenteditable="true" data-block-id="${block.id}" data-line="${i}" 
                                  style="white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; display: block;">${escapeHtml(line)}</span>
                    </p>
                </div>
                    <button class="delete-line-btn" data-block-id="${block.id}" data-line="${i}" title="Delete line" style="flex-shrink: 0;">
                    <img src="https://c.animaapp.com/mjkrezacKyXbCJ/img/material-symbols-delete-outline.svg" style="width: 20px; height: 20px;" />
                </button>
            `;
            
            // Обработчик для удаления строки
            const deleteLineBtn = item.querySelector('.delete-line-btn');
            if (deleteLineBtn) {
                deleteLineBtn.addEventListener('click', async () => {
                    if (confirm('Delete this line?')) {
                            await deleteLineFromBlock(block.id, i);
                    }
                });
            }
            
            // Обработчик для редактирования строки
            const lineElement = item.querySelector('[contenteditable="true"]');
            
            // Обработка Enter - создание новой строки
            lineElement.addEventListener('keydown', async (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addNewLineToBlock(block.id);
                }
            });
            
            // Отмечаем изменения при редактировании
            lineElement.addEventListener('input', () => {
                hasUnsavedChanges = true;
                markAsUnsaved();
                debouncedAutoSave();
            });
            
            content.appendChild(item);
                i++;
            }
        }
    }
    
    section.appendChild(content);
    
    // Кнопка frame-12 для добавления текстовых строк
    // Показываем для всех блоков (можно добавлять текст даже в блоки с картинками)
    const addLineBtn = document.createElement('img');
    addLineBtn.className = 'frame-12 add-text-line-btn';
    addLineBtn.src = 'https://c.animaapp.com/mjkrezacKyXbCJ/img/frame-48.svg';
    addLineBtn.style.cursor = 'pointer';
    addLineBtn.style.marginTop = '12px';
    addLineBtn.title = 'Add text line';
    addLineBtn.addEventListener('click', () => addNewLineToBlock(block.id));
    section.appendChild(addLineBtn);
    
    // Кнопка Add object под блоком
    // ТОЛЬКО для НЕ-первых блоков - добавляет объект ВНУТРЬ блока
    if (!isPageHeader) {
        const addObjectBtn = document.createElement('div');
        addObjectBtn.className = 'frame-27';
        addObjectBtn.style.marginTop = '12px';
        addObjectBtn.innerHTML = `
            <img class="ic-baseline-plus" src="https://c.animaapp.com/mjkrezacKyXbCJ/img/ic-baseline-plus.svg" />
            <div class="text-wrapper-2">Add object</div>
        `;
        addObjectBtn.addEventListener('click', () => openObjectModal(block.id));
        section.appendChild(addObjectBtn);
    }
    
    return section;
}

// Обновление перевода блока
async function updateBlockTranslation(blockId, content) {
    console.log(`=== updateBlockTranslation ===`);
    console.log(`Block ID: ${blockId}`);
    console.log(`Content to save:`, content);
    console.log(`Content length: ${content.length} chars`);
    
    try {
        // Пытаемся обновить существующий перевод
        await api.adminUpdateBlockTranslation(blockId, currentLanguage, { content });
        console.log('✅ Перевод блока обновлен');
    } catch (error) {
        console.error('❌ Ошибка обновления перевода блока:', error);
        
        // Если перевод не существует (404), создаем его
        if (error.status === 404 || 
            (error.data && error.data.error && typeof error.data.error === 'string' && error.data.error.includes('not found'))) {
            try {
                console.log('Перевод не найден, создаём новый...');
                // API ожидает language, а не lang
                await api.adminCreateBlockTranslation(blockId, currentLanguage, { 
                    language: currentLanguage,
                    content 
                });
                console.log('✅ Перевод блока создан');
            } catch (createError) {
                console.error('❌ Ошибка создания перевода:', createError);
                throw createError;
            }
        } else {
            // Для других ошибок (например, 400 - пустой контент) пробрасываем дальше
            throw error;
        }
    }
}

// Открыть модальное окно объекта
function openObjectModal(blockId) {
    const modal = document.getElementById('blockModal');
    const title = document.getElementById('blockModalTitle');
    const typeSelect = document.getElementById('blockType');
    const contentInput = document.getElementById('blockContent');
    
    currentBlockId = blockId; // Редактируем существующий блок, добавляем объект в него
    title.textContent = 'Add Object';
    typeSelect.value = '';
    contentInput.value = '';
    
    // Удаляем старую кнопку загрузки если есть
    const oldUploadBtn = document.getElementById('uploadImageBtn');
    if (oldUploadBtn) oldUploadBtn.remove();
    
    // Удаляем старое поле для комментария если есть
    const oldCommentInput = document.getElementById('imageCommentInput');
    if (oldCommentInput) oldCommentInput.remove();
    
    // Обработчик изменения типа объекта
    typeSelect.onchange = () => {
        const objectType = typeSelect.value;
        if (objectType === '2') {
            // Picture type - показываем кнопку загрузки
            contentInput.placeholder = 'Image URL will appear here after upload...';
            contentInput.readOnly = true;
            contentInput.style.backgroundColor = 'rgba(255,255,255,0.05)';
            
            // Скрываем select для размера если есть (больше не нужен)
            const sizeSelect = document.getElementById('imageSizeSelect');
            if (sizeSelect) sizeSelect.style.display = 'none';
            
            // Скрываем поле комментария если есть (больше не нужно)
            const commentInput = document.getElementById('imageCommentInput');
            if (commentInput) commentInput.style.display = 'none';
            
            // Добавляем кнопку загрузки изображения
            let uploadBtn = document.getElementById('uploadImageBtn');
            if (!uploadBtn) {
                uploadBtn = document.createElement('input');
                uploadBtn.type = 'file';
                uploadBtn.id = 'uploadImageBtn';
                uploadBtn.accept = 'image/*';
                uploadBtn.style.cssText = 'width: 100%; padding: 10px; margin-top: 12px; background: rgba(64, 80, 152, 0.5); border: 1px solid rgba(255,255,255,0.3); border-radius: 2px; color: white; font-family: Montserrat, Helvetica; font-size: 14px; cursor: pointer;';
                uploadBtn.addEventListener('change', handleImageUpload);
                contentInput.parentNode.insertBefore(uploadBtn, contentInput.nextSibling);
            }
            uploadBtn.style.display = 'block';
        } else {
            // Скрываем кнопку загрузки
            const uploadBtn = document.getElementById('uploadImageBtn');
            if (uploadBtn) uploadBtn.style.display = 'none';
            
            // Возвращаем обычное поле ввода
            contentInput.readOnly = false;
            contentInput.style.backgroundColor = 'rgba(255,255,255,0.1)';
            
            if (objectType === '3') {
                contentInput.placeholder = 'Enter list content (each line will be a list item)...';
            } else {
                contentInput.placeholder = 'Enter text content...';
            }
        }
    };
    
    modal.style.display = 'flex';
}

// Загрузка изображения
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const response = await api.adminUploadImage(file);
        const imageUrl = response.data?.url || response.url;
        
        if (imageUrl) {
            // Показываем URL в поле (только для информации)
            document.getElementById('blockContent').value = imageUrl;
            alert('Image uploaded successfully!');
        }
    } catch (error) {
        console.error('Ошибка загрузки изображения:', error);
        alert('Error uploading image: ' + (error.message || 'Unknown error'));
    }
}

// Функция больше не используется - удаление изображений через deleteImageFromBlock

// Сохранить объект (добавляет объект ВНУТРЬ существующего блока)
async function saveObject() {
    console.log('=== saveObject() вызван ===');
    
    const typeSelect = document.getElementById('blockType');
    const contentInput = document.getElementById('blockContent');
    
    if (!typeSelect.value) {
        alert('Please select object type');
        return;
    }
    
    const block = blocks.find(b => b.id === currentBlockId);
    if (!block) {
        alert('Block not found');
        return;
    }
    
    const objectType = parseInt(typeSelect.value);
    
    // Читаем текущий контент блока из DOM
    const blockEl = document.getElementById(`block-${currentBlockId}`);
    if (!blockEl) {
        alert('Block element not found in DOM');
        return;
    }
    
    // Получаем заголовок блока (первая строка)
    const titleElement = blockEl.querySelector('[data-field="title"]');
    const blockTitle = titleElement ? titleElement.textContent.trim() : 'Block';
    
    // Получаем ВСЕ существующие строки из блока
    const contentLines = [blockTitle]; // Начинаем с заголовка
    
    // Парсим существующий контент блока правильно
    if (block.content) {
        const existingLines = block.content.split('\n');
        let i = 1; // Пропускаем заголовок
        let iterations = 0;
        const maxIterations = 1000; // ЗАЩИТА от бесконечного цикла
        
        while (i < existingLines.length && iterations < maxIterations) {
            iterations++;
            const line = existingLines[i].trim();
            
            // ЗАЩИТА: Пропускаем битые данные (size: или [LIST] без контента)
            if (line.startsWith('size:')) {
                console.warn('⚠️ Битая строка size: без URL, пропускаем');
                i++;
                continue;
            }
            
            if (line === '[/LIST]') {
                console.warn('⚠️ Найден закрывающий [/LIST] без открывающего, пропускаем');
                i++;
                continue;
            }
            
            // Если это URL изображения
            if (line.startsWith('/uploads/') || line.startsWith('http')) {
                contentLines.push(existingLines[i]); // URL
                i++;
                
                // Следующая строка - размер
                if (i < existingLines.length && existingLines[i].trim().startsWith('size:')) {
                    contentLines.push(existingLines[i]);
                    i++;
                }
            } else if (line === '[LIST]') {
                // Начало List объекта - сохраняем всё до [/LIST]
                contentLines.push(existingLines[i]); // [LIST]
                i++;
                while (i < existingLines.length && existingLines[i].trim() !== '[/LIST]') {
                    contentLines.push(existingLines[i]);
                    i++;
                }
                if (i < existingLines.length) {
                    contentLines.push(existingLines[i]); // [/LIST]
                    i++;
                }
            } else if (line) {
                // Это обычная текстовая строка
                contentLines.push(existingLines[i]);
                i++;
            } else {
                i++;
            }
        }
    }
    
    // Теперь добавляем НОВЫЙ объект
    if (objectType === 2) {
        // Picture - добавляем изображение
        const imageUrl = contentInput.value.trim();
        const imageSize = 'fullsize'; // Всегда full-size
        
        if (!imageUrl) {
            alert('Please upload an image or enter image URL');
            return;
        }
        
        console.log('=== Добавление изображения в блок ===');
        console.log('URL изображения:', imageUrl);
        console.log('Размер изображения:', imageSize);
        
        // Добавляем изображение (только URL + size, БЕЗ комментария)
        contentLines.push(imageUrl);
        contentLines.push('size:' + imageSize);
        
    } else if (objectType === 3) {
        // List - добавляем список как объект ВНУТРЬ блока с маркерами
        const newContent = contentInput.value.trim();
        if (!newContent) {
            alert('Please enter list content');
            return;
        }
        
        console.log('=== Добавление List объекта в блок ===');
        console.log('List контент:', newContent);
        
        // Добавляем маркеры для списка
        contentLines.push('[LIST]');
        const listLines = newContent.split('\n');
        contentLines.push(...listLines);
        contentLines.push('[/LIST]');
        
    } else {
        // Text - добавляем текстовые строки
        const newContent = contentInput.value.trim();
        if (!newContent) {
            alert('Please enter text content');
            return;
        }
        
        // Добавляем каждую строку
        const newLines = newContent.split('\n').filter(l => l.trim());
        contentLines.push(...newLines);
    }
    
    // Формируем итоговый контент
    const updatedContent = contentLines.join('\n');
    
    console.log('Итоговый контент блока:', updatedContent);
    console.log('Строк:', contentLines.length);
    
    try {
        // Если добавляем изображение, меняем тип блока на Picture
        if (objectType === 2) {
            await api.adminUpdateBlock(currentBlockId, { block_type_id: 2 });
            block.block_type_id = 2;
            console.log('Тип блока обновлён на Picture');
        }
        // Для List тип уже установлен при создании нового блока
        
        // Сохраняем обновлённый контент
        await updateBlockTranslation(currentBlockId, updatedContent);
        
        // Обновляем локальные данные
        block.content = updatedContent;
        
        console.log('Объект добавлен в блок');
        
        // Закрываем модальное окно
        document.getElementById('blockModal').style.display = 'none';
        currentBlockId = null;
        
        // Удаляем временные элементы
        const uploadBtn = document.getElementById('uploadImageBtn');
        if (uploadBtn) uploadBtn.remove();
        
        // Перерисовываем блоки
        renderBlocks();
        
    } catch (error) {
        console.error('Ошибка добавления объекта:', error);
        alert('Error adding object: ' + (error.message || 'Unknown error'));
    }
}

// Удалить изображение из блока
async function deleteImageFromBlock(blockId, imageUrl) {
    try {
        const block = blocks.find(b => b.id === blockId);
        if (!block || !block.content) {
            alert('Block not found');
            return;
        }
        
        const contentLines = block.content.split('\n');
        const newLines = [];
        
        let i = 0;
        let iterations = 0;
        const maxIterations = 1000; // ЗАЩИТА от бесконечного цикла
        
        while (i < contentLines.length && iterations < maxIterations) {
            iterations++;
            const line = contentLines[i].trim();
            
            // Нашли изображение которое нужно удалить
            if (line === imageUrl) {
                // Пропускаем URL изображения
                i++;
                // Пропускаем size: если есть
                if (i < contentLines.length && contentLines[i].trim().startsWith('size:')) {
                    i++;
                    // Всё! Описаний больше нет, дальше обычный контент
                }
    } else {
                // Сохраняем строку
                if (line) {
                    newLines.push(contentLines[i]);
                }
                i++;
            }
        }
        
        const newContent = newLines.join('\n');
        
        // Проверяем - остались ли изображения?
        const hasImages = newContent.includes('/uploads/') || newContent.includes('http://') || newContent.includes('https://');
        
        // Если изображений не осталось, меняем тип блока обратно на Text
        if (!hasImages && block.block_type_id === 2) {
            await api.adminUpdateBlock(blockId, { block_type_id: 1 });
            block.block_type_id = 1;
        }
        
        // Сохраняем обновленный контент
        await updateBlockTranslation(blockId, newContent);
        block.content = newContent;
        
        // Перерисовываем блоки
        renderBlocks();
        console.log('Изображение удалено из блока');
        
    } catch (error) {
        console.error('Ошибка удаления изображения:', error);
        alert('Error deleting image: ' + (error.message || 'Unknown error'));
    }
}

// Удалить List объект из блока
async function deleteListObjectFromBlock(blockId, listText) {
    try {
        const block = blocks.find(b => b.id === blockId);
        if (!block || !block.content) {
            alert('Block not found');
            return;
        }
        
        const contentLines = block.content.split('\n');
        const newLines = [];
        let insideList = false;
        let matchedList = false;
        
            for (let i = 0; i < contentLines.length; i++) {
                const line = contentLines[i];
            
            if (line === '[LIST]') {
                insideList = true;
                // Проверяем - это тот список который нужно удалить?
                const listLines = [];
                let j = i + 1;
                while (j < contentLines.length && contentLines[j] !== '[/LIST]') {
                    listLines.push(contentLines[j]);
                    j++;
                }
                const currentListText = listLines.join('\n');
                
                if (currentListText === listText) {
                    // Это наш список - пропускаем до [/LIST]
                    matchedList = true;
                    while (i < contentLines.length && contentLines[i] !== '[/LIST]') {
                        i++;
                    }
                    // Пропускаем [/LIST]
                    continue;
                } else {
                    // Это другой список - сохраняем
                    newLines.push(line);
                    insideList = false;
                }
            } else if (!matchedList) {
                newLines.push(line);
            } else {
                matchedList = false;
            }
        }
        
        const newContent = newLines.join('\n');
        
        // Сохраняем обновленный контент
        await updateBlockTranslation(blockId, newContent);
        block.content = newContent;
        
        // Перерисовываем блоки
        renderBlocks();
        console.log('List объект удалён из блока');
        
    } catch (error) {
        console.error('Ошибка удаления List объекта:', error);
        alert('Error deleting list: ' + (error.message || 'Unknown error'));
        }
    }
    
// Удалить текстовую строку из блока (по содержимому)
async function deleteTextLineFromBlock(blockId, lineText) {
    try {
        const block = blocks.find(b => b.id === blockId);
        if (!block || !block.content) {
            alert('Block not found');
            return;
        }
        
        const contentLines = block.content.split('\n');
        const newLines = [];
        let deleted = false;
        
        for (let i = 0; i < contentLines.length; i++) {
            // Удаляем ПЕРВОЕ вхождение этой строки (пропускаем её)
            if (!deleted && contentLines[i].trim() === lineText.trim()) {
                deleted = true;
                continue; // Пропускаем эту строку
            }
            newLines.push(contentLines[i]);
        }
        
        const newContent = newLines.join('\n');
        
        // Сохраняем обновленный контент
        await updateBlockTranslation(blockId, newContent);
        block.content = newContent;
        
        // Перерисовываем блоки
        renderBlocks();
        console.log('Текстовая строка удалена из блока');
        
            } catch (error) {
        console.error('Ошибка удаления строки:', error);
        alert('Error deleting line: ' + (error.message || 'Unknown error'));
            }
        }
        
// Удалить строку из блока (по индексу) - для обычных текстовых блоков
async function deleteLineFromBlock(blockId, lineIndex) {
    try {
        const block = blocks.find(b => b.id === blockId);
        if (!block || !block.content) {
            alert('Block not found');
            return;
        }
        
        const contentLines = block.content.split('\n');
        
        // Удаляем строку (lineIndex + 1 потому что первая строка - заголовок)
        contentLines.splice(lineIndex + 1, 1);
        
        const newContent = contentLines.join('\n');
        
        // Сохраняем обновленный контент
        await updateBlockTranslation(blockId, newContent);
        block.content = newContent;
        
        // Перерисовываем блоки
        renderBlocks();
        console.log('Строка удалена из блока');
        
    } catch (error) {
        console.error('Ошибка удаления строки:', error);
        alert('Error deleting line: ' + (error.message || 'Unknown error'));
    }
}

// Удалить блок
async function deleteBlock(blockId) {
    if (!confirm('Are you sure you want to delete this block?')) return;
    
    try {
        await api.adminDeleteBlock(blockId);
        console.log('Блок удален');
        await loadPageBlocks(currentPageId);
    } catch (error) {
        console.error('Ошибка удаления блока:', error);
        alert('Error deleting block: ' + (error.message || 'Unknown error'));
    }
}

// Открыть модальное окно страницы
function openPageModal() {
    const modal = document.getElementById('pageModal');
    const titleInput = document.getElementById('pageTitle');
    const slugInput = document.getElementById('pageSlug');
    
    titleInput.value = '';
    slugInput.value = '';
    
    // Автоматическая генерация slug из заголовка
    titleInput.addEventListener('input', () => {
        if (!slugInput.dataset.manuallyEdited) {
            slugInput.value = transliterate(titleInput.value);
        }
    });
    
    // Отслеживаем ручное редактирование slug
    slugInput.addEventListener('input', () => {
        slugInput.dataset.manuallyEdited = 'true';
    });
    
    modal.style.display = 'flex';
}

// Транслитерация кириллицы в латиницу для slug
function transliterate(text) {
    const map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
        'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
        'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
        'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
        'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
    };
    
    return text
        .split('')
        .map(char => map[char] || char)
        .join('')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);
}

// Сохранить страницу
async function savePage() {
    const titleInput = document.getElementById('pageTitle');
    const slugInput = document.getElementById('pageSlug');
    
    const pageTitle = titleInput.value.trim();
    if (!pageTitle) {
        alert('Please enter page title');
        return;
    }
    
    // Используем транслитерацию для slug
    const slug = slugInput.value.trim() || transliterate(pageTitle);
    
    const pageData = {
        slug: slug,
        icon: 'default-icon.png', // Иконка по умолчанию
        sort_order: pages.length
    };
    
    try {
        const response = await api.adminCreatePage(pageData);
        console.log('Страница создана:', response);
        
        // Создаем перевод
        const newPageId = response.data?.id || response.id;
        if (newPageId) {
            await api.adminCreatePageTranslation(newPageId, currentLanguage, {
                title: pageTitle
            });
            
            // Создаем первый блок (заголовок страницы)
            await createPageHeaderBlock(newPageId, pageTitle);
        }
        
        document.getElementById('pageModal').style.display = 'none';
        await loadPages();
    } catch (error) {
        console.error('Ошибка создания страницы:', error);
        const errorMessage = error.message || error.data?.error?.message || 'Unknown error';
        alert('Error creating page: ' + errorMessage);
    }
}

// Сохранить все изменения
async function saveAllChanges() {
    const saveBtn = document.getElementById('saveBtn');
    const btnText = saveBtn.querySelector('.text-wrapper-2');
    const originalText = btnText.textContent;
    
    // Защита от повторных нажатий
    if (saveBtn.disabled) return;
    
    // Анимация сохранения
    saveBtn.classList.add('saving');
    btnText.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    try {
        // Собираем все изменения со страницы
        const contentArea = document.getElementById('contentArea');
        if (!contentArea) {
            throw new Error('Content area not found');
        }
        
        let pageTitle = null; // Название страницы из первого блока
        let hasChanges = false;
        
        // Находим все блоки по их ID
        for (const block of blocks) {
            const blockEl = document.getElementById(`block-${block.id}`);
            if (!blockEl) continue;
            
            const isFirstBlock = blocks.indexOf(block) === 0;
            
            // Получаем заголовок блока (это первая строка контента)
            const titleElement = blockEl.querySelector('[data-field="title"]');
            const blockTitle = titleElement ? titleElement.textContent.trim() : '';
            
            // ВАЖНО: Для блоков типа Picture (block_type_id === 2) НЕ перезаписываем контент!
            // У них нет элементов data-line, только изображение
            // Контент уже сохранен через saveObject()
            if (block.block_type_id === 2) {
                console.log(`Блок ${block.id} - тип Picture, пропускаем (контент уже сохранен)`);
                
                // Для первого блока всё равно сохраняем название страницы
                if (isFirstBlock) {
                    pageTitle = blockTitle;
                }
                continue; // Пропускаем этот блок
            }
            
            // Собираем контент в зависимости от типа блока
            const lines = [];
            
            if (block.block_type_id === 3) {
                // List блок - весь контент в одном элементе
                const listElement = blockEl.querySelector('[data-field="list-content"]');
                if (listElement) {
                    const listText = listElement.textContent.trim();
                    if (listText) {
                        // Разбиваем на строки для сохранения
                        lines.push(...listText.split('\n').filter(l => l.trim()));
                    }
                }
            } else {
                // Text/Picture блоки - читаем строки И List объекты
                // Сначала обычные текстовые строки
                const editableElements = blockEl.querySelectorAll('[contenteditable="true"][data-line]');
            editableElements.forEach(el => {
                const text = el.textContent.trim();
                if (text) {
                    lines.push(text);
                }
            });
                
                // Потом List объекты
                const listObjects = blockEl.querySelectorAll('[data-list-object="true"]');
                listObjects.forEach(el => {
                    const listText = el.textContent.trim();
                    if (listText) {
                        lines.push('[LIST]');
                        lines.push(...listText.split('\n'));
                        lines.push('[/LIST]');
                    }
                });
            }
            
            // Формируем новый контент: заголовок - это первая строка, остальное - дополнительные строки
            const contentParts = [];
            if (blockTitle) {
                contentParts.push(blockTitle);
                // Для первого блока сохраняем название страницы
                if (isFirstBlock) {
                    pageTitle = blockTitle;
                }
            }
            // Добавляем остальные строки (они уже не включают заголовок)
            contentParts.push(...lines);
            
            const newContent = contentParts.join('\n');
            
            console.log(`Блок ${block.id} - тип ${block.block_type_id}:`);
            console.log('  Старый контент:', block.content);
            console.log('  Новый контент:', newContent);
            
            // Сохраняем только если контент изменился И не пустой
            if (newContent && newContent.trim() && newContent !== block.content) {
                console.log(`  → Сохраняем изменения`);
                try {
                    await updateBlockTranslation(block.id, newContent);
                    block.content = newContent; // Обновляем локальную копию
                    hasChanges = true;
                } catch (error) {
                    console.error(`Ошибка сохранения блока ${block.id}:`, error);
                    // Продолжаем сохранение других блоков
                }
            } else {
                console.log(`  → Контент не изменился, пропускаем`);
            }
        }
        
        // Обновляем название страницы, если оно изменилось
        if (pageTitle) {
            const currentPage = pages.find(p => p.id == currentPageId);
            const currentPageTitle = currentPage?.title || currentPage?.name;
            
            if (pageTitle !== currentPageTitle) {
                try {
                    await api.adminUpdatePageTranslation(currentPageId, currentLanguage, {
                        title: pageTitle
                    });
                    console.log('Название страницы обновлено:', pageTitle);
                    
                    // Обновляем локальную копию страницы
                    if (currentPage) {
                        currentPage.title = pageTitle;
                        currentPage.name = pageTitle;
                    }
                    
                    hasChanges = true;
                } catch (error) {
                    console.error('Ошибка обновления названия страницы:', error);
                    throw new Error('Failed to update page title: ' + (error.message || 'Unknown error'));
                }
            }
        }
        
        if (hasChanges) {
            console.log('Все изменения сохранены');
            
            // Обновляем только навигационное меню, НЕ перерисовываем блоки
            renderPagesList();
        } else {
            console.log('Нет изменений для сохранения');
        }
        
        // Сбрасываем флаг несохраненных изменений
        hasUnsavedChanges = false;
        
        // Успешное сохранение
        saveBtn.classList.remove('saving');
        saveBtn.classList.add('success');
        btnText.textContent = 'Saved!';
        
        setTimeout(() => {
            saveBtn.classList.remove('success');
            btnText.textContent = originalText;
            saveBtn.disabled = false;
        }, 2000);
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        
        // Ошибка сохранения
        saveBtn.classList.remove('saving');
        saveBtn.classList.add('error');
        btnText.textContent = 'Error!';
        
        // Показываем детали ошибки
        const errorMessage = error.message || 'Unknown error';
        alert('Error saving changes: ' + errorMessage);
        
        setTimeout(() => {
            saveBtn.classList.remove('error');
            btnText.textContent = originalText;
            saveBtn.disabled = false;
        }, 2000);
    }
}

// Прокрутка к блоку
function scrollToBlock(blockId) {
    const blockElement = document.getElementById(`block-${blockId}`);
    if (blockElement) {
        blockElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        blockElement.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        setTimeout(() => {
            blockElement.style.backgroundColor = '';
        }, 2000);
    }
}

// Создать новый блок
async function createNewBlock() {
    const blockTitle = prompt('Enter block title:');
    if (!blockTitle || !blockTitle.trim()) {
        return;
    }
    
    const blockData = {
        page_id: currentPageId,
        block_type_id: 1, // По умолчанию текстовый тип
        sort_order: blocks.length
    };
    
    try {
        const response = await api.adminCreateBlock(blockData);
        const newBlockId = response.data?.id || response.id;
        
        if (newBlockId) {
            // Создаем перевод с названием блока как первой строкой
            await api.adminCreateBlockTranslation(newBlockId, currentLanguage, {
                language: currentLanguage,
                content: blockTitle.trim()
            });
            console.log('Блок создан с переводом');
            await loadPageBlocks(currentPageId);
        }
    } catch (error) {
        console.error('Ошибка создания блока:', error);
        alert('Error creating block: ' + (error.message || 'Unknown error'));
    }
}

// Создать первый блок страницы (заголовок)
async function createPageHeaderBlock(pageId, pageTitle) {
    const blockData = {
        page_id: pageId,
        block_type_id: 1, // Текстовый тип
        sort_order: 0
    };
    
    try {
        const response = await api.adminCreateBlock(blockData);
        const newBlockId = response.data?.id || response.id;
        
        if (newBlockId) {
            // Создаем перевод с названием страницы
            await api.adminCreateBlockTranslation(newBlockId, currentLanguage, {
                language: currentLanguage,
                content: pageTitle
            });
            console.log('Заголовочный блок страницы создан');
        }
    } catch (error) {
        console.error('Ошибка создания заголовочного блока:', error);
    }
}

// Добавить новую строку в блок
async function addNewLineToBlock(blockId) {
    const newLine = prompt('Enter new text line:');
    if (newLine && newLine.trim()) {
        const block = blocks.find(b => b.id === blockId);
        const currentContent = block?.content || '';
        const newContent = currentContent ? currentContent + '\n' + newLine.trim() : newLine.trim();
        try {
            await updateBlockTranslation(blockId, newContent);
            
            // Обновляем локальные данные
            if (block) {
                block.content = newContent;
            }
            
            // Перерисовываем блоки
            renderBlocks();
            console.log('Строка добавлена');
        } catch (error) {
            console.error('Ошибка добавления строки:', error);
            alert('Error adding line: ' + (error.message || 'Unknown error'));
        }
    }
}

// Вспомогательная функция для экранирования HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Отметить как несохраненное
function markAsUnsaved() {
    const saveBtn = document.getElementById('saveBtn');
    const btnText = saveBtn.querySelector('.text-wrapper-2');
    if (!saveBtn.classList.contains('saving') && !saveBtn.classList.contains('success')) {
        btnText.textContent = 'Save *';
    }
}

// Автосохранение
async function autoSave() {
    if (!hasUnsavedChanges) return;
    
    console.log('Автосохранение...');
    const saveBtn = document.getElementById('saveBtn');
    
    // Не запускаем автосохранение если уже идет сохранение
    if (saveBtn.disabled) {
        console.log('Автосохранение отменено - уже идет сохранение');
        return;
    }
    
    try {
        await saveAllChanges();
        console.log('Автосохранение завершено');
    } catch (error) {
        console.error('Ошибка автосохранения:', error);
    }
}

// Предупреждение при уходе со страницы с несохраненными изменениями
window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
    }
});
