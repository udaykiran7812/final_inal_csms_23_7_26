package com.csms.calendar.service;

import com.csms.calendar.dto.request.CreateBusinessHoursRequest;
import com.csms.calendar.dto.request.CreateHolidayRequest;
import com.csms.calendar.dto.response.BusinessHoursResponse;
import com.csms.calendar.dto.response.HolidayResponse;
import com.csms.common.response.ApiResponse;

import java.util.List;

public interface CalendarService {

    ApiResponse<BusinessHoursResponse> createBusinessHours(CreateBusinessHoursRequest request);

    ApiResponse<List<BusinessHoursResponse>> getAllBusinessHours();

    ApiResponse<BusinessHoursResponse> updateBusinessHours(Long id, CreateBusinessHoursRequest request);

    ApiResponse<String> deleteBusinessHours(Long id);

    ApiResponse<HolidayResponse> createHoliday(CreateHolidayRequest request);

    ApiResponse<List<HolidayResponse>> getAllHolidays();

    ApiResponse<HolidayResponse> updateHoliday(Long id, CreateHolidayRequest request);

    ApiResponse<String> deleteHoliday(Long id);
}
