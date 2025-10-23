import {apiClient} from "@/api/apiClient.js";

export const discountApi = {
    createDiscount: (data) => apiClient.post(`/discounts/create`, data),
    getAllDiscounts: () => apiClient.get(`/discounts/all`),
    getDiscountForUser: (userId, orderValue) => apiClient.get(`/discounts/available?userId=${userId}&orderValue=${orderValue}`),
    saveUserUseDiscounts: (discountId, userId) => apiClient.post(`/discounts/add-user/${discountId}?userId=${userId}`),
    deleteDiscount: (discountId) => apiClient.delete(`/discounts/delete/${discountId}`),
};