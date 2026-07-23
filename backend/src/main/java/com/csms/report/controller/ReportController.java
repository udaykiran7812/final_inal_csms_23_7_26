package com.csms.report.controller;

import com.csms.common.response.ApiResponse;
import com.csms.report.dto.DashboardStatsResponse;
import com.csms.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public ApiResponse<DashboardStatsResponse> getDashboardStats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return reportService.getDashboardStats(email);
    }
}
