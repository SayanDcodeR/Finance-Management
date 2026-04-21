import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// Dashboard APIs
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
};

// Income APIs
export const incomeAPI = {
  getAll: () => api.get('/incomes'),
  getById: (id) => api.get(`/incomes/${id}`),
  create: (data) => api.post('/incomes', data),
  update: (id, data) => api.put(`/incomes/${id}`, data),
  delete: (id) => api.delete(`/incomes/${id}`),
  getByDateRange: (startDate, endDate) => api.get(`/incomes/date-range?startDate=${startDate}&endDate=${endDate}`),
};

// Expense APIs
export const expenseAPI = {
  getAll: () => api.get('/expenses'),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getByDateRange: (startDate, endDate) => api.get(`/expenses/date-range?startDate=${startDate}&endDate=${endDate}`),
};

// Category APIs
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getByType: (type) => api.get(`/categories/type/${type}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Budget APIs
export const budgetAPI = {
  getAll: () => api.get('/budgets'),
  getByMonthYear: (month, year) => api.get(`/budgets/month/${month}/year/${year}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
  getAlerts: () => api.get('/budgets/alerts'),
};

// Transaction APIs
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  search: (query) => api.get(`/transactions/search?query=${query}`),
  getRecent: () => api.get('/transactions/recent'),
};

// Goal APIs
export const goalAPI = {
  getAll: () => api.get('/goals'),
  getById: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  updateProgress: (id, currentAmount) => api.patch(`/goals/${id}/progress`, { currentAmount }),
};

// Recurring Transaction APIs
export const recurringAPI = {
  getAll: () => api.get('/recurring'),
  create: (data) => api.post('/recurring', data),
  update: (id, data) => api.put(`/recurring/${id}`, data),
  delete: (id) => api.delete(`/recurring/${id}`),
  toggle: (id) => api.patch(`/recurring/${id}/toggle`),
};

// Report APIs
export const reportAPI = {
  getMonthly: (year, month) => api.get(`/reports/monthly?year=${year}&month=${month}`),
  getYearly: (year) => api.get(`/reports/yearly?year=${year}`),
  getCategoryWise: (startDate, endDate) => api.get(`/reports/category-wise?startDate=${startDate}&endDate=${endDate}`),
};

export default api;
