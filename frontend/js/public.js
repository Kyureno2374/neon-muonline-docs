/**
 * Скрипт для публичной части сайта
 * Загружает страницы и блоки с API
 */

import { getPages, getPageBySlug, adminGetBlocks } from './api.js';
import { getCurrentLanguage, setCurrentLanguage } from './auth.js';
import { showError } from './notifications.js';

// Глобальные переменные
let pages = [];
let currentPage = null;
let expandedPages = new Set();
let blocks = [];

// Инициализируем при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPublic);
} else {
    initPublic();
}

/**
 * Инициализация публичной части
 */
async function initPublic() {
    try {
        console.log('Initializing public page...');
        
        // Загружаем список страниц
        const pagesResponse = await getPages(getCurrentLanguage());
        pages = pagesResponse.data || pagesResponse;

        console.log('Pages loaded:', pages);

        // Заполняем левую панель навигацией
        renderNavigation();

        // Загружаем первую страницу
        if (pages.length > 0) {
            console.log('Loading first page:', pages[0].id);
            expandedPages.add(pages[0].id);
            await loadPage(pages[0]);
        } else {
            console.warn('No pages found!');
        }

        // Инициализируем переключатель языков
        initLanguageSwitcher();
        
        console.log('Public page initialized successfully');
    } catch (error) {
        console.error('Failed to load pages:', error);
        showError('Ошибка при загрузке данных');
    }
}

/**
 * Отрендерить навигацию в левой панели (с раскрытием блоков)
 */
function renderNavigation() {
    const navContainer = document.querySelector('nav.frame-13');
    if (!navContainer) {
        console.error('Navigation container not found!');
        return;
    }

    console.log('Rendering navigation with pages:', pages);

    // Очищаем старую навигацию
    navContainer.innerHTML = '';

    // Добавляем страницы
    pages.forEach((page, index) => {
        const isActive = currentPage && page.id === currentPage.id;
        const isExpanded = expandedPages.has(page.id);
        
        const pageLink = document.createElement('div');
        pageLink.className = isActive ? 'frame-15 active' : 'frame-15';
        
        const pageTitle = page.title || page.name || page.slug;
        pageLink.innerHTML = `
            <span class="text-wrapper-3">${escapeHtml(pageTitle)}</span>
            <img class="element-4 ${isExpanded ? 'expanded' : ''}" src="https://c.animaapp.com/AWtvtqqH/img/---------1-17@2x.png" alt="" aria-hidden="true" style="transition: transform 0.3s ease; ${isExpanded ? 'transform: rotate(180deg);' : ''}" />
        `;

        pageLink.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Переключаем раскрытие страницы
            if (expandedPages.has(page.id)) {
                // Закрываем текущую страницу
                expandedPages.delete(page.id);
                renderNavigation();
            } else {
                // Закрываем все другие страницы и открываем текущую
                expandedPages.clear();
                expandedPages.add(page.id);
                
                // Загружаем блоки страницы
                await loadPage(page);
            }
        });

        navContainer.appendChild(pageLink);
        
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
            
            navContainer.appendChild(blocksContainer);
        }
    });

    console.log('Navigation rendered successfully');
}

/**
 * Загрузить страницу
 */
async function loadPage(page) {
    try {
        console.log('Loading page:', page.id);
        currentPage = page;
        
        // Загружаем блоки через API
        const response = await adminGetBlocks(page.id, getCurrentLanguage());
        blocks = response?.data || response || [];
        
        console.log('Blocks loaded:', blocks.length);

        // Обновляем контент
        renderPageContent(page);
        
        // Обновляем навигацию после рендера блоков
        setTimeout(() => {
            renderNavigation();
        }, 100);
    } catch (error) {
        console.error('Failed to load page:', error);
        showError('Ошибка при загрузке страницы');
    }
}

/**
 * Отрендерить контент страницы
 */
function renderPageContent(page) {
    // Обновляем заголовок
    const heading = document.querySelector('h2.text-wrapper-4');
    if (heading) {
        heading.textContent = page.title || page.name || 'Без названия';
    }
    
    // Обновляем иконку если есть
    const icon = document.querySelector('.af-fa-c');
    if (icon && page.icon_url) {
        icon.src = page.icon_url;
    }

    // Рендерим блоки
    renderBlocks(blocks);
}

/**
 * Рендер блоков (скопировано из admin-pages.js)
 */
function renderBlocks(blocksData) {
    const frame10 = document.querySelector('.frame-10');
    if (!frame10) {
        console.error('Blocks container (frame-10) not found');
        return;
    }

    // Очищаем старый контент
    frame10.innerHTML = '';
    
    if (blocksData.length === 0) {
        const noBlocks = document.createElement('div');
        noBlocks.style.padding = '20px';
        noBlocks.style.color = '#a9b7ff';
        noBlocks.style.fontSize = '16px';
        noBlocks.textContent = 'Нет блоков для отображения';
        frame10.appendChild(noBlocks);
        return;
    }

    // Рендерим каждый блок
    blocksData.forEach((block, blockIndex) => {
        const blockContent = block.content || '';
        const lines = blockContent.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) return;
        
        const blockTitle = lines[0];
        
        // Первый блок - это заголовок страницы (General information)
        if (blockIndex === 0) {
            // Создаём контейнер для блоков текста
            const textBlocksContainer = document.createElement('div');
            textBlocksContainer.style.cssText = 'display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px; width: 100%; margin-bottom: 24px;';
            
            // Показываем текстовые строки
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                
                if (line.startsWith('size:') || line.startsWith('/uploads/') || line.startsWith('http')) {
                    continue;
                }
                
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
        
        // Создаём заголовок блока
        const titleContainer = document.createElement('div');
        titleContainer.style.cssText = 'margin: 48px 0 0 0; color: #ffffff; font-size: 28px; font-weight: 700; font-family: "Montserrat", Helvetica; letter-spacing: 0.8px; text-align: left; display: block; width: 100%;';
        titleContainer.textContent = blockTitle;
        titleContainer.dataset.blockTitle = blockTitle;
        frame10.appendChild(titleContainer);
        
        // Контейнер для объектов блока
        const objectsContainer = document.createElement('div');
        objectsContainer.style.cssText = 'margin: 16px 0 0 0; display: flex; flex-direction: column; gap: 12px; width: 100%;';
        
        // Парсим объекты блока
        let i = 1;
        while (i < lines.length) {
            const line = lines[i];
            
            if (line.startsWith('size:')) {
                i++;
                continue;
            }
            
            // Изображение
            if (line.startsWith('/uploads/') || line.startsWith('http')) {
                let imageUrl = line;
                i++;
                
                if (i < lines.length && lines[i].startsWith('size:')) {
                    i++;
                }
                
                if (!imageUrl.startsWith('http')) {
                    imageUrl = 'http://localhost:3000' + (imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl);
                }
                
                const imageContainer = document.createElement('div');
                imageContainer.style.cssText = 'display: block; margin: 0; width: 100%;';
                imageContainer.innerHTML = `
                    <img src="${escapeHtml(imageUrl)}" alt="Block image" 
                         style="max-width: 600px; max-height: 500px; width: auto; height: auto; display: block; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" 
                         onerror="this.style.display='none';" />
                `;
                objectsContainer.appendChild(imageContainer);
                
            } else if (line === '[LIST]') {
                // List объект
                const listLines = [];
                i++;
                while (i < lines.length && lines[i] !== '[/LIST]') {
                    listLines.push(lines[i]);
                    i++;
                }
                i++;
                
                const listContainer = document.createElement('div');
                listContainer.style.cssText = 'margin: 0; padding: 16px 24px; background: rgba(255,255,255,0.08); border-radius: 4px; border: 1px solid rgba(255,255,255,0.25); width: fit-content; min-width: 250px; max-width: 800px; display: block;';
                
                const listText = listLines.join('\n');
                const listParagraph = document.createElement('p');
                listParagraph.style.cssText = 'margin: 0; color: #ffffff; font-size: 17px; white-space: pre-wrap; line-height: 1.8; font-family: "Montserrat", Helvetica; font-weight: 400;';
                listParagraph.textContent = listText;
                
                listContainer.appendChild(listParagraph);
                objectsContainer.appendChild(listContainer);
                
            } else {
                // Обычная текстовая строка
                const textLine = document.createElement('div');
                textLine.style.cssText = 'margin: 0; color: #ffffff; font-size: 17px; line-height: 1.7; font-family: "Montserrat", Helvetica; font-weight: 400; max-width: 800px; display: block; text-align: left;';
                textLine.textContent = line;
                objectsContainer.appendChild(textLine);
                i++;
            }
        }
        
        frame10.appendChild(objectsContainer);
    });
    
    console.log('✅ Блоки отрендерены');
}

/**
 * Экранировать HTML для безопасности
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Инициализация переключателя языков
 */
function initLanguageSwitcher() {
    const btn = document.getElementById('languageSwitcherBtn');
    const dropdown = document.getElementById('languageSwitcherDropdown');
    const currentLangSpan = document.getElementById('currentLanguage');

    if (!btn || !dropdown) {
        console.warn('Language switcher elements not found');
        return;
    }

    // Открытие/закрытие dropdown
    btn.addEventListener('click', () => {
        dropdown.classList.toggle('visible');
    });

    // Закрытие при клике вне
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.language-switcher-wrapper')) {
            dropdown.classList.remove('visible');
        }
    });

    // Выбор языка
    const options = dropdown.querySelectorAll('.language-switcher-option');
    options.forEach(option => {
        option.addEventListener('click', async () => {
            const lang = option.getAttribute('data-lang');
            console.log('Language changed to:', lang);
            
            setCurrentLanguage(lang);
            currentLangSpan.textContent = lang.toUpperCase();
            dropdown.classList.remove('visible');

            // Перезагружаем страницы
            try {
                const pagesResponse = await getPages(lang);
                const pages = pagesResponse.data || pagesResponse;
                renderNavigation(pages);

                // Загружаем первую страницу на новом языке
                if (pages.length > 0) {
                    loadPage(pages[0].slug);
                }
            } catch (error) {
                console.error('Failed to change language:', error);
                showError('Ошибка при смене языка');
            }
        });
    });
}
