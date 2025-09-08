import axios from 'axios';

const API_BASE_URL = 'http://localhost:3003/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API with role support
export const authAPI = {
  sendOtp: (phone: string, role: string) =>
    api.post('/auth/send-otp', { phone, role }),

  verifyOtp: (phone: string, otp: string, role: string) =>
    api.post('/auth/verify-otp', { phone, otp, role }),

  verifyPin: (userId: string, pin: string) =>
    api.post('/auth/verify-pin', { userId, pin }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => 
    api.get('/dashboard/stats'),
  
  getAssets: () => 
    api.get('/dashboard/assets'),
  
  getNominees: () => 
    api.get('/nominees'),
};

// Assets API
export const assetsAPI = {
  getAll: () => 
    api.get('/dashboard/assets'),
  
  create: (assetData: any) => 
    api.post('/assets', assetData),
  
  update: (id: string, assetData: any) => 
    api.put(`/assets/${id}`, assetData),
  
  delete: (id: string) => 
    api.delete(`/assets/${id}`),
};

// Nominees API
export const nomineesAPI = {
  getAll: () => 
    api.get('/nominees'),
  
  create: (nomineeData: any) => 
    api.post('/nominees', nomineeData),
  
  update: (id: string, nomineeData: any) => 
    api.put(`/nominees/${id}`, nomineeData),
  
  delete: (id: string) => 
    api.delete(`/nominees/${id}`),
};

// Vault API
export const vaultAPI = {
  getRequests: () => 
    api.get('/vault/requests'),
  
  submitRequest: (requestData: any) => 
    api.post('/vault/requests', requestData),
  
  updateStatus: (id: string, status: string, notes?: string) => 
    api.put(`/vault/requests/${id}`, { status, notes }),
};

// File Upload API
export const uploadAPI = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Admin API
export const adminAPI = {
  createAdmin: (adminData: any) => 
    api.post('/admin/create', adminData),
};

export default api;

// Trading Accounts API
export const tradingAccountsAPI = {
  getAll: () => 
    api.get('/trading-accounts'),
  
  create: (tradingAccountData: any) => 
    api.post('/trading-accounts', tradingAccountData),
  
  update: (id: string, tradingAccountData: any) => 
    api.put(`/trading-accounts/${id}`, tradingAccountData),
  
  delete: (id: string) => 
    api.delete(`/trading-accounts/${id}`),
};
