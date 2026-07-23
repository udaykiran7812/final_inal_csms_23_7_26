import { apiClient } from '../api/client';
import { ApiResponse, DashboardStatsResponse } from '../types';

export const reportService = {
  getDashboardStats: async (): Promise<ApiResponse<DashboardStatsResponse>> => {
    const response = await apiClient.get<ApiResponse<DashboardStatsResponse>>('/api/v1/reports/dashboard');
    return response.data;
  },
};
