import axios, { AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    
    // Enhanced error logging
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    
    return Promise.reject(error);
  }
);

// Enhanced error handling utility
const handleApiError = (error: any, defaultMessage: string = 'An error occurred') => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return defaultMessage;
};

// Auth API with enhanced error handling
export const authAPI = {
  sendOtp: async (phone: string, role: string) => {
    try {
      const response = await api.post('/auth/send-otp', { phone, role });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to send OTP'));
    }
  },

  verifyOtp: async (phone: string, otp: string, role: string) => {
    try {
      const response = await api.post('/auth/verify-otp', { phone, otp, role });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to verify OTP'));
    }
  },

  verifyPin: async (userId: string, pin: string) => {
    try {
      const response = await api.post('/auth/verify-pin', { userId, pin });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to verify PIN'));
    }
  },
};

// Dashboard API with enhanced error handling
export const dashboardAPI = {
  getStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch dashboard statistics'));
    }
  },
  
  getAssets: async () => {
    try {
      const response = await api.get('/assets');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch assets'));
    }
  },
  
  getNominees: async () => {
    try {
      const response = await api.get('/nominees');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch nominees'));
    }
  },
};

// Assets API with enhanced error handling
export const assetsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/assets');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch assets'));
    }
  },
  
  create: async (assetData: any) => {
    try {
      const response = await api.post('/assets', assetData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create asset'));
    }
  },
  
  update: async (id: string, assetData: any) => {
    try {
      const response = await api.put(`/assets/${id}`, assetData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update asset'));
    }
  },
  
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/assets/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete asset'));
    }
  },
};

// Nominees API with enhanced error handling
export const nomineesAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/nominees');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch nominees'));
    }
  },
  
  create: async (nomineeData: any) => {
    try {
      const response = await api.post('/nominees', nomineeData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create nominee'));
    }
  },
  
  update: async (id: string, nomineeData: any) => {
    try {
      const response = await api.put(`/nominees/${id}`, nomineeData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update nominee'));
    }
  },
  
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/nominees/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete nominee'));
    }
  },
};

// Vault API with enhanced error handling
export const vaultAPI = {
  getRequests: async () => {
    try {
      const response = await api.get('/vault/requests');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch vault requests'));
    }
  },
  
  submitRequest: async (requestData: any) => {
    try {
      const response = await api.post('/vault/requests', requestData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to submit vault request'));
    }
  },
  
  updateStatus: async (id: string, status: string, notes?: string) => {
    try {
      const response = await api.put(`/vault/requests/${id}`, { status, notes });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update vault request status'));
    }
  },
};

// File Upload API with enhanced error handling
export const uploadAPI = {
  uploadFile: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout for file uploads
      });
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to upload file'));
    }
  },
};

// Trading Accounts API with enhanced error handling
export const tradingAccountsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/trading-accounts');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch trading accounts'));
    }
  },
  
  create: async (tradingAccountData: any) => {
    try {
      const response = await api.post('/trading-accounts', tradingAccountData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create trading account'));
    }
  },
  
  update: async (id: string, tradingAccountData: any) => {
    try {
      const response = await api.put(`/trading-accounts/${id}`, tradingAccountData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update trading account'));
    }
  },
  
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/trading-accounts/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete trading account'));
    }
  },
};

// Health check API
export const healthAPI = {
  check: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Health check failed'));
    }
  },
};

export default api;

// Admin API with enhanced error handling
export const adminAPI = {
  getStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch admin statistics'));
    }
  },
  
  getVaultRequests: async () => {
    try {
      const response = await api.get('/admin/vault-requests');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch vault requests'));
    }
  },
  
  updateVaultRequestStatus: async (id: string, status: string, notes?: string) => {
    try {
      const response = await api.put(`/admin/vault-requests/${id}`, { status, notes });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update vault request status'));
    }
  },
  
  getUsers: async () => {
    try {
      const response = await api.get("/admin/users");
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, "Failed to fetch users"));
    }
  },
  
  createAdmin: async (adminData: any) => {
    try {
      const response = await api.post("/admin/create", adminData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, "Failed to create admin"));
    }
  },
};

