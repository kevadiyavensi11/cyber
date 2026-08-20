import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Add a request interceptor to add the JWT token to headers
api.interceptors.request.use(
    (config) => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user && user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            }
        } catch (e) {
            console.error("Auth interceptor error:", e);
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
    getTimeline: (id) => api.get(`/reports/${id}/timeline`),
    getEvidence: (id) => api.get(`/reports/${id}/evidence`),
    getMessages: (reportId) => api.get(`/messages/${reportId}`),
    postMessage: (messageData) => api.post('/messages', messageData),
    reopen: (id, payload) => api.put(`/reports/reopen/${id}`, payload),
    pay: (id, payload) => api.put(`/reports/pay/${id}`, payload),
    analyzeEvidence: (formData) => api.post('/reports/analyze-evidence', formData),
    uploadChatMessageFile: (formData) => api.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    markChatMessagesSeen: (id) => api.put(`/messages/seen/${id}`),
    downloadReportPDF: (id) => api.get(`/reports/${id}/pdf`, { responseType: 'blob' }),
};


// Admin Services
export const adminService = {
    getUsers: () => api.get('/admin/users'), // Backend is /api/admin/users
    getDashboard: () => api.get('/dashboard/admin-stats'),
};

// Officer Services
export const officerService = {
    getDashboard: (id) => api.get(`/dashboard/officer-stats/${id}`),
};

// Citizen Services
export const citizenService = {
    getDashboard: (id) => api.get(`/dashboard/citizen-stats/${id}`),
};

// Collaboration Services
export const collaborationService = {
    getHistory: (reportId) => api.get(`/collaboration/history/${reportId}`),
    sendMessage: (messageData) => api.post('/collaboration/message', messageData),
    uploadAttachment: (formData) => api.post('/collaboration/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    requestInfo: (requestData) => api.post('/collaboration/request-info', requestData),
};

export default api;
