import { apiClient } from '../api/client';
import { ApiResponse, AuditLogResponse } from '../types';

export const auditService = {
  getAll: async (): Promise<ApiResponse<AuditLogResponse[]>> => {
    const response = await apiClient.get<ApiResponse<AuditLogResponse[]>>('/api/v1/audit-logs');
    return response.data;
  },

  getByEntity: async (entityName: string, entityId: number): Promise<ApiResponse<AuditLogResponse[]>> => {
    const response = await apiClient.get<ApiResponse<AuditLogResponse[]>>(`/api/v1/audit-logs/entity/${entityName}/${entityId}`);
    return response.data;
  },
};
