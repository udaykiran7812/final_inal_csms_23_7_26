import { apiClient } from '../api/client';
import {
  ApiResponse,
  BusinessHoursResponse,
  CreateBusinessHoursRequest,
  HolidayResponse,
  CreateHolidayRequest,
} from '../types';

export const calendarService = {
  // Business Hours
  getAllBusinessHours: async (): Promise<ApiResponse<BusinessHoursResponse[]>> => {
    const response = await apiClient.get<ApiResponse<BusinessHoursResponse[]>>('/api/v1/calendar/business-hours');
    return response.data;
  },

  createBusinessHours: async (data: CreateBusinessHoursRequest): Promise<ApiResponse<BusinessHoursResponse>> => {
    const response = await apiClient.post<ApiResponse<BusinessHoursResponse>>('/api/v1/calendar/business-hours', data);
    return response.data;
  },

  updateBusinessHours: async (id: number, data: CreateBusinessHoursRequest): Promise<ApiResponse<BusinessHoursResponse>> => {
    const response = await apiClient.put<ApiResponse<BusinessHoursResponse>>(`/api/v1/calendar/business-hours/${id}`, data);
    return response.data;
  },

  deleteBusinessHours: async (id: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/api/v1/calendar/business-hours/${id}`);
    return response.data;
  },

  // Holidays
  getAllHolidays: async (): Promise<ApiResponse<HolidayResponse[]>> => {
    const response = await apiClient.get<ApiResponse<HolidayResponse[]>>('/api/v1/calendar/holidays');
    return response.data;
  },

  createHoliday: async (data: CreateHolidayRequest): Promise<ApiResponse<HolidayResponse>> => {
    const response = await apiClient.post<ApiResponse<HolidayResponse>>('/api/v1/calendar/holidays', data);
    return response.data;
  },

  updateHoliday: async (id: number, data: CreateHolidayRequest): Promise<ApiResponse<HolidayResponse>> => {
    const response = await apiClient.put<ApiResponse<HolidayResponse>>(`/api/v1/calendar/holidays/${id}`, data);
    return response.data;
  },

  deleteHoliday: async (id: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/api/v1/calendar/holidays/${id}`);
    return response.data;
  },
};
