import api from "@/api/anxiosClient.js";

export const loginUser = async (data) => {
    try {
        const res = await api.post("/auth/login", data);
        return res.data;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        const res = await api.post("/auth/logout");
        localStorage.clear();
        return res.data;
    } catch (error) {
        console.error("Logout error:", error);
        throw error;
    }
};
