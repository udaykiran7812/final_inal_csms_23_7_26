import { apiClient } from '../api/client';
import { ApiResponse } from '../types';

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getMyNotifications: async (): Promise<ApiResponse<NotificationResponse[]>> => {
    const response = await apiClient.get<ApiResponse<NotificationResponse[]>>('/api/v1/notifications');
    return response.data;
  },

  markAsRead: async (id: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.patch<ApiResponse<string>>(`/api/v1/notifications/${id}/read`);
    return response.data;
  },
};
