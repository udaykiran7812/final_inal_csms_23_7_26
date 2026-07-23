import { apiClient } from '../api/client';
import { ApiResponse } from '../types';

export interface AttachmentResponse {
  id: number;
  ticketId: number;
  fileName: string;
  fileType: string;
  filePath: string;
  uploadedByName: string;
  createdAt: string;
}

export const attachmentService = {
  uploadFile: async (ticketId: number, file: File): Promise<ApiResponse<AttachmentResponse>> => {
    const formData = new FormData();
    formData.append('ticketId', ticketId.toString());
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<AttachmentResponse>>('/api/v1/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAttachments: async (ticketId: number): Promise<ApiResponse<AttachmentResponse[]>> => {
    const response = await apiClient.get<ApiResponse<AttachmentResponse[]>>(`/api/v1/attachments/ticket/${ticketId}`);
    return response.data;
  },
};
