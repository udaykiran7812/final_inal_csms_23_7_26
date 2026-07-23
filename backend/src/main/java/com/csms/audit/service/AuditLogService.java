package com.csms.audit.service;

import com.csms.common.response.ApiResponse;
import com.csms.audit.dto.AuditLogResponse;

import java.util.List;

public interface AuditLogService {
    void logEvent(String userEmail, String action, String entityName, Long entityId, String oldValue, String newValue);
    ApiResponse<List<AuditLogResponse>> getAuditLogs();
}
