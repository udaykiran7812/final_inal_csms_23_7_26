import { apiClient } from '../api/client';
import { LoginRequest, LoginResponse } from '../types';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', data);
    return response.data;
  },
};
