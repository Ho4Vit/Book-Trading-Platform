import { apiClient } from "@/api/apiClient.js";
import axios from "axios";

export const paymentApi = {
    createPayment: (data) => apiClient.post(`/payments/create`, data, { skipSuccessToast: true }),
    createVNPay: (orderId) => apiClient.post(`/payments/vnpay/${orderId}`),
    callbackVNPay: async (params) => {
        const queryString = new URLSearchParams(params).toString();
        const url = `/payments/vnpay-return?${queryString}`;
        return axios.get(url);
    },
    confirmPayment: (paymentId) => apiClient.post(`/payments/confirm/${paymentId}`),
    getAllPayment: () => apiClient.get(`/payments/all`),
    getPayment: (paymentId) => apiClient.get(`/payments/get/${paymentId}`),
    updateStatusPayment: (paymentId, status) => apiClient.put(`/payments/status/${paymentId}`, { status }),
};