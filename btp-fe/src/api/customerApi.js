import { apiClient } from "@/api/apiClient.js";

export const customerApi = {
    registerCustomer: (data) => apiClient.post(`/v1/customers/register`, data, { skipSuccessToast: true }),
    updateCustomer: (id, data) => apiClient.put(`/v1/customers/update/${id}`, data, { skipSuccessToast: true }),
    getCustomerById: (id) => apiClient.get(`/v1/customers/getbyid/${id}`),
    getCustomerByEmail: (email) => apiClient.get(`/v1/customers/getbyemail`, { params: { email } }),
    getAllCustomers: () => apiClient.get(`/v1/customers/getall`),
};