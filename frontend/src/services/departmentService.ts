import { apiClient } from '../api/client';
import { ApiResponse, CreateDepartmentRequest, DepartmentResponse } from '../types';

export const departmentService = {
  create: async (data: CreateDepartmentRequest): Promise<ApiResponse<DepartmentResponse>> => {
    const response = await apiClient.post<ApiResponse<DepartmentResponse>>('/api/v1/departments', data);
    return response.data;
  },

  getAll: async (): Promise<ApiResponse<DepartmentResponse[]>> => {
    const response = await apiClient.get<ApiResponse<DepartmentResponse[]>>('/api/v1/departments');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<DepartmentResponse>> => {
    const response = await apiClient.get<ApiResponse<DepartmentResponse>>(`/api/v1/departments/${id}`);
    return response.data;
  },

  update: async (id: number, data: CreateDepartmentRequest): Promise<ApiResponse<DepartmentResponse>> => {
    const response = await apiClient.put<ApiResponse<DepartmentResponse>>(`/api/v1/departments/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/api/v1/departments/${id}`);
    return response.data;
  },
};
