/**
 * Скрипт для страницы Items Database (admin/database/index.html)
 * Управление предметами
 */

import { requireAuth } from './auth.js';
import { adminGetItems, adminCreateItem, adminUpdateItem, adminDeleteItem, adminGetItemCategories } from './api.js';
import { showSuccess, showError } from './notifications.js';

// Проверяем авторизацию
requireAuth();

let items = [];
let currentPage = 1;
const itemsPerPage = 7;
let searchQuery = '';
let sortBy = 'name'; // 'name' или 'date'
let sortOrder = 'asc'; // 'asc' или 'desc'
let selectedCategory = ''; // фильтр по категории

// Инициализируем при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDatabase);
} else {
    initDatabase();
}

/**
 * Инициализация страницы базы данных
 */
async function initDatabase() {
    try {
        console.log('Initializing database page...');
        
        // Инициализируем обработчики событий ПЕРВЫМИ
        initEventHandlers();
        
        // Загружаем предметы
        await loadItems();
        
        console.log('Database page initialized');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        showError('Ошибка при инициализации');
    }
}

/**
 * Загрузить список предметов
 */
async function loadItems() {
    try {
        const lang = localStorage.getItem('language') || 'ru';
        console.log('Loading items for language:', lang);
        
        const response = await adminGetItems();
        console.log('API Response:', response);
        
        items = response.data || response;
        console.log('Items loaded:', items);
        console.log('Items count:', items.length);
        
        // Загружаем категории
        await loadCategories();
        
        renderItemsTable();
        renderLeftPanel();
    } catch (error) {
        console.error('Failed to load items:', error);
        console.error('Error details:', error.message, error.status);
        showError('Ошибка при загрузке предметов: ' + (error.message || 'Unknown error'));
    }
}

/**
 * Загрузить список категорий
 */
async function loadCategories() {
    try {
        const lang = localStorage.getItem('language') || 'ru';
        
        try {
            const response = await adminGetItemCategories(lang);
            const categories = response.data || response || [];
            
            // Заполняем select категорий
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                const currentValue = categoryFilter.value;
                categoryFilter.innerHTML = '<option value="">Все категории</option>';
                
                if (Array.isArray(categories)) {
                    categories.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat.id;
                        option.textContent = cat.name || cat.slug;
                        categoryFilter.appendChild(option);
                    });
                }
                
                categoryFilter.value = currentValue;
            }
            
            console.log('Categories loaded:', categories);
        } catch (apiError) {
            console.warn('API error loading categories:', apiError);
            // Если API ошибка, просто пропускаем категории
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
        // Не показываем ошибку, так как категории опциональны
    }
}

/**
 * Отрендерить таблицу предметов
 */
function renderItemsTable() {
    // Находим контейнер с таблицей (frame-15 содержит заголовок и ряды)
    const tableContainer = document.querySelector('.frame-15');
    if (!tableContainer) {
        console.error('Table container not found');
        return;
    }

    // Находим все ряды (кроме заголовка frame-16)
    const allRows = tableContainer.querySelectorAll('.frame-21');
    allRows.forEach(row => row.remove());

    // Фильтруем предметы по поисковому запросу и категории
    let filteredItems = items.filter(item => {
        const name = (item.name || '').toLowerCase();
        const description = (item.description || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        const matchesSearch = name.includes(query) || description.includes(query);
        const matchesCategory = !selectedCategory || item.category_id == selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Применяем сортировку
    filteredItems.sort((a, b) => {
        let aVal, bVal;
        
        if (sortBy === 'name') {
            aVal = (a.name || '').toLowerCase();
            bVal = (b.name || '').toLowerCase();
        } else if (sortBy === 'date') {
            aVal = new Date(a.created_at || 0).getTime();
            bVal = new Date(b.created_at || 0).getTime();
        }
        
        if (sortOrder === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
    });

    // Вычисляем пагинацию
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = filteredItems.slice(startIndex, endIndex);

    // Добавляем ряды с предметами
    pageItems.forEach((item) => {
        const row = createItemRow(item);
        tableContainer.appendChild(row);
    });

    // Обновляем пагинацию
    updatePagination(totalPages);
}

/**
 * Отрендерить левую панель со списком предметов
 */
function renderLeftPanel() {
    const leftPanel = document.querySelector('.frame-3');
    if (!leftPanel) {
        console.error('Left panel not found');
        return;
    }

    // Очищаем левую панель
    leftPanel.innerHTML = '';

    // Добавляем каждый предмет в левую панель
    items.forEach((item) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'div-wrapper';
        itemElement.innerHTML = `<div class="text-wrapper">${item.name || 'Без названия'}</div>`;
        itemElement.style.cursor = 'pointer';
        
        // При клике на предмет открываем его в таблице
        itemElement.addEventListener('click', () => {
            // Находим индекс предмета
            const itemIndex = items.findIndex(i => i.id === item.id);
            if (itemIndex !== -1) {
                // Вычисляем на какой странице находится предмет
                currentPage = Math.floor(itemIndex / itemsPerPage) + 1;
                renderItemsTable();
                
                // Скроллим к предмету в таблице
                setTimeout(() => {
                    const rows = document.querySelectorAll('.frame-21');
                    const rowIndex = itemIndex % itemsPerPage;
                    if (rows[rowIndex]) {
                        rows[rowIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            }
        });
        
        leftPanel.appendChild(itemElement);
    });
}

/**
 * Создать ряд таблицы для предмета
 */
function createItemRow(item) {
    const row = document.createElement('div');
    row.className = 'frame-21';
    row.innerHTML = `
        <div class="frame-20"><div class="text-wrapper-7">${item.name || 'Без названия'}</div></div>
        <div class="frame-18"><div class="text-wrapper-8">${(item.description || '').substring(0, 50)}${item.description && item.description.length > 50 ? '...' : ''}</div></div>
        <div class="frame-19"><div class="text-wrapper-7">${item.image_url ? item.image_url.split('/').pop() : 'Нет'}</div></div>
        <div class="frame-20">
            <img class="material-symbols-2 edit-btn" src="https://c.animaapp.com/mjkmnxnmeczW1N/img/material-symbols-edit-outline.svg" alt="Edit" style="cursor: pointer;" />
            <img class="material-symbols-2 delete-btn" src="https://c.animaapp.com/mjkmnxnmeczW1N/img/material-symbols-delete-outline.svg" alt="Delete" style="cursor: pointer;" />
        </div>
    `;

    // Обработчики для кнопок
    row.querySelector('.edit-btn').addEventListener('click', () => editItem(item));
    row.querySelector('.delete-btn').addEventListener('click', () => deleteItem(item));

    return row;
}

/**
 * Обновить пагинацию
 */
function updatePagination(totalPages) {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    // Обновляем активную страницу
    const pageActive = pagination.querySelector('.page-active .num');
    if (pageActive) {
        pageActive.textContent = currentPage;
    }

    // Обновляем кнопки навигации
    const prevBtn = pagination.querySelector('.page:first-child');
    const nextBtn = pagination.querySelector('.page:last-child');

    if (prevBtn) {
        prevBtn.style.opacity = currentPage === 1 ? '0.5' : '1';
        prevBtn.style.cursor = currentPage === 1 ? 'not-allowed' : 'pointer';
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderItemsTable();
            }
        };
    }

    if (nextBtn) {
        nextBtn.style.opacity = currentPage === totalPages ? '0.5' : '1';
        nextBtn.style.cursor = currentPage === totalPages ? 'not-allowed' : 'pointer';
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderItemsTable();
            }
        };
    }
}

/**
 * Редактировать предмет
 */
function editItem(item) {
    const modal = document.getElementById('addItemModal');
    const form = document.getElementById('addItemForm');
    
    if (!modal || !form) return;

    // Сохраняем ID редактируемого предмета
    form.dataset.editingItemId = item.id;

    // Заполняем форму данными предмета
    form.querySelector('input[type="text"]').value = item.name || '';
    form.querySelector('textarea').value = item.description || '';

    // Меняем заголовок
    const title = form.querySelector('.add-item-title');
    if (title) {
        title.textContent = 'Редактировать предмет';
    }

    // Открываем модальное окно
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

/**
 * Удалить предмет
 */
async function deleteItem(item) {
    if (!confirm(`Вы уверены что хотите удалить "${item.name}"?`)) return;

    try {
        await adminDeleteItem(item.id);
        showSuccess('Предмет удален');
        await loadItems();
    } catch (error) {
        console.error('Failed to delete item:', error);
        showError('Ошибка при удалении предмета');
    }
}

/**
 * Инициализировать обработчики событий
 */
function initEventHandlers() {
    const modal = document.getElementById('addItemModal');
    const addItemBtn = document.querySelector('.add-item-btn');
    const closeBtn = document.querySelector('.add-item-modal-close');
    const overlay = document.querySelector('.add-item-modal-overlay');
    const form = document.getElementById('addItemForm');
    const languageSelect = document.getElementById('languageSelect');
    const searchInput = document.getElementById('searchInput');

    // Инициализируем свичер языков
    if (languageSelect) {
        const currentLang = localStorage.getItem('language') || 'ru';
        languageSelect.value = currentLang;
        
        languageSelect.addEventListener('change', async (e) => {
            const newLang = e.target.value;
            localStorage.setItem('language', newLang);
            console.log('Language changed to:', newLang);
            
            // Перезагружаем предметы с новым языком
            currentPage = 1;
            searchQuery = '';
            if (searchInput) searchInput.value = '';
            await loadItems();
        });
    }

    // Инициализируем поиск
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchQuery = e.target.value;
            
            // Debounce поиска на 300ms
            searchTimeout = setTimeout(() => {
                currentPage = 1;
                renderItemsTable();
            }, 300);
        });
    }

    // Инициализируем фильтр по категориям
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            selectedCategory = e.target.value;
            currentPage = 1;
            renderItemsTable();
        });
    }

    // Инициализируем сортировку
    const sortNameBtn = document.getElementById('sortNameBtn');
    if (sortNameBtn) {
        sortNameBtn.addEventListener('click', () => {
            if (sortBy === 'name') {
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                sortBy = 'name';
                sortOrder = 'asc';
            }
            currentPage = 1;
            renderItemsTable();
        });
    }

    function openModal() {
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Очищаем форму
            if (form) {
                form.reset();
                delete form.dataset.editingItemId;
                const title = form.querySelector('.add-item-title');
                if (title) {
                    title.textContent = 'Adding an item';
                }
            }
        }
    }

    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    if (addItemBtn) {
        addItemBtn.addEventListener('click', openModal);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = form.querySelector('input[type="text"]').value;
            const description = form.querySelector('textarea').value;

            if (!name.trim() || !description.trim()) {
                showError('Заполните все поля');
                return;
            }

            try {
                // Проверяем, редактируем ли мы предмет
                const editingItemId = form.dataset.editingItemId;
                
                if (editingItemId) {
                    // Обновляем существующий предмет
                    await adminUpdateItem(editingItemId, {
                        name: name,
                        description: description
                    });
                    showSuccess('Предмет обновлен');
                    delete form.dataset.editingItemId;
                } else {
                    // Создаем новый предмет
                    await adminCreateItem({
                        name: name,
                        description: description
                    });
                    showSuccess('Предмет добавлен');
                }
                
                closeModal();
                await loadItems();
            } catch (error) {
                console.error('Failed to save item:', error);
                showError('Ошибка при сохранении предмета');
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            closeModal();
        }
    });
}
