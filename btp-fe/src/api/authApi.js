import { apiClient } from "@/api/apiClient.js";

export const authApi = {
    login: (data) => apiClient.post(`/auth/login`, data),
    logout: () => apiClient.post(`/auth/logout`),
    otpLogin: (data) => apiClient.post(`/auth/otp`, data),
    verifyOtp: (data) => apiClient.post(`/auth/verify-otp`, data),
    forgotPassword: (data) => apiClient.post(`/auth/forgot-password`, data),
};