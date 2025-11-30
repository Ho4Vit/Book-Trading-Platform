import axiosInstance from "@/api/axiosInstance.js";

export const recomendApi = {
    getRecomendations: (description) => axiosInstance.post(`/recommend?description=${encodeURIComponent(description)}`),
};