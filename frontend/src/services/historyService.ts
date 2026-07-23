import { apiClient } from '../api/client';
import { ApiResponse, TicketHistoryResponse } from '../types';

export const historyService = {
  getByTicketId: async (ticketId: number): Promise<ApiResponse<TicketHistoryResponse[]>> => {
    const response = await apiClient.get<ApiResponse<TicketHistoryResponse[]>>(`/api/v1/tickets/${ticketId}/history`);
    return response.data;
  },
};
