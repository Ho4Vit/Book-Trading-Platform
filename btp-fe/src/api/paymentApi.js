import { apiClient } from "@/api/apiClient.js";

export const paymentApi = {
    createPayment: (data) => apiClient.post(`/payments/create`, data),
    createMomo: (data) => apiClient.post(`/payments/momo/create`, data),
    callbackMomo: (data) => apiClient.post(`/payments/momo/callback`, data, { skipSuccessToast: true }),
    getAllPayment: () => apiClient.get(`/payments/all`),
    getPayment: (paymentId) => apiClient.get(`/payments/get/${paymentId}`),
    updateStatusPayment: (paymentId, status) => apiClient.put(`/payments/status/${paymentId}`, { status }),
};