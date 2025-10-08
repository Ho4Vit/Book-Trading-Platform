import axios from 'axios';

// ✅ Base URL KHÔNG có /api phía sau (vì ta sẽ thêm ở từng request)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 giây
});

// === Request Interceptor ===
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
            config.headers.Authorization = bearerToken;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// === Response Interceptor ===
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('role');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
