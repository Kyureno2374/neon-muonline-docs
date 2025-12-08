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
            WHERE email = ?
        `;
        
        const [rows] = await pool.query(query, [email]);
        return rows[0] || null;
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
            WHERE id = ?
        `;
        
        const [rows] = await pool.query(query, [id]);
        return rows[0] || null;
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
            VALUES (?, ?, ?)
        `;
        
        const [result] = await pool.query(query, [email, hashedPassword, name]);
        
        // Получаем созданного админа
        const [rows] = await pool.query(
            'SELECT id, email, name, created_at, updated_at FROM admins WHERE id = ?',
            [result.insertId]
        );
        return rows[0];
    }

    /**
     * Обновление данных администратора
     * @param {number} id - ID администратора
     * @param {Object} updateData - Данные для обновления
     * @returns {Promise<Object>} - Обновленный админ
     */
    async updateAdmin(id, updateData) {
        const { email, password, name } = updateData;
        
        const fields = [];
        const params = [];
        
        if (email) {
            fields.push('email = ?');
            params.push(email);
        }
        
        if (password) {
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
            fields.push('password_hash = ?');
            params.push(hashedPassword);
        }
        
        if (name) {
            fields.push('name = ?');
            params.push(name);
        }
        
        if (fields.length === 0) {
            return await this.findById(id);
        }
        
        params.push(id);
        
        const query = `UPDATE admins SET ${fields.join(', ')} WHERE id = ?`;
        await pool.query(query, params);
        
        // Получаем обновленного админа
        return await this.findById(id);
    }

    /**
     * Удаление администратора
     * @param {number} id - ID администратора
     * @returns {Promise<boolean>} - true если удален
     */
    async deleteAdmin(id) {
        const query = 'DELETE FROM admins WHERE id = ?';
        const [result] = await pool.query(query, [id]);
        return result.affectedRows > 0;
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
        
        const [rows] = await pool.query(query);
        return rows;
    }
}

export default new AdminsModel();
