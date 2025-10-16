import { apiClient } from "@/api/apiClient.js";

export const paymentApi = {
    createPayment: (data) => apiClient.post(`/payments/create`, data),
    getAllPayment: () => apiClient.get(`/payments/all`),
    getPayment: (paymentId) => apiClient.get(`/payments/get/${paymentId}`),
    updateStatusPayment: (paymentId, status) => apiClient.put(`/payments/status/${paymentId}`, { status }),
};