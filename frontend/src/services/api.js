import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getProducts = (params) => {
  return api.get('/products', { params });
};

export const getAllProducts = () => {
  return api.get('/products/all');
};

export const getReviews = (params) => {
  return api.get('/reviews', { params });
};

export const getAnalytics = () => {
  return api.get('/analytics');
};

export const getRatingDistribution = (productId) => {
  return api.get('/reviews/distribution', { params: { product_id: productId } });
};

export const getRecentReviews = (limit = 10) => {
  return api.get('/reviews/recent', { params: { limit } });
};

export const getReviewStats = () => {
  return api.get('/reviews/stats');
};

export default api;