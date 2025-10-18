import { apiClient } from "@/api/apiClient.js";

export const categoryApi = {
    getAllCategories: () => apiClient.get(`/v1/categories/all`),
    getCategoryById: (id) => apiClient.get(`/v1/categories/${id}`),
    createCategory: (data) => apiClient.post(`/v1/categories/create`, data),
    updateCategory: (id, data) => apiClient.put(`/v1/categories/${id}`, data),
};