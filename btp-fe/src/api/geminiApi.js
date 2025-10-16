import { apiClient } from "@/api/apiClient.js";

export const geminiApi = {
    getAllGemini: () => apiClient.get(`/chatbot`),
};