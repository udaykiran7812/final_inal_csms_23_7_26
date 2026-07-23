import { apiClient } from '../api/client';
import { ApiResponse, SubDepartmentResponse, CreateSubDepartmentRequest } from '../types';

export const subDepartmentService = {
  getAll: async (): Promise<ApiResponse<SubDepartmentResponse[]>> => {
    const response = await apiClient.get<ApiResponse<SubDepartmentResponse[]>>('/api/v1/sub-departments');
    return response.data;
  },

  getByDepartmentId: async (departmentId: number): Promise<ApiResponse<SubDepartmentResponse[]>> => {
    const response = await apiClient.get<ApiResponse<SubDepartmentResponse[]>>(`/api/v1/sub-departments/department/${departmentId}`);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<SubDepartmentResponse>> => {
    const response = await apiClient.get<ApiResponse<SubDepartmentResponse>>(`/api/v1/sub-departments/${id}`);
    return response.data;
  },

  create: async (data: CreateSubDepartmentRequest): Promise<ApiResponse<SubDepartmentResponse>> => {
    const response = await apiClient.post<ApiResponse<SubDepartmentResponse>>('/api/v1/sub-departments', data);
    return response.data;
  },

  update: async (id: number, data: CreateSubDepartmentRequest): Promise<ApiResponse<SubDepartmentResponse>> => {
    const response = await apiClient.put<ApiResponse<SubDepartmentResponse>>(`/api/v1/sub-departments/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/api/v1/sub-departments/${id}`);
    return response.data;
  },
};
