const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// ================= AUTH =================
export const AUTH_API = {
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    SEND_OTP: `${API_BASE_URL}/auth/otp`,
    VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
};

// ================= BOOK =================
export const BOOK_API = {
    GET_ALL: `${API_BASE_URL}/v1/books/all`,
    GET_BY_ID: (id) => `${API_BASE_URL}/v1/books/${id}`,
    CREATE: `${API_BASE_URL}/v1/books/create`,
    UPDATE: (id) => `${API_BASE_URL}/v1/books/${id}`,
    DELETE: (id) => `${API_BASE_URL}/v1/books/${id}`,
};

// ================= CATEGORY =================
export const CATEGORY_API = {
    GET_ALL: `${API_BASE_URL}/v1/categories/all`,
    GET_BY_ID: (id) => `${API_BASE_URL}/v1/categories/${id}`,
    CREATE: `${API_BASE_URL}/v1/categories/create`,
    UPDATE: (id) => `${API_BASE_URL}/v1/categories/${id}`,
};

// ================= CART =================
export const CART_API = {
    ADD: `${API_BASE_URL}/v1/cart/add`,
    REMOVE: `${API_BASE_URL}/v1/cart/remove`,
    GET_BY_USER_ID: (userId) => `${API_BASE_URL}/v1/cart/get/${userId}`,
};

// ================= CUSTOMER =================
export const CUSTOMER_API = {
    GET_ALL: `${API_BASE_URL}/v1/customers/getall`,
    GET_BY_ID: (id) => `${API_BASE_URL}/v1/customers/getbyid/${id}`,
    GET_BY_EMAIL: `${API_BASE_URL}/v1/customers/getbyemail`,
    REGISTER: `${API_BASE_URL}/v1/customers/register`,
    UPDATE: (id) => `${API_BASE_URL}/v1/customers/update/${id}`,
};

// ================= ORDER =================
export const ORDER_API = {
    GET_ALL: `${API_BASE_URL}/orders/all`,
    GET_BY_ID: (id) => `${API_BASE_URL}/orders/getbyid/${id}`,
    GET_BY_CUSTOMER_ID: (customerId) => `${API_BASE_URL}/orders/customer/${customerId}`,
    CREATE: `${API_BASE_URL}/orders/create`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/orders/status/${id}`,
};

// ================= PAYMENT =================
export const PAYMENT_API = {
    GET_ALL: `${API_BASE_URL}/payments/all`,
    GET_BY_ID: (id) => `${API_BASE_URL}/payments/get/${id}`,
    CREATE: `${API_BASE_URL}/payments/create`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/payments/status/${id}`,
};

// ================= SELLER =================
export const SELLER_API = {
    GET_ALL: `${API_BASE_URL}/v1/sellers/getall`,
    GET_BY_ID: (id) => `${API_BASE_URL}/v1/sellers/getbyid/${id}`,
    GET_BY_EMAIL: `${API_BASE_URL}/v1/sellers/getbyemail`,
    REGISTER: `${API_BASE_URL}/v1/sellers/register`,
    UPDATE: (id) => `${API_BASE_URL}/v1/sellers/update/${id}`,
};

// ================= SERIES =================
export const SERIES_API = {
    GET_ALL: `${API_BASE_URL}/v1/series/getall`,
    GET_BY_ID: (id) => `${API_BASE_URL}/v1/series/${id}`,
    CREATE: `${API_BASE_URL}/v1/series/create`,
    UPDATE: (id) => `${API_BASE_URL}/v1/series/${id}`,
};
