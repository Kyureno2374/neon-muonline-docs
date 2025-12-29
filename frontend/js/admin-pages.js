/**
 * Скрипт для админ-панели - управление страницами
 */

import * as api from './api.js';

let currentLanguage = localStorage.getItem('adminLanguage') || 'ru';
let pages = [];
let currentPage = null; // Текущая выбранная страница
let expandedPages = new Set(); // Отслеживание раскрытых страниц
let blocks = []; // Блоки текущей страницы

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    // Проверка аутентификации
    if (!api.isAdminLoggedIn()) {
        console.warn('Не авторизован, редирект на страницу входа');
        window.location.href = '/login/login.html';
        return;
    }

    try {
        // Проверяем валидность токена
        await api.getAdminMe();
        console.log('Аутентификация успешна');
    } catch (error) {
        console.error('Ошибка проверки аутентификации:', error);
        window.location.href = '/login/login.html';
        return;
    }

    initLanguageSwitcher();
    initEditButton();
    initMobileMenu();
    await loadPages();
});

// Инициализация переключателя языков
function initLanguageSwitcher() {
    const switcherBtn = document.getElementById('languageSwitcherBtn');
    const dropdown = document.getElementById('languageSwitcherDropdown');
    const currentLangDisplay = document.getElementById('currentLanguage');
    
    if (!switcherBtn || !dropdown) {
        console.error('Language switcher elements not found');
        return;
    }

    const options = dropdown.querySelectorAll('.language-switcher-option');
    
    console.log('Инициализация языкового свичера');
    console.log('Текущий язык:', currentLanguage);

    // Установить текущий язык
    updateLanguageDisplay();

    // Toggle dropdown
    switcherBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('open');
        if (isOpen) {
            closeDropdown();
        } else {
            openDropdown();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!switcherBtn.contains(e.target) && !dropdown.contains(e.target)) {
            if (dropdown.classList.contains('open')) {
                closeDropdown();
            }
        }
    });

    // Handle language selection
    options.forEach(option => {
        option.addEventListener('click', async function(e) {
            e.stopPropagation();
            const lang = this.dataset.lang;
            console.log('Выбран язык:', lang);
            
            if (lang !== currentLanguage) {
                console.log('Переключение языка с', currentLanguage, 'на', lang);
                currentLanguage = lang;
                localStorage.setItem('adminLanguage', currentLanguage);
                updateLanguageDisplay();
                closeDropdown();
                console.log('Перезагрузка страниц на языке:', currentLanguage);
                await loadPages();
            }
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && dropdown.classList.contains('open')) {
            closeDropdown();
        }
    });

    function openDropdown() {
        dropdown.classList.add('open');
        switcherBtn.classList.add('active');
    }

    function closeDropdown() {
        dropdown.classList.remove('open');
        switcherBtn.classList.remove('active');
    }

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
    
    const menu = document.querySelector('.frame-12');
    
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
            const pageBtn = e.target.closest('.frame-15');
            if (pageBtn && menu.classList.contains('mobile-menu-open')) {
                setTimeout(closeMenu, 300);
            }
        }
    });
}

// Инициализация кнопки Edit
function initEditButton() {
    const editBtn = document.getElementById('editPageBtn');
    if (!editBtn) {
        console.error('Edit button not found');
        return;
    }
    
    editBtn.addEventListener('click', () => {
        if (currentPage) {
            window.location.href = `/admin/editing/index.html?pageId=${currentPage.id}`;
        }
    });
}

// Загрузка страниц
async function loadPages() {
    try {
        const response = await api.adminGetPages(currentLanguage);
        console.log('Ответ API страниц:', response);
        
        // API возвращает { success: true, data: [...] }
        if (response && response.data) {
            pages = response.data;
        } else if (Array.isArray(response)) {
            pages = response;
        } else {
            pages = [];
        }
        
        console.log('Загружено страниц:', pages.length);
        renderPagesList();
    } catch (error) {
        console.error('Ошибка загрузки страниц:', error);
        showErrorMessage('Не удалось загрузить список страниц');
    }
}

// Рендер списка страниц слева (с раскрытием блоков как в editing)
function renderPagesList() {
    const frame13 = document.querySelector('.frame-13');
    if (!frame13) {
        console.error('Pages list container (frame-13) not found');
        return;
    }

    frame13.innerHTML = '';

    if (pages.length === 0) {
        const noPages = document.createElement('div');
        noPages.style.padding = '12px';
        noPages.style.color = '#a9b7ff';
        noPages.style.fontSize = '14px';
        noPages.style.textAlign = 'center';
        noPages.textContent = 'Нет страниц';
        frame13.appendChild(noPages);
        return;
    }

    pages.forEach((page, index) => {
        const isActive = currentPage && page.id === currentPage.id;
        const isExpanded = expandedPages.has(page.id);
        
        // Кнопка страницы
        const pageLink = document.createElement('div');
        pageLink.className = isActive ? 'frame-15 active' : 'frame-15';
        
        const pageTitle = page.title || page.name || 'Без названия';
        pageLink.innerHTML = `
            <span class="text-wrapper-3">${escapeHtml(pageTitle)}</span>
            <img class="element-4 ${isExpanded ? 'expanded' : ''}" src="https://c.animaapp.com/AWtvtqqH/img/---------1-17@2x.png" alt="" aria-hidden="true" style="transition: transform 0.3s ease; ${isExpanded ? 'transform: rotate(180deg);' : ''}" />
        `;
        
        pageLink.addEventListener('click', async (e) => {
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
                
                // Загружаем блоки страницы
                await loadPageBlocks(page);
            }
        });
        
        frame13.appendChild(pageLink);
        
        // Если страница раскрыта, показываем её блоки
        if (isExpanded && currentPage && page.id === currentPage.id) {
            const blocksContainer = document.createElement('div');
            blocksContainer.className = 'blocks-container';
            blocksContainer.style.cssText = 'display: flex; flex-direction: column; gap: 12px; padding-left: 12px; margin-top: 12px; animation: slideDown 0.3s ease;';
            
            // Получаем блоки для этой страницы
            const pageBlocks = blocks || [];
            
            // Показываем блоки (кроме первого - заголовка страницы)
            if (pageBlocks.length > 1) {
                pageBlocks.slice(1).forEach(block => {
                    // Получаем первую строку контента как название блока
                    const blockContent = block.content || '';
                    const lines = blockContent.split('\n').filter(line => line.trim());
                    const blockTitle = lines[0] || `Block ${block.id}`;
                    
                    const blockBtn = document.createElement('div');
                    blockBtn.className = 'frame-16';
                    blockBtn.innerHTML = `<span class="text-wrapper-3">${escapeHtml(blockTitle)}</span>`;
                    
                    blockBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        // Скролл к блоку по data-block-title
                        const blockElement = document.querySelector(`[data-block-title="${blockTitle}"]`);
                        if (blockElement) {
                            blockElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    });
                    
                    blocksContainer.appendChild(blockBtn);
                });
            }
            
            frame13.appendChild(blocksContainer);
        }
    });
    
    // Автоматически загружаем первую страницу
    if (pages.length > 0 && !currentPage) {
        expandedPages.add(pages[0].id);
        loadPageBlocks(pages[0]);
    }
}

// Загрузка и отображение блоков страницы
async function loadPageBlocks(page) {
    try {
        // Сохраняем текущую страницу
        currentPage = page;
        
        // Показываем кнопку Edit
        const editBtn = document.getElementById('editPageBtn');
        if (editBtn) {
            editBtn.style.display = 'flex';
        }
        
        // Обновляем заголовок страницы
        const pageTitle = document.querySelector('.text-wrapper-4');
        const pageIcon = document.querySelector('.af-fa-c');
        
        if (pageTitle) {
            pageTitle.textContent = page.title || page.name || 'Без названия';
        }
        
        if (pageIcon && page.icon_url) {
            pageIcon.src = page.icon_url;
        }
        
        // Загружаем блоки
        const response = await api.adminGetBlocks(page.id, currentLanguage);
        console.log('Ответ API блоков:', response);
        
        if (response && response.data) {
            blocks = response.data;
        } else if (Array.isArray(response)) {
            blocks = response;
        } else {
            blocks = [];
        }
        
        console.log('Загружено блоков:', blocks.length);
        renderBlocks(blocks);
        
        // Обновляем навигацию после рендера блоков
        setTimeout(() => {
            renderPagesList();
        }, 100);
    } catch (error) {
        console.error('Ошибка загрузки блоков:', error);
        showErrorMessage('Не удалось загрузить блоки страницы');
    }
}

// Рендер блоков в правой части (только просмотр, БЕЗ редактирования)
function renderBlocks(blocks) {
    const frame10 = document.querySelector('.frame-10');
    if (!frame10) {
        console.error('Blocks container (frame-10) not found');
        return;
    }
    
    frame10.innerHTML = '';
    
    if (blocks.length === 0) {
        const noBlocks = document.createElement('div');
        noBlocks.style.padding = '20px';
        noBlocks.style.color = '#a9b7ff';
        noBlocks.style.fontSize = '14px';
        noBlocks.style.textAlign = 'center';
        noBlocks.textContent = 'Нет блоков для отображения';
        frame10.appendChild(noBlocks);
        return;
    }
    
    console.log('🔄 Рендеринг блоков для просмотра:', blocks.length);
    
    // Парсим все блоки и их объекты
    blocks.forEach((block, blockIndex) => {
        const content = block.content || '';
        const lines = content.split('\n').filter(l => l.trim());
        
        if (lines.length === 0) return;
        
        // Заголовок блока (первая строка)
        const blockTitle = lines[0];
        
        // Для первого блока (заголовок страницы) - показываем текстовые строки В БЛОКАХ
        if (blockIndex === 0) {
            // Создаём контейнер для блоков текста (как frame-14 в editing - с flex-wrap)
            const textBlocksContainer = document.createElement('div');
            textBlocksContainer.style.cssText = 'display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px; width: 100%; margin-bottom: 24px;';
            
            // Показываем текстовые строки из блока-заголовка (если есть) В БЛОКАХ как в админке
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                
                // Защита от битых данных
                if (line.startsWith('size:') || line.startsWith('/uploads/') || line.startsWith('http')) {
                    continue;
                }
                
                // Создаём блок для текста (ТОЧНО как в админке)
                const textBlock = document.createElement('div');
                textBlock.className = 'frame-15';
                
                const listWrapper = document.createElement('div');
                listWrapper.className = 'list-wrapper';
                
                const paragraph = document.createElement('p');
                paragraph.className = 'p';
                
                const textSpan = document.createElement('span');
                textSpan.className = 'text-wrapper-6';
                textSpan.textContent = line;
                
                paragraph.appendChild(textSpan);
                listWrapper.appendChild(paragraph);
                textBlock.appendChild(listWrapper);
                textBlocksContainer.appendChild(textBlock);
            }
            
            frame10.appendChild(textBlocksContainer);
            return;
        }
        
        // Большой отступ между блоками
        if (blockIndex > 1) {
            const spacer = document.createElement('div');
            spacer.style.cssText = 'height: 80px;';
            frame10.appendChild(spacer);
        }
        
        // Создаём заголовок блока (слева, крупный)
        const titleContainer = document.createElement('div');
        titleContainer.style.cssText = 'margin: 48px 0 0 0; color: #ffffff; font-size: 28px; font-weight: 700; font-family: "Montserrat", Helvetica; letter-spacing: 0.8px; text-align: left; display: block; width: 100%;';
        titleContainer.textContent = blockTitle;
        titleContainer.dataset.blockTitle = blockTitle; // Добавляем data-атрибут для навигации
        frame10.appendChild(titleContainer);
        
        // Контейнер для объектов блока (чтобы всё было под заголовком)
        const objectsContainer = document.createElement('div');
        objectsContainer.style.cssText = 'margin: 16px 0 0 0; display: flex; flex-direction: column; gap: 12px; width: 100%;';
        
        // Парсим объекты блока
        let i = 1; // Пропускаем заголовок
        while (i < lines.length) {
            const line = lines[i];
            
            // Защита от битых данных
            if (line.startsWith('size:')) {
                i++;
                continue;
            }
            
            // Это изображение?
            if (line.startsWith('/uploads/') || line.startsWith('http')) {
                let imageUrl = line;
                i++;
                
                // Пропускаем size: если есть
                if (i < lines.length && lines[i].startsWith('size:')) {
                    i++;
                }
                
                // Формируем полный URL
                if (!imageUrl.startsWith('http')) {
                    imageUrl = 'http://localhost:3000' + (imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl);
                }
                
                // Создаём контейнер для изображения (выравнивание по левому краю)
                const imageContainer = document.createElement('div');
                imageContainer.style.cssText = 'display: block; margin: 0; width: 100%;';
                imageContainer.innerHTML = `
                    <img src="${escapeHtml(imageUrl)}" alt="Block image" 
                         style="max-width: 600px; max-height: 500px; width: auto; height: auto; display: block; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" 
                         onerror="this.style.display='none';" />
                `;
                objectsContainer.appendChild(imageContainer);
                
            } else if (line === '[LIST]') {
                // Это List объект - собираем до [/LIST]
                const listLines = [];
                i++;
                while (i < lines.length && lines[i] !== '[/LIST]') {
                    listLines.push(lines[i]);
                    i++;
                }
                i++; // Пропускаем [/LIST]
                
                // Создаём контейнер для списка (выравнивание по левому краю)
                const listContainer = document.createElement('div');
                listContainer.style.cssText = 'margin: 0; padding: 16px 24px; background: rgba(255,255,255,0.08); border-radius: 4px; border: 1px solid rgba(255,255,255,0.25); width: fit-content; min-width: 250px; max-width: 800px; display: block;';
                
                const listText = listLines.join('\n');
                const listParagraph = document.createElement('p');
                listParagraph.style.cssText = 'margin: 0; color: #ffffff; font-size: 17px; white-space: pre-wrap; line-height: 1.8; font-family: "Montserrat", Helvetica; font-weight: 400;';
                listParagraph.textContent = listText;
                
                listContainer.appendChild(listParagraph);
                objectsContainer.appendChild(listContainer);
                
            } else {
                // Обычная текстовая строка - белым цветом
                const textLine = document.createElement('div');
                textLine.style.cssText = 'margin: 0; color: #ffffff; font-size: 17px; line-height: 1.7; font-family: "Montserrat", Helvetica; font-weight: 400; max-width: 800px; display: block; text-align: left;';
                textLine.textContent = line;
                objectsContainer.appendChild(textLine);
                i++;
            }
        }
        
        // Добавляем контейнер с объектами в frame10
        frame10.appendChild(objectsContainer);
    });
    
    console.log('✅ Блоки отрендерены');
}

// Вспомогательная функция для экранирования HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Показать сообщение об ошибке
function showErrorMessage(message) {
    const pagesList = document.querySelector('.frame-13');
    if (!pagesList) return;
    
    pagesList.innerHTML = `
        <div style="padding: 16px; color: #ff6b6b; background: rgba(255, 107, 107, 0.1); border-radius: 4px; border: 1px solid rgba(255, 107, 107, 0.3);">
            <strong>Ошибка:</strong> ${escapeHtml(message)}
        </div>
    `;
}
