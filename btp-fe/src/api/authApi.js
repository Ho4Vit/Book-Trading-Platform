import { apiClient } from "@/api/apiClient.js";

export const authApi = {
    login: (data) => apiClient.post(`/auth/login`, data),
    logout: () => apiClient.post(`/auth/logout`),
    otpLogin: (data) => apiClient.post(`/auth/otp`, data, { skipSuccessToast: true }),
    verifyOtp: (data) => apiClient.post(`/auth/verify-otp`, data, { skipSuccessToast: true }),
    forgotPassword: (data) => apiClient.post(`/auth/forgot-password`, data, { skipSuccessToast: true }),
};