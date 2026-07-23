package com.csms.calendar.controller;

import com.csms.calendar.dto.request.CreateBusinessHoursRequest;
import com.csms.calendar.dto.request.CreateHolidayRequest;
import com.csms.calendar.dto.response.BusinessHoursResponse;
import com.csms.calendar.dto.response.HolidayResponse;
import com.csms.calendar.service.CalendarService;
import com.csms.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Working hours & holiday calendar configuration.
 * Only SUPER_ADMIN may create/update/delete (per business vision).
 * Any authenticated user may read, since the SLA countdown they see
 * on tickets depends on this calendar.
 */
@RestController
@RequestMapping("/api/v1/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    // ---------- Business Hours ----------

    @PostMapping("/business-hours")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<BusinessHoursResponse> createBusinessHours(
            @Valid @RequestBody CreateBusinessHoursRequest request) {
        return calendarService.createBusinessHours(request);
    }

    @GetMapping("/business-hours")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<BusinessHoursResponse>> getAllBusinessHours() {
        return calendarService.getAllBusinessHours();
    }

    @PutMapping("/business-hours/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<BusinessHoursResponse> updateBusinessHours(
            @PathVariable Long id,
            @Valid @RequestBody CreateBusinessHoursRequest request) {
        return calendarService.updateBusinessHours(id, request);
    }

    @DeleteMapping("/business-hours/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<String> deleteBusinessHours(@PathVariable Long id) {
        return calendarService.deleteBusinessHours(id);
    }

    // ---------- Holidays ----------

    @PostMapping("/holidays")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<HolidayResponse> createHoliday(@Valid @RequestBody CreateHolidayRequest request) {
        return calendarService.createHoliday(request);
    }

    @GetMapping("/holidays")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<HolidayResponse>> getAllHolidays() {
        return calendarService.getAllHolidays();
    }

    @PutMapping("/holidays/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<HolidayResponse> updateHoliday(
            @PathVariable Long id,
            @Valid @RequestBody CreateHolidayRequest request) {
        return calendarService.updateHoliday(id, request);
    }

    @DeleteMapping("/holidays/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<String> deleteHoliday(@PathVariable Long id) {
        return calendarService.deleteHoliday(id);
    }
}
