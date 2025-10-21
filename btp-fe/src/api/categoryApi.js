import { apiClient } from "@/api/apiClient.js";

export const categoryApi = {
    getAllCategories: () => apiClient.get(`/v1/categories/all`, { skipSuccessToast: true }),
    getCategoryById: (id) => apiClient.get(`/v1/categories/${id}`, { skipSuccessToast: true }),
    createCategory: (data) => apiClient.post(`/v1/categories/create`, data, { skipSuccessToast: true }),
    updateCategory: (id, data) => apiClient.put(`/v1/categories/${id}`, data, { skipSuccessToast: true }),
};