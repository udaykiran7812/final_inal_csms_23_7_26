import { apiClient } from '../api/client';
import {
  ApiResponse,
  EscalationRuleResponse,
  CreateEscalationRuleRequest,
  EscalationHistoryResponse,
} from '../types';

export const escalationService = {
  getAll: async (): Promise<ApiResponse<EscalationRuleResponse[]>> => {
    const response = await apiClient.get<ApiResponse<EscalationRuleResponse[]>>('/api/v1/escalation-rules');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<EscalationRuleResponse>> => {
    const response = await apiClient.get<ApiResponse<EscalationRuleResponse>>(`/api/v1/escalation-rules/${id}`);
    return response.data;
  },

  create: async (data: CreateEscalationRuleRequest): Promise<ApiResponse<EscalationRuleResponse>> => {
    const response = await apiClient.post<ApiResponse<EscalationRuleResponse>>('/api/v1/escalation-rules', data);
    return response.data;
  },

  update: async (id: number, data: CreateEscalationRuleRequest): Promise<ApiResponse<EscalationRuleResponse>> => {
    const response = await apiClient.put<ApiResponse<EscalationRuleResponse>>(`/api/v1/escalation-rules/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/api/v1/escalation-rules/${id}`);
    return response.data;
  },

  getHistoryForTicket: async (ticketId: number): Promise<ApiResponse<EscalationHistoryResponse[]>> => {
    const response = await apiClient.get<ApiResponse<EscalationHistoryResponse[]>>(
      `/api/v1/escalation-rules/tickets/${ticketId}/history`
    );
    return response.data;
  },
};
