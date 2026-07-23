import { apiClient } from '../api/client';
import { ApiResponse, CreateUserRequest, UserResponse } from '../types';

export const userService = {
  createUser: async (data: CreateUserRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.post<ApiResponse<UserResponse>>('/api/v1/users', data);
    return response.data;
  },

  getAllUsers: async (): Promise<ApiResponse<UserResponse[]>> => {
    const response = await apiClient.get<ApiResponse<UserResponse[]>>('/api/v1/users');
    return response.data;
  },

  getUserById: async (id: number): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.get<ApiResponse<UserResponse>>(`/api/v1/users/${id}`);
    return response.data;
  },

  updateUser: async (id: number, data: CreateUserRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.put<ApiResponse<UserResponse>>(`/api/v1/users/${id}`, data);
    return response.data;
  },

  resetPassword: async (id: number, password?: string): Promise<ApiResponse<string>> => {
    const response = await apiClient.post<ApiResponse<string>>(`/api/v1/users/${id}/reset-password`, { password });
    return response.data;
  },

  deleteUser: async (id: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/api/v1/users/${id}`);
    return response.data;
  },
};
