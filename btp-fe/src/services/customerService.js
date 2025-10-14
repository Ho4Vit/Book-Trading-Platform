import api from "@/api/anxiosClient.js";


export const register = async (userData) => {
    try{
        const res = await api.post("/v1/customers/register", userData);
        return res.data.data || null;
    }
    catch(error){
        console.error("Error registering customer:", error);
        throw error;
    }
}

export const updateCustomer =  async (id, updatedData) => {
    try{
        const res = await api.put(`/v1/customers/update/${id}`, updatedData);
        return res.data.data || null;
    }
    catch(error){
        console.error("Error updating customer:", error);
        throw error;
    }
}

export const getCustomerById = async (id) => {
    try{
        const res = await api.get(`/v1/customers/getbyid/${id}`);
        return res.data.data || null;
    }
    catch(error){
        console.error("Error fetching customer by ID:", error);
        throw error;
    }
}

export const getCustomerByEmail = async (email) => {
    try{
        const res = await api.get(`/v1/customers/getbyemail`, email);
        return res.data.data || null;
    }
    catch(error){
        console.error("Error fetching customer by email:", error);
        throw error;
    }
}

export const getAllCustomers = async () => {
    try{
        const res = await api.get(`/v1/customers/getall`);
        return res.data.data || [];
    }
    catch(error){
        console.error("Error fetching all customers:", error);
        throw error;
    }
}