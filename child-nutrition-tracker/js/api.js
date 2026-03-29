/**
 * API Client for Backend Communication
 */
const API = {
    /**
     * Base fetch wrapper with error handling
     */
    async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const token = Utils.retrieve('auth_token');

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, finalOptions);
            const data = await response.json();

            if (!response.ok) {
                // Handle 401 Unauthorized
                if (response.status === 401) {
                    Auth.logout();
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    /**
     * GET request
     */
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    /**
     * POST request
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    /**
     * PUT request
     */
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    // ==================== Auth Endpoints ====================
    auth: {
        async login(username, password) {
            return API.post('/auth/login', { username, password });
        },

        async register(userData) {
            return API.post('/auth/register', userData);
        },

        async logout() {
            return API.post('/auth/logout', {});
        },

        async getProfile() {
            return API.get('/auth/profile');
        },

        async deleteAccount() {
            return API.delete('/auth/profile');
        }
    },

    // ==================== Children Endpoints ====================
    children: {
        async getAll() {
            return API.get('/children');
        },

        async getById(id) {
            return API.get(`/children/${id}`);
        },

        async create(data) {
            return API.post('/children', data);
        },

        async update(id, data) {
            return API.put(`/children/${id}`, data);
        },

        async delete(id) {
            return API.delete(`/children/${id}`);
        }
    },

    // ==================== Growth Records Endpoints ====================
    growth: {
        async getByChildId(childId) {
            return API.get(`/children/${childId}/growth`);
        },

        async add(childId, data) {
            return API.post(`/children/${childId}/growth`, data);
        },

        async getLatest(childId) {
            return API.get(`/children/${childId}/growth/latest`);
        }
    },

    // ==================== Blood Reports Endpoints ====================
    blood: {
        async getByChildId(childId) {
            return API.get(`/children/${childId}/blood-reports`);
        },

        async add(childId, data) {
            return API.post(`/children/${childId}/blood-reports`, data);
        },

        async analyze(childId, reportId) {
            return API.get(`/children/${childId}/blood-reports/${reportId}/analysis`);
        }
    },

    // ==================== Vaccinations Endpoints ====================
    vaccinations: {
        async getByChildId(childId) {
            return API.get(`/children/${childId}/vaccinations`);
        },

        async markComplete(childId, vaccinationId, data) {
            return API.put(`/children/${childId}/vaccinations/${vaccinationId}/complete`, data);
        },

        async updateStatus(childId, vaccinationId, status, completedDate = null) {
            const body = { status };
            if (completedDate) body.completed_date = completedDate;
            return API.put(`/children/${childId}/vaccinations/${vaccinationId}/status`, body);
        },

        async getSchedule() {
            return API.get('/vaccinations/schedule');
        }
    },

    // ==================== Alerts Endpoints ====================
    alerts: {
        async getAll() {
            return API.get('/alerts');
        },

        async dismiss(id) {
            return API.put(`/alerts/${id}/dismiss`, {});
        }
    },

    // ==================== Dashboard Endpoints ====================
    dashboard: {
        async getParentStats() {
            return API.get('/dashboard/parent');
        },

        async getHealthCenterStats() {
            return API.get('/dashboard/health-center');
        },

        async getWhoStats() {
            return API.get('/dashboard/who');
        },

        async getHealthCenterReports() {
            return API.get('/reports/health-center');
        }
    },

    // ==================== Nutrition Plans Endpoints ====================
    nutrition: {
        async getPlans() {
            return API.get('/nutrition/plans');
        },

        async getRecommendations(childId) {
            return API.get(`/children/${childId}/nutrition/recommendations`);
        }
    }
};

// Make API available globally
window.API = API;
