/**
 * API Client для работы с backend
 */

const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : '/api';

class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Универсальный метод для HTTP запросов
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.error?.message || 'Request failed',
                    code: data.error?.code || 'UNKNOWN_ERROR',
                    data: data
                };
            }

            return data;
        } catch (error) {
            if (error.status) {
                throw error;
            }
            
            throw {
                status: 0,
                message: 'Network error or server unavailable',
                code: 'NETWORK_ERROR'
            };
        }
    }

    /**
     * GET запрос
     */
    async get(endpoint, token = null) {
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return this.request(endpoint, {
            method: 'GET',
            headers
        });
    }

    /**
     * POST запрос
     */
    async post(endpoint, data, token = null) {
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return this.request(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT запрос
     */
    async put(endpoint, data, token = null) {
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return this.request(endpoint, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE запрос
     */
    async delete(endpoint, token = null) {
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return this.request(endpoint, {
            method: 'DELETE',
            headers
        });
    }
}

// Экспортируем экземпляр
const api = new ApiClient();

