import api from "@/api/anxiosClient.js"; // axios instance của bạn

export const getAllBooks = async () => {
    try {
        const res = await api.get("/v1/books/all");
        return res.data.data || [];
    } catch (error) {
        console.error("Error fetching books:", error);
        return [];
    }
};

export const getBookById = async (id) => {
    try {
        const res = await api.get(`/v1/books/get/${id}`);
        return res.data.data;
    } catch (error) {
        console.error("Get book error:", error);
        throw error;
    }
};