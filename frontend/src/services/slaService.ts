import { apiClient } from '../api/client';
import { ApiResponse, SlaRuleResponse, CreateSlaRuleRequest } from '../types';

export const slaService = {
  getAll: async (): Promise<ApiResponse<SlaRuleResponse[]>> => {
    const response = await apiClient.get<ApiResponse<SlaRuleResponse[]>>('/api/v1/sla-rules');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<SlaRuleResponse>> => {
    const response = await apiClient.get<ApiResponse<SlaRuleResponse>>(`/api/v1/sla-rules/${id}`);
    return response.data;
  },

  create: async (data: CreateSlaRuleRequest): Promise<ApiResponse<SlaRuleResponse>> => {
    const response = await apiClient.post<ApiResponse<SlaRuleResponse>>('/api/v1/sla-rules', data);
    return response.data;
  },

  update: async (id: number, data: CreateSlaRuleRequest): Promise<ApiResponse<SlaRuleResponse>> => {
    const response = await apiClient.put<ApiResponse<SlaRuleResponse>>(`/api/v1/sla-rules/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/api/v1/sla-rules/${id}`);
    return response.data;
  },

  getRequests: async (): Promise<ApiResponse<import('../types').SlaChangeRequestResponse[]>> => {
    const response = await apiClient.get<ApiResponse<import('../types').SlaChangeRequestResponse[]>>('/api/v1/sla-requests');
    return response.data;
  },

  submitRequest: async (data: import('../types').CreateSlaChangeRequest): Promise<ApiResponse<import('../types').SlaChangeRequestResponse>> => {
    const response = await apiClient.post<ApiResponse<import('../types').SlaChangeRequestResponse>>('/api/v1/sla-requests', data);
    return response.data;
  },

  approveRequest: async (id: number, notes?: string): Promise<ApiResponse<import('../types').SlaChangeRequestResponse>> => {
    const response = await apiClient.post<ApiResponse<import('../types').SlaChangeRequestResponse>>(`/api/v1/sla-requests/${id}/approve`, { notes });
    return response.data;
  },

  rejectRequest: async (id: number, notes?: string): Promise<ApiResponse<import('../types').SlaChangeRequestResponse>> => {
    const response = await apiClient.post<ApiResponse<import('../types').SlaChangeRequestResponse>>(`/api/v1/sla-requests/${id}/reject`, { notes });
    return response.data;
  },
};
