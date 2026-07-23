import { apiClient } from '../api/client';
import { ApiResponse, PriorityResponse, CreatePriorityRequest } from '../types';

export const priorityService = {
  getAll: async (): Promise<ApiResponse<PriorityResponse[]>> => {
    const response = await apiClient.get<ApiResponse<PriorityResponse[]>>('/api/v1/priorities');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<PriorityResponse>> => {
    const response = await apiClient.get<ApiResponse<PriorityResponse>>(`/api/v1/priorities/${id}`);
    return response.data;
  },

  create: async (data: CreatePriorityRequest): Promise<ApiResponse<PriorityResponse>> => {
    const response = await apiClient.post<ApiResponse<PriorityResponse>>('/api/v1/priorities', data);
    return response.data;
  },

  update: async (id: number, data: CreatePriorityRequest): Promise<ApiResponse<PriorityResponse>> => {
    const response = await apiClient.put<ApiResponse<PriorityResponse>>(`/api/v1/priorities/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/api/v1/priorities/${id}`);
    return response.data;
  },
};
