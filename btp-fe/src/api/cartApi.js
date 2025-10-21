import { apiClient } from "@/api/apiClient.js";

export const cartApi = {
    addToCart: (data) => apiClient.post(`/v1/cart/add`, data, {skipSuccessToast: true}),
    removeFromCart: (userId, bookId) => apiClient.post(`/v1/cart/remove`, { userId: userId, bookId: bookId }, {skipSuccessToast: true}),
    getCartByCustomerId: (customerId) => apiClient.get(`/v1/cart/get/${customerId}`),
};