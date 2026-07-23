package com.csms.audit.controller;

import com.csms.common.response.ApiResponse;
import com.csms.audit.dto.AuditLogResponse;
import com.csms.audit.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ApiResponse<List<AuditLogResponse>> getAuditLogs() {
        return auditLogService.getAuditLogs();
    }
}
