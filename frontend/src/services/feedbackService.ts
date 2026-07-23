import { apiClient } from '../api/client';
import { ApiResponse } from '../types';

export interface FeedbackResponse {
  id: number;
  ticketId: number;
  userId: number;
  userName: string;
  rating: number;
  comments: string;
  createdAt: string;
}

export interface CreateFeedbackRequest {
  ticketId: number;
  rating: number;
  comments: string;
}

export const feedbackService = {
  submitFeedback: async (data: CreateFeedbackRequest): Promise<ApiResponse<FeedbackResponse>> => {
    const response = await apiClient.post<ApiResponse<FeedbackResponse>>('/api/v1/feedbacks', data);
    return response.data;
  },

  getFeedbackByTicket: async (ticketId: number): Promise<ApiResponse<FeedbackResponse>> => {
    const response = await apiClient.get<ApiResponse<FeedbackResponse>>(`/api/v1/feedbacks/ticket/${ticketId}`);
    return response.data;
  },
};
