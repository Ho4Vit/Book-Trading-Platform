import { apiClient } from "@/api/apiClient.js";

export const cartApi = {
    addToCart: (data) => apiClient.post(`/v1/cart/add`, data),
    removeFromCart: (userId, bookId) => apiClient.post(`/v1/cart/remove/`, { userId: userId, bookId: bookId }),
    getCartByCustomerId: (customerId) => apiClient.get(`/v1/cart/get/${customerId}`),
};