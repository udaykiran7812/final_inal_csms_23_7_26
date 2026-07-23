import { apiClient } from '../api/client';
import { ApiResponse, CreateRoleRequest, RoleResponse } from '../types';

export const roleService = {
  createRole: async (data: CreateRoleRequest): Promise<ApiResponse<RoleResponse>> => {
    const response = await apiClient.post<ApiResponse<RoleResponse>>('/api/v1/roles', data);
    return response.data;
  },

  getAllRoles: async (): Promise<ApiResponse<RoleResponse[]>> => {
    const response = await apiClient.get<ApiResponse<RoleResponse[]>>('/api/v1/roles');
    return response.data;
  },

  getRolesByDepartmentId: async (departmentId: number): Promise<ApiResponse<RoleResponse[]>> => {
    const response = await apiClient.get<ApiResponse<RoleResponse[]>>(`/api/v1/roles/department/${departmentId}`);
    return response.data;
  },

  getRolesBySubDepartmentId: async (subDepartmentId: number): Promise<ApiResponse<RoleResponse[]>> => {
    const response = await apiClient.get<ApiResponse<RoleResponse[]>>(`/api/v1/roles/sub-department/${subDepartmentId}`);
    return response.data;
  },

  getRoleById: async (id: number): Promise<ApiResponse<RoleResponse>> => {
    const response = await apiClient.get<ApiResponse<RoleResponse>>(`/api/v1/roles/${id}`);
    return response.data;
  },

  updateRole: async (id: number, data: CreateRoleRequest): Promise<ApiResponse<RoleResponse>> => {
    const response = await apiClient.put<ApiResponse<RoleResponse>>(`/api/v1/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/api/v1/roles/${id}`);
    return response.data;
  },
};
