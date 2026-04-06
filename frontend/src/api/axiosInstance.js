import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
    }
});

// We can't import the store here easily, but we can set up the interceptor 
// to read from a global or be injected. 
// For now, we'll implement it to read from a local variable that can be updated.

let accessToken = null;

export const setAuthToken = (token) => {
    accessToken = token;
};

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor handles 401 Unauthorized
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't retried yet
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // In a real app, get refresh token from secure place or state
                const refreshToken = localStorage.getItem('refreshToken'); 
                const response = await axios.post('http://localhost:8000/api/accounts/token/refresh/', {
                    refresh: refreshToken
                });
                
                const { access } = response.data;
                setAuthToken(access);
                
                originalRequest.headers['Authorization'] = `Bearer ${access}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // Refresh token expired, logout user
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setAuthToken(null);
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;
