import axios, { AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for Render cold starts
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // For demo purposes, always use demo token
      // In production, this would get the token from your auth system
      config.headers.Authorization = `Bearer demo-token`;
    } catch (error) {
      console.error('Error setting auth token:', error);
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
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
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
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return defaultMessage;
};

// Auth API
export const authAPI = {
  signIn: async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/signin', { email, password });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to sign in'));
    }
  },

  signUp: async (userData: any) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create account'));
    }
  },

  sendOtp: async (phone: string) => {
    try {
      const response = await api.post('/api/auth/send-otp', { phone });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to send OTP'));
    }
  },

  verifyOtp: async (phone: string, otp: string) => {
    try {
      const response = await api.post('/api/auth/verify-otp', { phone, otp });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to verify OTP'));
    }
  },

  verifyPin: async (userId: string, pin: string) => {
    try {
      const response = await api.post('/api/auth/verify-pin', { userId, pin });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to verify PIN'));
    }
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch dashboard stats'));
    }
  },

  getBatchData: async () => {
    try {
      const response = await api.get('/api/dashboard/batch');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch batch data'));
    }
  },

  getAssets: async () => {
    try {
      const response = await api.get('/api/dashboard/assets');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch assets'));
    }
  },

  getNominees: async () => {
    try {
      const response = await api.get('/api/dashboard/nominees');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch nominees'));
    }
  },

  getTradingAccounts: async () => {
    try {
      const response = await api.get('/api/dashboard/trading-accounts');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch trading accounts'));
    }
  },
};

// Assets API
export const assetsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/api/assets');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch assets'));
    }
  },

  create: async (assetData: any) => {
    try {
      const response = await api.post('/api/assets', assetData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create asset'));
    }
  },

  update: async (id: string, assetData: any) => {
    try {
      const response = await api.put(`/api/assets/${id}`, assetData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update asset'));
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/api/assets/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete asset'));
    }
  },
};

// Nominees API
export const nomineesAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/api/nominees');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch nominees'));
    }
  },

  create: async (nomineeData: any) => {
    try {
      const response = await api.post('/api/nominees', nomineeData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create nominee'));
    }
  },

  update: async (id: string, nomineeData: any) => {
    try {
      const response = await api.put(`/api/nominees/${id}`, nomineeData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update nominee'));
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/api/nominees/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete nominee'));
    }
  },
};

// Trading Accounts API
export const tradingAccountsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/api/trading-accounts');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch trading accounts'));
    }
  },

  create: async (tradingAccountData: any) => {
    try {
      const response = await api.post('/api/trading-accounts', tradingAccountData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create trading account'));
    }
  },

  update: async (id: string, tradingAccountData: any) => {
    try {
      const response = await api.put(`/api/trading-accounts/${id}`, tradingAccountData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update trading account'));
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/api/trading-accounts/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete trading account'));
    }
  },
};

// Vault API
export const vaultAPI = {
  getRequests: async () => {
    try {
      const response = await api.get('/api/vault/requests');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to fetch vault requests'));
    }
  },

  createRequest: async (requestData: any) => {
    try {
      const response = await api.post('/api/vault/requests', requestData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to create vault request'));
    }
  },

  updateRequest: async (id: string, requestData: any) => {
    try {
      const response = await api.put(`/api/vault/requests/${id}`, requestData);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to update vault request'));
    }
  },

  deleteRequest: async (id: string) => {
    try {
      const response = await api.delete(`/api/vault/requests/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error, 'Failed to delete vault request'));
    }
  },
};

export default api;
