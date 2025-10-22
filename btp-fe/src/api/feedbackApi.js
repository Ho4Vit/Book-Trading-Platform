import { apiClient } from "@/api/apiClient.js";

export const feedbackApi = {
    feedbackCreate: (data) => apiClient.post(`/feedbacks/create`, data, {skipSuccessToast: true}),
    getFeedbackById: (id) => apiClient.get(`/feedbacks/get/${id}`, ),
    getFeedbackAll: () => apiClient.get(`/feedbacks/getall`),
    getAverageRating: (id) => apiClient.get(`/feedbacks/average-rating/${id}`),
    deleteFeedback: (id) => apiClient.delete(`/feedbacks/delete/${id}`, {skipSuccessToast: true}),
};