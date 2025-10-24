import {apiClient} from "@/api/apiClient.js";

export const discountApi = {
    createDiscount: (data) => apiClient.post(`/discounts/create`, data),
    getAllDiscounts: () => apiClient.get(`/discounts/all`),
    getDiscountAvailbleForUser: (data) => apiClient.post(`/discounts/available`, data, {skipSuccessToast: true}),
    saveUserUseDiscounts: (discountId, userId) => apiClient.post(`/discounts/add-user/${discountId}?userId=${userId}`, {}, {skipSuccessToast: true}),
    booksApplicable: (discountId, data) => apiClient.put(`/discounts/books-applicable/${discountId}`, data, {skipSuccessToast: true}),
    deleteDiscount: (discountId) => apiClient.delete(`/discounts/delete/${discountId}`),
};