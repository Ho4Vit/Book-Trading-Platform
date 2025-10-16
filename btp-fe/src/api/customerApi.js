import { apiClient } from "@/api/apiClient.js";

export const customerApi = {
    registerCustomer: (data) => apiClient.post(`/v1/customers/register`, data),
    updateCustomer: (id, data) => apiClient.put(`/v1/customers/update/${id}`, data),
    getCustomerById: (id) => apiClient.get(`/v1/customers/getbyid/${id}`),
    getCustomerByEmail: (email) => apiClient.get(`/v1/customers/getbyemail`, { params: { email } }),
    getAllCustomers: () => apiClient.get(`/v1/customers/getall`),
};