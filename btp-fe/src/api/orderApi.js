import { apiClient } from "@/api/apiClient.js";

export const orderApi = {
    getAllOrders: () => apiClient.get(`/orders/all`),
    getOrdersByCustomerId: (customerId) => apiClient.get(`/orders/customer/${customerId}`),
    getOrderById: (orderId) => apiClient.get(`/orders/getbyid/${orderId}`),
    updateStatus: (orderId, status) => apiClient.put(`/orders/status/${orderId}`, { status }, { skipSuccessToast: true }),
    createOrder: (data) => apiClient.post(`/orders/create`, data, { skipSuccessToast: true }),
};