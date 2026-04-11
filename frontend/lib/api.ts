import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    return apiClient.post('/api/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    aadhaar_id?: string;
  }) => apiClient.post('/api/auth/register', data),
  getMe: () => apiClient.get('/api/auth/me'),
};

// Properties API
export const propertiesAPI = {
  getMyProperties: () => apiClient.get('/api/properties/me'),
  getProperty: (propertyId: string) => apiClient.get(`/api/properties/${propertyId}`),
  getAllProperties: () => apiClient.get('/api/properties/'),
};

// Transfers API
export const transfersAPI = {
  initiate: (data: {
    property_id: string;
    buyer_name: string;
    buyer_aadhaar_id: string;
    agreed_price: number;
    document_url?: string;
  }) => apiClient.post('/api/transfers/initiate', data),
  getMyTransfers: () => apiClient.get('/api/transfers/my'),
  getPending: () => apiClient.get('/api/transfers/pending'),
  getTransfer: (transferId: string) => apiClient.get(`/api/transfers/${transferId}`),
  approve: (transferId: string) => apiClient.post(`/api/transfers/${transferId}/approve`),
  reject: (transferId: string, reason: string) =>
    apiClient.post(`/api/transfers/${transferId}/reject`, { reason }),
};

// Blockchain API
export const blockchainAPI = {
  verify: (propertyId: string) => apiClient.get(`/api/blockchain/verify/${propertyId}`),
  getStats: () => apiClient.get('/api/blockchain/stats'),
  getChain: () => apiClient.get('/api/blockchain/chain'),
};

export default apiClient;