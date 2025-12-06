/**
 * Модель для работы с таблицей admins
 * Управление администраторами системы
 */

import pool from '../config/database.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

class AdminsModel {
    /**
     * Поиск админа по email
     * @param {string} email - Email администратора
     * @returns {Promise<Object|null>} - Данные админа или null
     */
    async findByEmail(email) {
        const query = `
            SELECT 
                id,
                email,
                password_hash as password,
                name,
                created_at,
                updated_at
            FROM admins
            WHERE email = $1
        `;
        
        const result = await pool.query(query, [email]);
        return result.rows[0] || null;
    }

    /**
     * Поиск админа по ID
     * @param {number} id - ID администратора
     * @returns {Promise<Object|null>} - Данные админа (без пароля) или null
     */
    async findById(id) {
        const query = `
            SELECT 
                id,
                email,
                name,
                created_at,
                updated_at
            FROM admins
            WHERE id = $1
        `;
        
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    /**
     * Проверка пароля
     * @param {string} plainPassword - Введенный пароль
     * @param {string} hashedPassword - Хешированный пароль из БД
     * @returns {Promise<boolean>} - true если пароль верный
     */
    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Создание нового администратора
     * @param {Object} adminData - Данные админа
     * @param {string} adminData.email - Email
     * @param {string} adminData.password - Пароль (будет хеширован)
     * @param {string} adminData.name - Имя
     * @returns {Promise<Object>} - Созданный админ (без пароля)
     */
    async createAdmin({ email, password, name }) {
        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        const query = `
            INSERT INTO admins (email, password_hash, name)
            VALUES ($1, $2, $3)
            RETURNING id, email, name, created_at, updated_at
        `;
        
        const result = await pool.query(query, [email, hashedPassword, name]);
        return result.rows[0];
    }

    /**
     * Обновление данных администратора
     * @param {number} id - ID администратора
     * @param {Object} updateData - Данные для обновления
     * @returns {Promise<Object>} - Обновленный админ
     */
    async updateAdmin(id, updateData) {
        const { email, password, name } = updateData;
        
        let query = 'UPDATE admins SET updated_at = CURRENT_TIMESTAMP';
        const params = [];
        let paramIndex = 1;
        
        if (email) {
            query += `, email = $${paramIndex}`;
            params.push(email);
            paramIndex++;
        }
        
        if (password) {
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            query += `, password_hash = $${paramIndex}`;
            params.push(hashedPassword);
            paramIndex++;
        }
        
        if (name) {
            query += `, name = $${paramIndex}`;
            params.push(name);
            paramIndex++;
        }
        
        query += ` WHERE id = $${paramIndex} RETURNING id, email, name, created_at, updated_at`;
        params.push(id);
        
        const result = await pool.query(query, params);
        return result.rows[0];
    }

    /**
     * Удаление администратора
     * @param {number} id - ID администратора
     * @returns {Promise<boolean>} - true если удален
     */
    async deleteAdmin(id) {
        const query = 'DELETE FROM admins WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rowCount > 0;
    }

    /**
     * Получить всех администраторов
     * @returns {Promise<Array>} - Список админов (без паролей)
     */
    async getAllAdmins() {
        const query = `
            SELECT 
                id,
                email,
                name,
                created_at,
                updated_at
            FROM admins
            ORDER BY created_at DESC
        `;
        
        const result = await pool.query(query);
        return result.rows;
    }
}

export default new AdminsModel();

