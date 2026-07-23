package com.csms.calendar.service.impl;

import com.csms.calendar.dto.request.CreateBusinessHoursRequest;
import com.csms.calendar.dto.request.CreateHolidayRequest;
import com.csms.calendar.dto.response.BusinessHoursResponse;
import com.csms.calendar.dto.response.HolidayResponse;
import com.csms.calendar.entity.BusinessHours;
import com.csms.calendar.entity.Holiday;
import com.csms.calendar.mapper.CalendarMapper;
import com.csms.calendar.repository.BusinessHoursRepository;
import com.csms.calendar.repository.HolidayRepository;
import com.csms.calendar.service.CalendarService;
import com.csms.common.response.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business hours and holidays are global scheduling configuration owned
 * exclusively by Super Admin (per business vision: "Configure working
 * hours", "Configure holidays"). SlaCalculator reads this data to compute
 * working-hours-aware SLA deadlines, so changes here directly affect
 * every future ticket's response/resolution countdown.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CalendarServiceImpl implements CalendarService {

    private final BusinessHoursRepository businessHoursRepository;
    private final HolidayRepository holidayRepository;
    private final CalendarMapper calendarMapper;

    @Override
    public ApiResponse<BusinessHoursResponse> createBusinessHours(CreateBusinessHoursRequest request) {

        validateTimeRange(request.getStartTime(), request.getEndTime());

        businessHoursRepository.findByDayOfWeekAndActiveTrue(request.getDayOfWeek())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "Business hours already configured for day " + request.getDayOfWeek()
                                    + ". Update the existing entry instead.");
                });

        BusinessHours hours = new BusinessHours();
        hours.setDayOfWeek(request.getDayOfWeek());
        hours.setStartTime(request.getStartTime());
        hours.setEndTime(request.getEndTime());

        hours = businessHoursRepository.save(hours);

        return ApiResponse.success("Business hours created successfully", calendarMapper.toResponse(hours));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<BusinessHoursResponse>> getAllBusinessHours() {

        List<BusinessHoursResponse> hours = businessHoursRepository.findByActiveTrueOrderByDayOfWeekAsc()
                .stream()
                .map(calendarMapper::toResponse)
                .toList();

        return ApiResponse.success("Business hours fetched successfully", hours);
    }

    @Override
    public ApiResponse<BusinessHoursResponse> updateBusinessHours(Long id, CreateBusinessHoursRequest request) {

        validateTimeRange(request.getStartTime(), request.getEndTime());

        BusinessHours hours = businessHoursRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Business hours entry not found"));

        businessHoursRepository.findByDayOfWeekAndActiveTrue(request.getDayOfWeek())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "Another active business hours entry already exists for day " + request.getDayOfWeek());
                });

        hours.setDayOfWeek(request.getDayOfWeek());
        hours.setStartTime(request.getStartTime());
        hours.setEndTime(request.getEndTime());

        hours = businessHoursRepository.save(hours);

        return ApiResponse.success("Business hours updated successfully", calendarMapper.toResponse(hours));
    }

    @Override
    public ApiResponse<String> deleteBusinessHours(Long id) {

        BusinessHours hours = businessHoursRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Business hours entry not found"));

        hours.setActive(false);
        businessHoursRepository.save(hours);

        return ApiResponse.success("Business hours deleted successfully", null);
    }

    @Override
    public ApiResponse<HolidayResponse> createHoliday(CreateHolidayRequest request) {

        holidayRepository.findByHolidayDateAndActiveTrue(request.getHolidayDate())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("A holiday is already configured for " + request.getHolidayDate());
                });

        Holiday holiday = new Holiday();
        holiday.setHolidayDate(request.getHolidayDate());
        holiday.setName(request.getName());

        holiday = holidayRepository.save(holiday);

        return ApiResponse.success("Holiday created successfully", calendarMapper.toResponse(holiday));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<HolidayResponse>> getAllHolidays() {

        List<HolidayResponse> holidays = holidayRepository.findByActiveTrueOrderByHolidayDateAsc()
                .stream()
                .map(calendarMapper::toResponse)
                .toList();

        return ApiResponse.success("Holidays fetched successfully", holidays);
    }

    @Override
    public ApiResponse<HolidayResponse> updateHoliday(Long id, CreateHolidayRequest request) {

        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Holiday not found"));

        holidayRepository.findByHolidayDateAndActiveTrue(request.getHolidayDate())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Another active holiday already exists on " + request.getHolidayDate());
                });

        holiday.setHolidayDate(request.getHolidayDate());
        holiday.setName(request.getName());

        holiday = holidayRepository.save(holiday);

        return ApiResponse.success("Holiday updated successfully", calendarMapper.toResponse(holiday));
    }

    @Override
    public ApiResponse<String> deleteHoliday(Long id) {

        Holiday holiday = holidayRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Holiday not found"));

        holiday.setActive(false);
        holidayRepository.save(holiday);

        return ApiResponse.success("Holiday deleted successfully", null);
    }

    private void validateTimeRange(java.time.LocalTime start, java.time.LocalTime end) {
        if (start != null && end != null && !start.isBefore(end)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
    }
}
