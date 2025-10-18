import { apiClient } from "@/api/apiClient.js";

export const bookApi = {
    createBook: (data) => apiClient.post(`/v1/books/create`, data),
    imageBooks: (id, data) => apiClient.post(`/v1/books/image/${id}`, data),
    getAllBooks: () => apiClient.get(`/v1/books/all`),
    getBookById: (id) => apiClient.get(`/v1/books/get/${id}`),
    searchBooks: (query) => apiClient.get(`/v1/books/search`, { params: { q: query } }),
    updateBooks: (id, data) => apiClient.put(`/v1/books/update/${id}`, data),
    deleteBooks: (id) => apiClient.delete(`/v1/books/delete/${id}`),
};