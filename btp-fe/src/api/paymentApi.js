import { apiClient } from "@/api/apiClient.js";

export const paymentApi = {
    createPayment: (data) => apiClient.post(`/payments/create`, data, { skipSuccessToast: true }),
    createMomo: (data) => apiClient.post(`/payments/momo/create`, data, { skipSuccessToast: true }),
    callbackMomo: (data) => apiClient.post(`/payments/momo/callback`, data, { skipSuccessToast: true }),
    confirmPayment: (paymentId) => apiClient.post(`/payments/confirm/${paymentId}`),
    getAllPayment: () => apiClient.get(`/payments/all`),
    getPayment: (paymentId) => apiClient.get(`/payments/get/${paymentId}`),
    updateStatusPayment: (paymentId, status) => apiClient.put(`/payments/status/${paymentId}`, { status }),
};