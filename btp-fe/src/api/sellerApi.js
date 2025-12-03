import { apiClient } from "@/api/apiClient.js";

export const sellerApi = {
    registerSeller: (data) => apiClient.post(`/v1/sellers/register`, data, { skipSuccessToast: true }),
    updateSeller: (id, data) => apiClient.post(`/v1/sellers/update/${id}`, data, { skipSuccessToast: true }),
    getSellerById: (id) => apiClient.get(`/v1/sellers/getbyid/${id}`),
    getSellerByEmail: (email) => apiClient.get(`/v1/sellers/getbyemail`, { params: { email } }),
    getAllSellers: () => apiClient.get(`/v1/sellers/getall`),
    updateAvatar: (id, data) => apiClient.post(`/v1/sellers/avatar/${id}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),
    staticsSellerById: (sellerId) => apiClient.get(`/v1/sellers/seller/${sellerId}`),
    staticsSellerMonthly: (sellerId, month, year) => apiClient.get(`/v1/sellers/monthly?sellerId=${sellerId}&month=${month}&year=${year}`),
    staticsSellerAll: () => apiClient.get(`/v1/sellers/all`),
};