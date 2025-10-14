import api from "@/api/anxiosClient.js";

export const registerSeller = async (sellerData) => {
    try{
        const res = await api.post(`/v1/sellers/register`, sellerData);
        return res.data.data || null;
    }
    catch(error){
        console.error("Error registering seller:", error);
        throw error;
    }
}

export const updateSeller = async (id, updatedData) => {
    try{
        const res = await api.put(`/v1/sellers/update/${id}`, updatedData);
        return res.data.data || null;
    }
    catch(error){
        console.error("Error updating seller:", error);
        throw error;
    }
}

export const getSellerById = async (id) => {
    try{
        const res = await api.get(`/v1/sellers/getbyid/${id}`);
        return res.data.data || null;
    }
    catch(error){
        console.error("Error fetching seller by ID:", error);
        throw error;
    }
}

export const getSellerByEmail = async (email) => {
    try{
        const res = await api.get(`/v1/sellers/getbyemail`, email);
        return res.data.data || null;
    }
    catch(error){
        console.error("Error fetching seller by email:", error);
        throw error;
    }
}

export const getAllSellers = async () => {
    try{
        const res = await api.get(`/v1/sellers/getall`);
        return res.data.data || [];
    }
    catch(error){
        console.error("Error fetching all sellers:", error);
        throw error;
    }
}

export const updateAvatar = async (id, avatarData) => {
    try{
        const res = await api.put(`/v1/sellers/avartat/${id}`, avatarData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data.data || null;
    }
    catch(error){
        console.error("Error updating seller avatar:", error);
        throw error;
    }
}