import { apiClient } from '../api/client';
import { ApiResponse } from '../types';

export interface CommentResponse {
  id: number;
  ticketId: number;
  userId: number;
  userName: string;
  userRole: string;
  content: string;
  createdAt: string;
}

export interface CreateCommentRequest {
  ticketId: number;
  content: string;
}

export const commentService = {
  addComment: async (data: CreateCommentRequest): Promise<ApiResponse<CommentResponse>> => {
    const response = await apiClient.post<ApiResponse<CommentResponse>>('/api/v1/comments', data);
    return response.data;
  },

  getCommentsByTicket: async (ticketId: number): Promise<ApiResponse<CommentResponse[]>> => {
    const response = await apiClient.get<ApiResponse<CommentResponse[]>>(`/api/v1/comments/ticket/${ticketId}`);
    return response.data;
  },
};
