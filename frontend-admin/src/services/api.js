import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }

        // Aggressively prevent GET caching
        if (config.method && config.method.toLowerCase() === 'get') {
            config.params = config.params || {};
            config.params['t'] = new Date().getTime();
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth Services
export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me'),
    updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Report Services
export const reportService = {
    create: (reportData) => api.post('/reports/create', reportData),
    getCitizenReports: (id) => api.get(`/reports/citizen/${id}`),
    getOfficerReports: (id) => api.get(`/reports/officer/${id}`),
    getAllReports: () => api.get('/reports/all'),
    getById: (id) => api.get(`/reports/${id}`),
    updateStatus: (id, statusData) => api.put(`/reports/update-status/${id}`, statusData),
    edit: (id, reportData) => api.put(`/reports/edit/${id}`, reportData),
    delete: (id) => api.delete(`/reports/${id}`),
    extendSla: (id, extensionData) => api.put(`/reports/${id}/extend-sla`, extensionData),
};


// Admin Services
export const adminService = {
    getUsers: () => api.get('/admin/citizens'), // Backend is /api/admin/citizens
    getDashboard: () => api.get('/admin/dashboard'),
    addOfficer: (officerData) => api.post('/admin/officer/add', officerData),
    getZones: () => api.get('/zones'),
};

// Officer Services
export const officerService = {
    getDashboard: (id) => api.get(`/dashboard/officer-stats/${id}`),
};

// Citizen Services
export const citizenService = {
    getDashboard: (id) => api.get(`/dashboard/citizen-stats/${id}`),
};

// System Log Services
export const systemLogService = {
    getLogs: () => api.get('/system-logs'),
};

export default api;

