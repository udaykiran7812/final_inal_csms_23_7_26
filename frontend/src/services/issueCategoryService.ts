import { apiClient } from '../api/client';
import { ApiResponse, CreateIssueCategoryRequest, IssueCategoryResponse } from '../types';

export const issueCategoryService = {
  create: async (data: CreateIssueCategoryRequest): Promise<ApiResponse<IssueCategoryResponse>> => {
    const response = await apiClient.post<ApiResponse<IssueCategoryResponse>>('/api/v1/issue-categories', data);
    return response.data;
  },

  getAll: async (): Promise<ApiResponse<IssueCategoryResponse[]>> => {
    const response = await apiClient.get<ApiResponse<IssueCategoryResponse[]>>('/api/v1/issue-categories');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<IssueCategoryResponse>> => {
    const response = await apiClient.get<ApiResponse<IssueCategoryResponse>>(`/api/v1/issue-categories/${id}`);
    return response.data;
  },

  update: async (id: number, data: CreateIssueCategoryRequest): Promise<ApiResponse<IssueCategoryResponse>> => {
    const response = await apiClient.put<ApiResponse<IssueCategoryResponse>>(`/api/v1/issue-categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/api/v1/issue-categories/${id}`);
    return response.data;
  },
};
