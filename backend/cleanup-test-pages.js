/**
 * Очистка тестовых страниц перед запуском тестов
 */

import pool from './src/config/database.js';

async function cleanupTestPages() {
    try {
        console.log('🧹 Очистка тестовых данных...\n');

        // Удаляем страницы с тестовыми slug
        const testSlugs = ['test-page', 'Invalid Slug', 'Invalid Slug With Spaces'];
        
        for (const slug of testSlugs) {
            const [pages] = await pool.query('SELECT id FROM pages WHERE slug = ?', [slug]);
            
            if (pages.length > 0) {
                const pageId = pages[0].id;
                
                // Удаляем переводы страницы
                await pool.query('DELETE FROM page_translations WHERE page_id = ?', [pageId]);
                
                // Удаляем саму страницу
                await pool.query('DELETE FROM pages WHERE id = ?', [pageId]);
                
                console.log(`✅ Удалена тестовая страница: ${slug} (ID: ${pageId})`);
            }
        }

        // Удаляем тестовые items
        const [testItems] = await pool.query(
            'SELECT id, slug FROM items WHERE slug LIKE ? OR slug LIKE ?',
            ['test-item-%', 'Invalid%']
        );

        for (const item of testItems) {
            // Удаляем переводы
            await pool.query('DELETE FROM item_translations WHERE item_id = ?', [item.id]);
            
            // Удаляем item
            await pool.query('DELETE FROM items WHERE id = ?', [item.id]);
            
            console.log(`✅ Удалён тестовый item: ${item.slug} (ID: ${item.id})`);
        }

        // Удаляем тестовые блоки с sort_order = 999
        const [testBlocks] = await pool.query('SELECT id FROM blocks WHERE sort_order = 999');
        
        for (const block of testBlocks) {
            // Удаляем переводы
            await pool.query('DELETE FROM block_translations WHERE block_id = ?', [block.id]);
            
            // Удаляем block
            await pool.query('DELETE FROM blocks WHERE id = ?', [block.id]);
            
            console.log(`✅ Удалён тестовый блок ID: ${block.id}`);
        }

        // Удаляем тестовые языки
        const testLanguageCodes = ['de', 'fr'];
        
        for (const code of testLanguageCodes) {
            const [result] = await pool.query('DELETE FROM languages WHERE code = ?', [code]);
            
            if (result.affectedRows > 0) {
                console.log(`✅ Удалён тестовый язык: ${code}`);
            }
        }

        console.log('\n✨ Очистка завершена!');
        
    } catch (error) {
        console.error('❌ Ошибка очистки:', error.message);
    }
    
    // Закрываем пул
    process.exit(0);
}

cleanupTestPages();

