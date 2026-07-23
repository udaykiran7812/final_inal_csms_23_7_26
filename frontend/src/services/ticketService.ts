import { apiClient } from '../api/client';
import { 
  ApiResponse, 
  CreateTicketRequest, 
  TicketResponse, 
  UpdateTicketStatusRequest, 
  UpdateTicketPriorityRequest, 
  AssignStaffRequest 
} from '../types';

export const ticketService = {
  create: async (data: CreateTicketRequest): Promise<ApiResponse<TicketResponse>> => {
    const response = await apiClient.post<ApiResponse<TicketResponse>>('/api/v1/tickets', data);
    return response.data;
  },

  getAll: async (): Promise<ApiResponse<TicketResponse[]>> => {
    const response = await apiClient.get<ApiResponse<TicketResponse[]>>('/api/v1/tickets');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<TicketResponse>> => {
    const response = await apiClient.get<ApiResponse<TicketResponse>>(`/api/v1/tickets/${id}`);
    return response.data;
  },

  updateStatus: async (id: number, data: UpdateTicketStatusRequest): Promise<ApiResponse<TicketResponse>> => {
    const response = await apiClient.patch<ApiResponse<TicketResponse>>(`/api/v1/tickets/${id}/status`, data);
    return response.data;
  },

  assignStaff: async (id: number, data: AssignStaffRequest): Promise<ApiResponse<TicketResponse>> => {
    const response = await apiClient.patch<ApiResponse<TicketResponse>>(`/api/v1/tickets/${id}/assign`, data);
    return response.data;
  },

  updatePriority: async (id: number, data: UpdateTicketPriorityRequest): Promise<ApiResponse<TicketResponse>> => {
    const response = await apiClient.patch<ApiResponse<TicketResponse>>(`/api/v1/tickets/${id}/priority`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/api/v1/tickets/${id}`);
    return response.data;
  },

  clearAll: async (): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>('/api/v1/tickets/clear-all');
    return response.data;
  },
};
