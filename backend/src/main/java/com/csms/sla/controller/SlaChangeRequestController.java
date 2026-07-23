package com.csms.sla.controller;

import com.csms.common.response.ApiResponse;
import com.csms.sla.dto.request.CreateSlaChangeRequest;
import com.csms.sla.dto.response.SlaChangeRequestResponse;
import com.csms.sla.service.SlaChangeRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/sla-requests")
@RequiredArgsConstructor
public class SlaChangeRequestController {

    private final SlaChangeRequestService slaChangeRequestService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DEPARTMENT_ADMIN')")
    public ApiResponse<SlaChangeRequestResponse> submitRequest(
            @Valid @RequestBody CreateSlaChangeRequest request,
            Authentication auth) {
        return slaChangeRequestService.submitRequest(request, auth.getName());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'DEPARTMENT_ADMIN')")
    public ApiResponse<List<SlaChangeRequestResponse>> getAllRequests() {
        return slaChangeRequestService.getAllRequests();
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<SlaChangeRequestResponse> approveRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        return slaChangeRequestService.approveRequest(id, notes);
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<SlaChangeRequestResponse> rejectRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("notes") : null;
        return slaChangeRequestService.rejectRequest(id, notes);
    }
}
