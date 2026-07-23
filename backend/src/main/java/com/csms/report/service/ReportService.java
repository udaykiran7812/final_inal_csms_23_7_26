package com.csms.report.service;

import com.csms.common.response.ApiResponse;
import com.csms.report.dto.DashboardStatsResponse;

public interface ReportService {
    ApiResponse<DashboardStatsResponse> getDashboardStats(String userEmail);
}
