import { apiClient } from '../api/client';
import { ApiResponse, CreateStaffRequest, StaffResponse } from '../types';

export const staffService = {
  create: async (data: CreateStaffRequest): Promise<ApiResponse<StaffResponse>> => {
    const response = await apiClient.post<ApiResponse<StaffResponse>>('/api/v1/staff', data);
    return response.data;
  },

  getAll: async (): Promise<ApiResponse<StaffResponse[]>> => {
    const response = await apiClient.get<ApiResponse<StaffResponse[]>>('/api/v1/staff');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<StaffResponse>> => {
    const response = await apiClient.get<ApiResponse<StaffResponse>>(`/api/v1/staff/${id}`);
    return response.data;
  },

  update: async (id: number, data: CreateStaffRequest): Promise<ApiResponse<StaffResponse>> => {
    const response = await apiClient.put<ApiResponse<StaffResponse>>(`/api/v1/staff/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/api/v1/staff/${id}`);
    return response.data;
  },
};
