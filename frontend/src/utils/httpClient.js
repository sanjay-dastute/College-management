import axios from 'axios';
import { API_BASE_URL, ERROR_MESSAGES } from '../constants';

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
httpClient.interceptors.request.use(
  (config) => {
    console.group('🚀 API Request');
    console.log(`${config.method.toUpperCase()} ${config.url}`);

    // Log headers
    console.log('Request Headers:', {
      ...config.headers,
      Authorization: config.headers.Authorization ? 'Bearer [REDACTED]' : undefined
    });

    // Special handling for FormData
    if (config.data instanceof FormData) {
      console.log('FormData contents:');
      for (let pair of config.data.entries()) {
        console.log(`- ${pair[0]}: ${pair[0] === 'user' ? JSON.parse(pair[1]) : pair[1]}`);
      }
    } else {
      console.log('Request Data:', config.data);
    }
    console.groupEnd();

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
httpClient.interceptors.response.use(
  (response) => {
    console.group('✅ API Response Details');
    console.log('%cMethod:', 'color: blue; font-weight: bold', response.config.method.toUpperCase());
    console.log('%cURL:', 'color: blue; font-weight: bold', response.config.url);
    console.log('%cStatus:', 'color: green; font-weight: bold', response.status);
    console.log('%cResponse Data:', 'color: purple; font-weight: bold', response.data);
    console.groupEnd();
    return response.data;
  },
  async (error) => {
    console.group('❌ API Error Details');
    console.error('%cOriginal Request:', 'color: red', error.config);
    console.error('%cError Response:', 'color: red', error.response?.data);
    console.error('%cError Status:', 'color: red', error.response?.status);
    console.groupEnd();

    const originalRequest = error.config;
    let errorMessage = ERROR_MESSAGES.SERVER_ERROR;

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          const response = await httpClient.post('/api/token/refresh/', { refresh: refreshToken });
          localStorage.setItem('accessToken', response.access);
          originalRequest.headers.Authorization = `Bearer ${response.access}`;
          return httpClient(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
        }
      } else {
        switch (status) {
          case 403:
            errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
            break;
          case 404:
            errorMessage = 'Resource not found';
            break;
          case 413:
            errorMessage = 'File size too large';
            break;
          case 422:
            errorMessage = data.detail || ERROR_MESSAGES.FORM_VALIDATION;
            break;
          default:
            errorMessage = data.detail || ERROR_MESSAGES.SERVER_ERROR;
        }
      }
    } else if (error.request) {
      errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
    }

    const customError = new Error(errorMessage);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    throw customError;
  }
);

export const get = async (url, config = {}) => {
  return await httpClient.get(url, config);
};

export const post = async (url, data, config = {}) => {
  const isFormData = data instanceof FormData;
  const requestConfig = {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    },
  };
  return await httpClient.post(url, data, requestConfig);
};

export const put = async (url, data, config = {}) => {
  const isFormData = data instanceof FormData;
  const requestConfig = {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    },
  };
  return await httpClient.put(url, data, requestConfig);
};

export const del = async (url, config = {}) => {
  return await httpClient.delete(url, config);
};

export default httpClient;
