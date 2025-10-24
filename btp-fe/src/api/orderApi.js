import { apiClient } from "@/api/apiClient.js";

export const orderApi = {
    getAllOrders: () => apiClient.get(`/orders/all`),
    getOrdersByCustomerId: (customerId) => apiClient.get(`/orders/customer/${customerId}`),
    getOrderById: (orderId) => apiClient.get(`/orders/getbyid/${orderId}`),
    getOrderBySellerId: (sellerId) => apiClient.get(`/orders/seller/${sellerId}`),
    updateStatus: (orderId, status) => apiClient.put(`/orders/status/${orderId}`, { status }, { skipSuccessToast: true }),
    cancelOrder: (orderId) => apiClient.post(`/orders/cancel/${orderId}`, {}, { skipSuccessToast: true }),
    createOrder: (data) => apiClient.post(`/orders/create`, data, { skipSuccessToast: true }),
};