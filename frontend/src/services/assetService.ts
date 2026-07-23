import { apiClient } from '../api/client';
import { ApiResponse } from '../types';

export interface AssetResponse {
  id: number;
  name: string;
  assetTag: string;
  type: string;
  location: string;
  departmentId: number;
  departmentName: string;
  status: string;
  active: boolean;
  createdAt: string;
}

export interface CreateAssetRequest {
  name: string;
  assetTag: string;
  type: string;
  location: string;
  departmentId: number;
  status: string;
}

export const assetService = {
  createAsset: async (data: CreateAssetRequest): Promise<ApiResponse<AssetResponse>> => {
    const response = await apiClient.post<ApiResponse<AssetResponse>>('/api/v1/assets', data);
    return response.data;
  },

  getAllAssets: async (): Promise<ApiResponse<AssetResponse[]>> => {
    const response = await apiClient.get<ApiResponse<AssetResponse[]>>('/api/v1/assets');
    return response.data;
  },

  getAssetById: async (id: number): Promise<ApiResponse<AssetResponse>> => {
    const response = await apiClient.get<ApiResponse<AssetResponse>>(`/api/v1/assets/${id}`);
    return response.data;
  },

  getAssetsByDepartment: async (departmentId: number): Promise<ApiResponse<AssetResponse[]>> => {
    const response = await apiClient.get<ApiResponse<AssetResponse[]>>(`/api/v1/assets/department/${departmentId}`);
    return response.data;
  },

  updateAsset: async (id: number, data: CreateAssetRequest): Promise<ApiResponse<AssetResponse>> => {
    const response = await apiClient.put<ApiResponse<AssetResponse>>(`/api/v1/assets/${id}`, data);
    return response.data;
  },

  deleteAsset: async (id: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/api/v1/assets/${id}`);
    return response.data;
  },

  getAll: async (): Promise<ApiResponse<AssetResponse[]>> => {
    const response = await apiClient.get<ApiResponse<AssetResponse[]>>('/api/v1/assets');
    return response.data;
  },

  create: async (data: CreateAssetRequest): Promise<ApiResponse<AssetResponse>> => {
    const response = await apiClient.post<ApiResponse<AssetResponse>>('/api/v1/assets', data);
    return response.data;
  },

  getHistory: async (id: number): Promise<ApiResponse<import('../types').TicketResponse[]>> => {
    const response = await apiClient.get<ApiResponse<import('../types').TicketResponse[]>>(`/api/v1/assets/${id}/history`);
    return response.data;
  },
};
