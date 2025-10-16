import { apiClient } from "@/api/apiClient.js";

export const seriesApi = {
    getAllSeries: () => apiClient.get(`/v1/series/all`),
    getSeriesById: (seriesId) => apiClient.get(`/v1/series/${seriesId}`),
    createSeries: (data) => apiClient.post(`/v1/series/create`, data),
    updateSeries: (seriesId, data) => apiClient.put(`/v1/series/update/${seriesId}`, data),
};